"""Manually link one confirmed Amazon order to one explicitly reviewed invoice.

This validates PDF structure, provenance and transfer receipts, not fiscal
identity or deductibility. The caller must inspect the actual invoice first.
No browser access, approval, ledger update or background work is performed.
Operational state lives beside the private configuration, outside AUTONOMO.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys

from amazon_inbox import (_atomic, _pdf, _private_destination, _read, digest,
                          load_manifest, now, prepare)
from amazon_transfer import send
from model_events import process_lock


ORDER = re.compile(r'[0-9]{3}-[0-9]{7}-[0-9]{7}')
SHA = re.compile(r'[a-f0-9]{64}')
DRAFT = re.compile(r'[a-f0-9]{32}')
SUCCESS = frozenset(('created', 'existing_in_queue', 'already_in_book'))


def _json(path, limit=1024 * 1024):
    value = json.loads(_read(Path(path), limit).decode('utf-8-sig'))
    if not isinstance(value, dict):
        raise ValueError('Se requiere un objeto JSON.')
    return value


def _context(config_path, order_path):
    config_path, order_path = Path(config_path), Path(order_path)
    config, order = _json(config_path), _json(order_path)
    reference = order.get('order_reference')
    if (order.get('schema_version') != 1 or order.get('kind') != 'order_pending_invoice'
            or order.get('provider') != 'amazon' or order.get('purchase_status') != 'confirmed'
            or not isinstance(reference, str) or not ORDER.fullmatch(reference)):
        raise ValueError('Se necesita un registro de pedido Amazon confirmado y una referencia válida.')
    if not isinstance(config.get('archive_root'), str) or not config['archive_root'].strip():
        raise ValueError('Falta archive_root en la configuración privada.')
    archive = _private_destination(config['archive_root'])
    receipts = _private_destination(config_path.resolve().parent / 'amazon-order-receipts')
    if receipts.is_relative_to(archive):
        raise ValueError('Los recibos operativos deben estar fuera de AUTONOMO.')
    expected = archive / 'ENTRADA' / 'AMAZON' / 'pedidos' / reference
    if order_path.resolve().parent != expected.resolve():
        raise ValueError('El registro no está en la carpeta de este pedido del archivo configurado.')
    return dict(config=config, reference=reference, archive=archive,
                inbox=archive/'ENTRADA'/'AMAZON', receipts=receipts,
                state_path=receipts/(reference+'.json'),
                order_sha256=digest(_read(order_path, 1024 * 1024)))


def _receipt_document(receipt, reference, batch_id, sha, manifest=None):
    """Only a matching successful per-document receipt can complete the import."""
    if (not isinstance(receipt, dict) or receipt.get('schema_version') != 1
            or receipt.get('batch_id') != batch_id
            or not isinstance(receipt.get('documents'), list)
            or len(receipt['documents']) != 1):
        raise ValueError('Kairo no confirmó exactamente el documento de este lote.')
    if manifest is not None and receipt.get('manifest') != manifest:
        raise ValueError('El recibo de Kairo no corresponde al manifiesto preparado.')
    document = receipt['documents'][0]
    if (not isinstance(document, dict) or document.get('sha256') != sha
            or document.get('order_reference') != reference
            or document.get('source_kind') != 'invoice'
            or document.get('status') not in SUCCESS):
        raise ValueError('Kairo no confirmó la entrada: revisa el documento y reanuda el mismo lote.')
    status = document['status']
    if status == 'already_in_book':
        if (document.get('draft_id') is not None
                or not isinstance(document.get('ledger_sha256'), str)
                or not SHA.fullmatch(document['ledger_sha256'])):
            raise ValueError('El recibo no acredita la coincidencia con el libro verificado.')
    elif (not isinstance(document.get('draft_id'), str)
          or not DRAFT.fullmatch(document['draft_id'])
          or document.get('state') not in ('draft', 'approved', 'incorporated')
          or status == 'created' and document.get('state') != 'draft'):
        raise ValueError('El recibo no identifica un borrador válido.')
    return document


def _state(context):
    path = context['state_path']
    if not path.exists():
        return None
    state = _json(path, 32 * 1024 * 1024)
    if (state.get('schema_version') != 1
            or state.get('order_reference') != context['reference']
            or state.get('phase') not in ('prepared', 'confirmed')
            or not isinstance(state.get('sha256'), str) or not SHA.fullmatch(state['sha256'])
            or not isinstance(state.get('batch_id'), str) or not SHA.fullmatch(state['batch_id'])
            or state.get('manifest') != 'manifests/'+state['batch_id']+'.json'):
        raise ValueError('El estado local del pedido no es válido; no se sobrescribe.')
    if state['phase'] == 'confirmed':
        if not isinstance(state.get('confirmed_at'), str):
            raise ValueError('El recibo local no tiene fecha de confirmación.')
        _receipt_document(state.get('receipt'), context['reference'], state['batch_id'], state['sha256'])
    return state


def _summary(context, state):
    result = dict(order_reference=context['reference'], status='pending_invoice',
                  sha256=None, manifest=None, draft_id=None, source='local_state')
    if state is not None:
        result.update(status=state['phase'], sha256=state['sha256'],
                      manifest=str(context['inbox']/state['manifest']))
        if state['phase'] == 'confirmed':
            document = state['receipt']['documents'][0]
            result.update(status=document['status'], draft_id=document.get('draft_id'),
                          draft_state_at_import=document.get('state'),
                          confirmed_at=state['confirmed_at'], source='local_receipt')
    return result


def status(config_path, order_path):
    """Read local order/import state only: no SSH, locks, writes or PDF scans."""
    context = _context(config_path, order_path)
    return _summary(context, _state(context))


def import_invoice(config_path, order_path, input_path=None, source_kind=None,
                   resume=False, sender=None):
    """Prepare/send one PDF, or explicitly resume its existing immutable batch.

    A different PDF for the same order is blocked, including after a successful
    import. Corrections and multi-invoice orders need explicit separate review.
    `sender` is injectable for isolated tests; production uses amazon_transfer.
    """
    if (bool(input_path) == bool(resume)
            or input_path and source_kind != 'invoice'
            or resume and source_kind is not None):
        raise ValueError('Usa --input PDF --source-kind invoice, o solamente --resume.')
    context = _context(config_path, order_path)
    sha = None
    if input_path:
        input_path = Path(input_path)
        if input_path.suffix.lower() != '.pdf':
            raise ValueError('Se requiere una única factura PDF, no un ZIP ni un resumen de pedido.')
        raw = _read(input_path, 8 * 1024 * 1024)
        _pdf(raw)  # Structural validity only; never a claim of fiscal validity.
        sha = digest(raw)
    context['receipts'].mkdir(parents=True, exist_ok=True, mode=0o700)
    with process_lock(context['receipts']/(context['reference']+'.lock')):
        state = _state(context)
        if state is not None and sha is not None and state['sha256'] != sha:
            raise ValueError('Este pedido ya tiene otro PDF vinculado. Requiere revisión explícita; no se sustituye ni se envía otro.')
        if state is not None and state['phase'] == 'confirmed':
            return _summary(context, state)
        if state is None:
            if resume:
                raise ValueError('No hay un lote preparado que reanudar para este pedido.')
            metadata = dict(schema_version=1, documents={sha:dict(
                source_kind='invoice', order_reference=context['reference'])})
            manifest = prepare([input_path], context['inbox'], metadata)
            if (manifest['errors'] or len(manifest['files']) != 1
                    or manifest['files'][0]['sha256'] != sha):
                raise ValueError('No se preparó exactamente el PDF indicado; no se ha transferido.')
            state = dict(schema_version=1, order_reference=context['reference'], phase='prepared',
                         sha256=sha, batch_id=manifest['batch_id'],
                         manifest='manifests/'+manifest['batch_id']+'.json',
                         order_record_sha256=context['order_sha256'], prepared_at=now())
            _atomic(context['state_path'], state)
        manifest_path = context['inbox']/state['manifest']
        manifest = load_manifest(manifest_path)
        if (manifest['errors'] or len(manifest['files']) != 1
                or manifest['batch_id'] != state['batch_id']
                or manifest['files'][0]['sha256'] != state['sha256']
                or manifest['files'][0]['source_kind'] != 'invoice'
                or manifest['files'][0]['order_reference'] != context['reference']):
            raise ValueError('El manifiesto no corresponde a la factura de este pedido.')
        # Persist prepared before SSH. A lost response/final write is recovered
        # by an explicit retry of the same batch and the remote SHA deduplication.
        receipt = (sender or send)(manifest_path, context['config'])
        _receipt_document(receipt, context['reference'], state['batch_id'], state['sha256'], manifest)
        state.update(phase='confirmed', receipt=receipt, confirmed_at=now())
        _atomic(context['state_path'], state)
        return _summary(context, state)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', required=True, type=Path)
    parser.add_argument('--order', required=True, type=Path)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument('--status', action='store_true')
    action.add_argument('--input', type=Path)
    action.add_argument('--resume', action='store_true')
    parser.add_argument('--source-kind', choices=['invoice'])
    args = parser.parse_args(argv)
    if (args.input and args.source_kind != 'invoice') or (not args.input and args.source_kind):
        parser.error('--source-kind invoice es obligatorio solo con --input')
    try:
        result = status(args.config, args.order) if args.status else import_invoice(
            args.config, args.order, args.input, args.source_kind, args.resume)
    except subprocess.SubprocessError:
        print(json.dumps(dict(status='blocked', message='La transferencia no terminó. '
            'El lote sigue preparado; usa --resume para reintentarlo manualmente.'), ensure_ascii=False))
        return 1
    except (OSError, ValueError, RuntimeError) as exc:
        print(json.dumps(dict(status='blocked', message=str(exc)), ensure_ascii=False))
        return 1
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
