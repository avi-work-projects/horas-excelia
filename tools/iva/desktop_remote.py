"""One-shot SSH adapter for the desktop. No service installation or scheduler.

Executed over the existing SSH identity; payloads use stdin, not shell arguments.
The existing service lock and fiscal modules remain authoritative.
"""
import base64
from contextlib import contextmanager
from email import policy
from email.parser import BytesParser
from email.utils import parseaddr
import imaplib
import json
from pathlib import Path
import re
import ssl
import sys
import types


def pack(response):
    if response is None:
        raise ValueError('Ruta no disponible')
    status, body, *rest = response
    raw = body if isinstance(body, bytes) else body.encode('utf-8')
    return dict(status=status, body=base64.b64encode(raw).decode(),
                mime=rest[0] if rest else 'text/html; charset=utf-8',
                headers=rest[1] if len(rest) > 1 else {})


def attachments(raw, order):
    """Candidates only. Never infer an issuer, invoice status or deductibility."""
    message = BytesParser(policy=policy.default).parsebytes(raw)
    sender = parseaddr(str(message.get('From', '')))[1].lower()
    domain = sender.rsplit('@', 1)[-1]
    if domain != 'amazon.es' and not domain.endswith('.amazon.es'):
        return []
    texts = [str(message.get('Subject', ''))]
    parts = list(message.walk())
    for part in parts:
        if part.get_content_type() in ('text/plain', 'text/html'):
            try:
                texts.append(part.get_content())
            except (LookupError, UnicodeError):
                pass
    if order not in '\n'.join(texts):
        return []
    documents = []
    for part in parts:
        name = part.get_filename() or 'documento.pdf'
        if part.get_content_type() != 'application/pdf' and not name.lower().endswith('.pdf'):
            continue
        content = part.get_payload(decode=True) or b''
        if not content.startswith(b'%PDF-') or len(content) > 8 * 1024 * 1024:
            continue
        documents.append(dict(filename=Path(name.replace('\\', '/')).name,
                              pdf=base64.b64encode(content).decode(),
                              message_id=str(message.get('Message-ID', ''))[:500],
                              received=str(message.get('Date', ''))[:200],
                              sender=sender))
    return documents


def collect_mail(root, data):
    order = data.get('order', '')
    if not re.fullmatch(r'[0-9]{3}-[0-9]{7}-[0-9]{7}', order):
        raise ValueError('Pedido no válido')
    # Account and secret are the existing Business mail configuration. No copy
    # of the password is returned, written locally, or included in errors.
    import ast
    tree = ast.parse((root/'service.py').read_text(encoding='utf-8-sig'))
    owners = [ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign)
              and any(isinstance(t, ast.Name) and t.id == 'OWNER' for t in n.targets)]
    if len(owners) != 1 or owners[0] != data.get('account'):
        raise ValueError('La cuenta de correo no coincide con Amazon Business')
    try:
        secret = (root/'smtp-password').read_text().strip()
        with imaplib.IMAP4_SSL('imap.gmail.com', ssl_context=ssl.create_default_context(), timeout=25) as mail:
            mail.login(owners[0], secret)
            # All Mail includes archived invoices; XLIST's special-use flag is
            # independent of the user's Gmail language. INBOX is a last resort.
            status, boxes = mail.list()
            selected = None
            if status == 'OK':
                for box in boxes or []:
                    if box and (b'\\All ' in box or b'\\All)' in box or b'\\AllMail' in box):
                        match = re.search(rb'\)\s+(?:"[^"]*"|NIL)\s+(.+)$', box)
                        if match:
                            selected = match.group(1).decode('ascii')
                            break
            status, _ = mail.select(selected or 'INBOX', readonly=True)
            if status != 'OK':
                raise ValueError('No se pudo abrir el buzón de consulta')
            status, ids = mail.uid('search', None, 'FROM', '"amazon.es"', 'TEXT', '"'+order+'"')
            if status != 'OK':
                raise ValueError('No se pudo consultar este pedido en el correo')
            identifiers = ids[0].split() if ids and ids[0] else []
            documents, skipped = [], 0
            for uid in identifiers[-20:]:
                state, sizes = mail.uid('fetch', uid, '(RFC822.SIZE)')
                size_text = b' '.join(v for v in sizes or [] if isinstance(v, bytes))
                size = re.search(rb'RFC822.SIZE\s+(\d+)', size_text)
                if state != 'OK' or not size or int(size.group(1)) > 12 * 1024 * 1024:
                    skipped += 1
                    continue
                state, result = mail.uid('fetch', uid, '(BODY.PEEK[])')
                raw = next((r[1] for r in result or [] if isinstance(r, tuple)), b'')
                if state == 'OK' and raw:
                    for item in attachments(raw, order):
                        item['uid'] = uid.decode('ascii')
                        documents.append(item)
                if len(documents) > 10:
                    raise ValueError('Más de diez adjuntos: revisa el pedido manualmente')
            return dict(documents=documents, messages=len(identifiers), skipped=skipped,
                        mailbox='all' if selected else 'inbox', limited=len(identifiers) > 20)
    except (imaplib.IMAP4.error, OSError):
        raise ValueError('No se ha podido leer Gmail con la conexión existente. Puedes añadir el PDF manualmente; no se ha cambiado la configuración del correo.') from None


