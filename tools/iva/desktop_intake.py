"""Manual mail intake; originals + provenance first, existing queue second."""
import base64
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

from amazon_inbox import prepare, _immutable
from amazon_transfer import send
from expense_workflow import atomic, inspect_pdf
from model_events import process_lock


def collect(config, settings, remote, sender=send):
    order_file = Path(settings['order_path'])
    order = json.loads(order_file.read_text(encoding='utf-8-sig'))
    reference = order['order_reference']
    expected = Path(config['archive_root'])/'ENTRADA'/'AMAZON'/'pedidos'/reference/'pendiente_factura.json'
    if order_file.resolve() != expected.resolve() or order.get('purchase_status') != 'confirmed':
        raise ValueError('El pedido no coincide con el archivo configurado')
    receipt_dir = Path(settings['state_root'])/'mail'
    receipt_dir.mkdir(parents=True, exist_ok=True)
    with process_lock(receipt_dir/'collect.lock'):
        response = remote(config, dict(action='mail', data=dict(order=reference, account=settings['account'])), timeout=180)
        results = []
        inbox = Path(config['archive_root'])/'ENTRADA'/'AMAZON'
        for document in response['documents']:
            raw = base64.b64decode(document['pdf'], validate=True)
            inspect_pdf(raw)
            sha = hashlib.sha256(raw).hexdigest()
            # Store before transfer: a dropped SSH reply never loses an original.
            _immutable(inbox, 'objects/'+sha+'.pdf', raw)
            provenance = {k: v for k, v in document.items() if k != 'pdf'}
            provenance.update(schema_version=1, order_reference=reference, sha256=sha,
                              account=settings['account'], source='gmail-imap-readonly')
            _immutable(inbox, 'mail/'+hashlib.sha256(json.dumps(provenance,sort_keys=True).encode()).hexdigest()+'.json',
                       json.dumps(provenance,ensure_ascii=False,indent=2).encode())
            # A mail attachment is not yet a verified invoice. Unknown documents
            # remain review drafts; no tax approval is inferred from the sender.
            manifest = prepare([inbox/'objects'/(sha+'.pdf')], inbox,
                {'schema_version':1, 'documents':{sha:{'source_kind':'unknown','order_reference':reference}}})
            result = sender(inbox/'manifests'/(manifest['batch_id']+'.json'), config)
            if result.get('batch_id') != manifest['batch_id'] or len(result.get('documents',[])) != 1:
                raise ValueError('El recibo no corresponde al documento recogido')
            for entry in result.get('documents', []):
                if entry.get('sha256') != sha or entry.get('status') not in ('created','existing_in_queue','already_in_book'):
                    raise ValueError('PDF conservado; falta confirmar su entrada en la bandeja. Puedes repetir la recogida.')
                results.append(entry)
        at = datetime.now(timezone.utc).isoformat()
        if results:
            message = 'Documentos recogidos: '+str(len(results))+'. Revisa los PDF y sus datos en la bandeja de gastos.'
        else:
            message = 'No hay PDF adjuntos disponibles para este pedido en los correos consultados. Si Amazon envía un enlace, abre el pedido y añade la factura descargada.'
        if response.get('limited') or response.get('skipped') or response.get('mailbox') != 'all':
            message += ' La búsqueda tiene cobertura limitada; revisa también el pedido de Amazon.'
        result = dict(at=at, order_reference=reference, documents=results, message=message,
                      messages=response['messages'], mailbox=response['mailbox'])
        atomic(receipt_dir/(reference+'.json'), json.dumps(result,ensure_ascii=False,indent=2).encode())
        return result
