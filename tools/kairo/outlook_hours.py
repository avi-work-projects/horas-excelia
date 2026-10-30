"""Outlook web reader. Visible DOM only; never tokens, internal APIs or mail writes.

Requires the existing, manually signed-in Chromium on loopback CDP. Unknown UI,
partial lists and unrecognised messages are not evidence that a week is absent.
"""
import re
import traceback
import sys
from datetime import date, datetime, timedelta
from urllib.parse import urlsplit, unquote

from hours_model import MADRID, addresses, content_hash, digest, monday, parse_days, scope

OUTLOOK_HOSTS = {'outlook.office.com', 'outlook.cloud.microsoft'}


def outlook_page(url):
    try:
        value = urlsplit(str(url))
        return (value.scheme == 'https' and value.hostname in OUTLOOK_HOSTS
                and value.port in (None,443) and not value.username and not value.password
                and value.path.startswith('/mail/'))
    except ValueError:
        return False


def item_identity(url, sender):
    if not outlook_page(url):
        raise ValueError('Destino de Outlook no reconocido')
    match = re.fullmatch(r'/mail/(?:drafts|sentitems)/id/(.+)', urlsplit(url).path)
    if not match:
        raise ValueError('Identificador de correo no reconocido')
    # Microsoft's domain redirect must not change a message's identity.
    return digest([addresses([sender],True)[0],unquote(match[1])])


def mailbox_matches(page, sender):
    labels = page.locator('[role=treeitem]').evaluate_all('(es)=>es.map(e=>[e.textContent,e.getAttribute("title"),e.getAttribute("data-folder-name")].join(" "))')
    pattern = re.compile(r'(?<![\w.+%-])'+re.escape(sender)+r'(?![\w.-])',re.I)
    return any(pattern.search(label) for label in labels)


def folder_entry(page,folder):
    names={'sentitems':('elementos enviados','sent items'),'drafts':('borradores','drafts')}[folder]
    # The Favorites icon can become part of the accessible name while composing.
    # The folder's explicit attribute stays stable; URL checks still follow.
    items=page.locator(','.join('[role=treeitem][data-folder-name="'+name+'"]:visible' for name in names))
    if not items.count():raise ValueError('Carpeta de Outlook no reconocida')
    return items.first

def week_from_label(label, keys):
    match = re.search(r'Semana del (\d{1,2})/(\d{1,2}) al (\d{1,2})/(\d{1,2})', label, re.I)
    if not match:
        return None
    parts = tuple(map(int, match.groups()))
    found = [key for key in keys if (monday(key).day, monday(key).month,
             (monday(key)+timedelta(days=4)).day, (monday(key)+timedelta(days=4)).month) == parts]
    if len(found) > 1:
        raise ValueError('Semana ambigua en Outlook')
    return found[0] if found else None


def header_date(text):
    match = re.search(r'(\d{1,2})/(\d{1,2})/(20\d\d)\s+(\d{1,2}):(\d\d)', text)
    if not match:
        raise ValueError('Fecha completa de Outlook no reconocida')
    day, month, year, hour, minute = map(int, match.groups())
    return datetime(year, month, day, hour, minute, tzinfo=MADRID)


def header_week_year(key, anchor, scheduled):
    target=monday(key)
    years=range(anchor.year,anchor.year+3) if scheduled else range(anchor.year-1,anchor.year+2)
    found=[]
    for year in years:
        try: candidate=date(year,target.month,target.day)
        except ValueError: continue
        if candidate.weekday()==0: found.append(year)
    if len(found)!=1:raise ValueError('El año del correo no está confirmado')
    return found[0]


def scheduled_time(text, key, now):
    start = monday(key)
    clock = re.search(r'(\d{1,2}):(\d\d)', text)
    if not clock:
        # Outlook also displays 8.00 in some Spanish layouts.
        clock = re.search(r'(?<!\d)(\d{1,2})\.(\d\d)(?!\d)', text)
    if not clock:
        raise ValueError('Hora programada no reconocida')
    when = re.search(r'(\d{1,2})/(\d{1,2})(?:/(20\d\d))?', text)
    if when:
        day, month = map(int, when.group(1, 2))
        dates = [start+timedelta(days=i) for i in range(7)
                 if (start+timedelta(days=i)).day == day and (start+timedelta(days=i)).month == month]
        if len(dates) != 1 or when.group(3) and dates[0].year != int(when.group(3)):
            raise ValueError('La fecha programada está fuera de su semana')
        date = dates[0]
    else:
        days = {'lun':0, 'mar':1, 'mié':2, 'mie':2, 'jue':3, 'vie':4, 'sáb':5, 'sab':5, 'dom':6}
        day = next((n for name, n in days.items() if re.search(r'\b'+name, text, re.I)), None)
        this_week = now.astimezone(MADRID).date()-timedelta(days=now.astimezone(MADRID).weekday())
        if day is None or start != this_week or not re.search(r'este|esta', text, re.I):
            raise ValueError('Fecha relativa no confirmada')
        date = start+timedelta(days=day)
    return datetime(date.year, date.month, date.day, *map(int, clock.groups()), tzinfo=MADRID).isoformat()