@contextmanager
def service_lock(root):
    import fcntl
    with (root/'service.lock').open('a') as stream:
        fcntl.flock(stream, fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(stream, fcntl.LOCK_UN)


def dispatch(runtime, request):
    runtime = Path(runtime)
    action = request.get('action')
    if action == 'aeat_source':
        from period_workflow import context, build_candidate
        from closing import Store, confined, read
        period = request.get('period')
        if period not in ('1T','2T','3T','4T','anual'):
            raise ValueError('Periodo no válido')
        with service_lock(runtime.parent):
            config, root, ledger, ledger_hash = context(runtime)
            identity = read(confined(root, config['identity']))
            result = dict(year=ledger['year'],period=period,ledger_sha256=ledger_hash,
                          as_of=ledger.get('as_of'),coverage=ledger.get('coverage',{}).get(period,''),
                          nif=identity['nif'],name=identity['name'],snapshot=None,
                          already_filed=bool(ledger.get('references',{}).get(period)))
            try:
                if period == 'anual':
                    from annual_workflow import build_candidate as annual_candidate
                    candidate = annual_candidate(runtime)
                else:
                    candidate = build_candidate(runtime, period)
                store = Store(runtime/('new-annual.sqlite' if period=='anual' else 'new-closing.sqlite'))
                row = store.get(f'{ledger["year"]}-{period}')
                if not row or row['state'] != 'generated' or row['snapshot']['revision'] != candidate['revision']:
                    raise ValueError('Primero revisa, aprueba y genera la versión actual del modelo.')
                store.download(candidate)
                result['snapshot'] = candidate
                result['problem'] = ''
            except (ValueError,KeyError,OSError) as exc:
                result['problem'] = str(exc)
            return result
    if action in ('billing_get','billing_post'):
        from desktop_billing import dispatch as billing_dispatch
        return billing_dispatch(runtime.parent, request)
    if action == 'mail':
        return collect_mail(runtime.parent, request['data'])
    # Render the existing fiscal screens inside the local desktop shell.
    # This override exists only in this short-lived Python process.
    sys.modules['kairo_invoice_web'] = types.SimpleNamespace(dashboard=lambda content, *args: content)
    if action == 'expense_data':
        from expense_workflow import ExpenseStore
        store = ExpenseStore(runtime/'expenses')
        with service_lock(runtime.parent):
            return dict(rows=store.list(), draft=store.get(request['id']) if request.get('id') else None)
    if action == 'expense_propose':
        from expense_workflow import ExpenseStore
        with service_lock(runtime.parent):
            draft = ExpenseStore(runtime/'expenses').propose(request.get('id'),request.get('proposal'),
                request.get('expected_revision'),'desktop-assistant-proposal')
            return {key:draft[key] for key in ('id','revision','state')}
    if action == 'get':
        from modelos_web import get as expense_get
        from period_workflow import get as period_get
        from closing_web import get as closing_get
        url = request['url']
        for handler in (expense_get, period_get, closing_get):
            result = handler(runtime, url, request['csrf'])
            if result is not None:
                return pack(result)
        raise ValueError('Ruta no disponible')
    if action == 'post':
        from modelos_web import post as expense_post
        from period_workflow import post as period_post
        from closing_web import post as closing_post
        with service_lock(runtime.parent):
            for handler in (expense_post, period_post, closing_post):
                result = handler(runtime, request['url'], request['data'], 'desktop-mini')
                if result is not None:
                    return result
        raise ValueError('Acción no disponible')
    raise ValueError('Operación no disponible')