class OutlookReader:
    def __init__(self, sender, endpoint='http://127.0.0.1:9223'):
        self.sender = addresses([sender], True)[0]
        if endpoint != 'http://127.0.0.1:9223':
            raise ValueError('Usa el Chromium privado local existente')
        self.endpoint = endpoint
        self.refresh_required = True

    def invalidate(self):
        self.refresh_required = True

    def __call__(self, request):
        from playwright.sync_api import sync_playwright
        wanted = sorted({key for period in request.get('periods', [request['period']]) for key in scope(period)})
        wanted.insert(0, (monday(wanted[0])-timedelta(weeks=1)).isoformat())
        result = dict(complete=False, accountVerified=False, account=self.sender,
                      records=[], problem=None, problemCode='read_failed')
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(self.endpoint, timeout=10000)
            try:
                contexts = browser.contexts
                if len(contexts) != 1:
                    raise ValueError('Revisa la sesión privada de Outlook')
                pages = [p for p in contexts[0].pages if outlook_page(p.url)]
                if len(pages) != 1:
                    result['problemCode'] = 'auth_required' if any(urlsplit(p.url).hostname in ('login.microsoftonline.com','login.microsoft.com') for p in contexts[0].pages) else 'browser_unavailable'
                    raise ValueError('Abre una única ventana de Outlook de horas')
                page = pages[0]
                if page.locator('[contenteditable=true]:visible').count():
                    result['problemCode'] = 'compose_open'
                    raise ValueError('Cierra el borrador antes de conciliar')
                page.set_default_timeout(15000)
                if self.refresh_required:
                    page.reload(wait_until='domcontentloaded',timeout=30000)
                    page.wait_for_url(lambda url:outlook_page(str(url)),timeout=10000)
                page.get_by_role('listbox').wait_for()
                if not mailbox_matches(page,self.sender):
                    result['problemCode'] = 'wrong_account'
                    raise ValueError('La cuenta de Outlook no coincide con el correo de horas')
                result['accountVerified'] = True
                for folder in ('sentitems', 'drafts'):
                    self._folder(page, folder, wanted, result['records'])
                result['complete'] = True
                self.refresh_required = False
            except Exception as error:
                if 'page' in locals() and urlsplit(page.url).hostname in ('login.microsoftonline.com','login.microsoft.com'):
                    result['problemCode'] = 'auth_required'
                self.refresh_required = True
                # Error text must not leak email bodies, selectors or addresses.
                result['problem'] = 'Outlook requiere revisión o no se ha podido completar la lectura'
                frames = [f for f in traceback.extract_tb(sys.exc_info()[2]) if f.filename.endswith('outlook_hours.py')]
                self.diagnostic = {'function':frames[-1].name, 'line':frames[-1].lineno, 'type':type(error).__name__}
            finally:
                browser.close()
        self.records = {r['id']:r for r in result['records']} if result['complete'] else {}
        return result

    def _message(self, page, folder, key, row):
        opaque = row['id']
        if not re.fullmatch(r'[\w+/=.-]+', opaque):
            raise ValueError('Identificador de fila no reconocido')
        record = dict(id=digest([folder, opaque]), week=key, state='unverified')
        if folder == 'drafts' and not re.search(r'\bProgramado\b|\bScheduled\b', row['label']+' '+row.get('text',''), re.I):
            return record | {'state': 'draft'}
        # A conversation may contain several sends of the same week. Do not
        # flatten it into one successful record or open an editable draft.
        if folder == 'drafts' and re.search(r'^Contraído|^Collapsed', row['label'], re.I):
            return record | {'state': 'ambiguous-thread'}
        page.locator('[role=option][id="'+opaque+'"]').click()
        start=monday(key)
        label='Semana del '+start.strftime('%d/%m')+' al '+(start+timedelta(days=4)).strftime('%d/%m')
        heading=page.get_by_role('main').get_by_role('heading').filter(has_text=label).first
        heading.wait_for()
        subject=heading.inner_text()
        if week_from_label(subject, [key]) != key:
            raise ValueError('El panel de lectura no corresponde a la semana')
        anchor = header_date(page.get_by_test_id('SentReceivedSavedTime').last.inner_text())
        if header_week_year(key,anchor,folder=='drafts') != monday(key).year:
            return None  # Same day/month in another year, not this week's mail.
        if folder == 'sentitems':
            # A sent conversation proves a send even when it includes replies.
            # Sent mail is immutable and needs no body or recipient comparison.
            return record | {'state':'sent'}
        # Scheduled items use ItemContainer rather than ConversationContainer.
        bodies = page.get_by_role('document', name=re.compile('Cuerpo del mensaje|Message body', re.I))
        bodies.first.wait_for()
        if bodies.count()!=1:raise ValueError('Hay varios cuerpos de mensaje')
        body = bodies.first
        body.wait_for()
        days = parse_days(body.inner_text(), key)
        # Sent Items and Drafts are scoped to the verified mailbox above. The
        # future writer must separately check the From field before any write.
        recipients = page.get_by_test_id('RecipientWell').locator('[role=presentation][aria-label]').evaluate_all('(es)=>es.map(e=>e.getAttribute("aria-label"))')
        record.update(id=item_identity(page.url,self.sender), url=page.url,rowId=opaque,
                      state='sent' if folder == 'sentitems' else 'scheduled',
                      days=days, toDisplay=next((v for v in recipients if re.match('Para:|To:',v)), 'Ver en Outlook'),
                      ccDisplay=next((v for v in recipients if re.match('CC:|Cc:',v)), 'Sin CC'),
                      contentHash=content_hash({'days':days}))
        if folder == 'drafts':
            banner = page.get_by_text(re.compile('Este mensaje está programado para enviarse|This message is scheduled', re.I)).last.inner_text()
            record['schedule'] = scheduled_time(banner, key, datetime.now(MADRID))
        return record

    def open_scheduled(self,page,record):
        # Outlook can drop the selected item on a full deep-link navigation.
        # Select the observed row, then verify the immutable item identity.
        opaque=record.get('rowId','')
        if not re.fullmatch(r'[\w+/=.-]+',opaque):raise ValueError('Fila de programación sin confirmar')
        folder_entry(page,'drafts').click()
        scroller=page.locator('[data-app-section=MessageList]').get_by_test_id('virtuoso-scroller')
        scroller.wait_for();scroller.evaluate('(e)=>e.scrollTo(0,0)')
        for _ in range(160):
            row=page.locator('[role=option][id="'+opaque+'"]')
            if row.count()==1:
                row.click()
                label='Semana del '+monday(record['week']).strftime('%d/%m')+' al '+(monday(record['week'])+timedelta(days=4)).strftime('%d/%m')
                page.get_by_role('main').get_by_role('heading').filter(has_text=label).first.wait_for()
                if item_identity(page.url,self.sender)!=record['id']:raise ValueError('El correo seleccionado ha cambiado')
                return
            metrics=scroller.evaluate('(e)=>({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight})')
            if metrics['top']+metrics['height']>=metrics['total']-2:break
            scroller.evaluate('(e)=>e.scrollBy(0,e.clientHeight*.8)');page.wait_for_timeout(350)
        raise ValueError('La programación ya no está en la lista observada')

    def _folder(self, page, folder, keys, records):
        folder_entry(page,folder).click()
        page.wait_for_url(lambda url:outlook_page(str(url)) and re.match(r'^/mail/'+folder+r'(?:/|$)',urlsplit(str(url)).path))
        page.get_by_role('listbox').wait_for()
        scroller = page.locator('[data-app-section=MessageList]').get_by_test_id('virtuoso-scroller')
        scroller.wait_for()
        scroller.evaluate('(e)=>e.scrollTo(0,0)')
        page.wait_for_timeout(350)
        seen, bottom = set(), 0
        for _ in range(160):
            rows = page.get_by_role('option').evaluate_all('(es)=>es.map(e=>({id:e.id,label:e.getAttribute("aria-label")||"",text:e.innerText}))')
            for row in rows:
                if row['id'] in seen:
                    continue
                seen.add(row['id'])
                if len(seen) > 1200:
                    raise ValueError('Lista demasiado grande; no se acredita ausencia')
                key = week_from_label(row['label'], keys)
                if key:
                    record = self._message(page, folder, key, row)
                    if record:
                        records.append(record)
            metrics = scroller.evaluate('(e)=>({top:e.scrollTop,height:e.clientHeight,total:e.scrollHeight})')
            at_end = metrics['top']+metrics['height'] >= metrics['total']-2
            bottom = bottom+1 if at_end else 0
            if bottom >= 3:
                return
            scroller.evaluate('(e)=>e.scrollBy(0,e.clientHeight*.8)')
            page.wait_for_timeout(350)
        raise ValueError('La lista de Outlook no se ha podido revisar por completo')
