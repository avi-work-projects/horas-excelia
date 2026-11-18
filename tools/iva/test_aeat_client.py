"""Documented AEAT wire contracts with invented taxpayers; no live endpoints."""
import base64
import hashlib
import json
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs
from aeat_client import (AeatClient, AeatError, AeatTransportError, HOSTS, MAX_RESPONSE,
                         VALIDATE_URL, parse_consultation, parse_submission, parse_validation)


PDF = b'%PDF-1.4\n1 0 obj <<>> endobj\ntrailer <<>>\n%%EOF\n'
CSV = 'A1B2C3D4E5F6G7H8'
RECEIPT = 'https://www2.agenciatributaria.gob.es/wlpl/receipt?id='+CSV
CERT = {'sha256':'a'*64}


def fixture(model='303'):
    period = '4T' if model == '303' else 'anual'
    wire = '4T' if model == '303' else '0A'
    payload = ('<T'+model+'02026'+wire+'0000><AUX>PRUEBA</AUX></T'+model+'02026'+wire+'0000>').encode()
    return dict(model=model, year=2026, period=period, nif='00000000T', name='PERSONA FICTICIA',
                presenter_nif='00000000T', presenter_name='PERSONA FICTICIA', mode='U',
                payload_sha256=hashlib.sha256(payload).hexdigest()), payload


def accepted(snapshot):
    return {'respuesta': {'correcta': {'CodigoSeguroVerificacion ':CSV, 'Fecha':'2026-11-17', 'Hora':'14:04',
            'Modelo':snapshot['model'], 'Ejercicio':str(snapshot['year']),
            'Periodo':'0A' if snapshot['model'] == '390' else snapshot['period'],
            'NIFDeclarante':snapshot['nif'], 'NIFPresentador':snapshot['presenter_nif'],
            'Justificante':'3030000000001', 'urlPdf':RECEIPT, 'avisos':['Aviso de ejemplo']}}}


def encoded(data):
    return json.dumps(data).encode()


class FakeTransport:
    def __init__(self, *responses):
        self.responses, self.calls = list(responses), []

    def __call__(self, method, url, body, headers, **options):
        self.calls.append((method, url, body, headers, options))
        result = self.responses.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


def json_response(data, status=200):
    return status, {'Content-Type':'application/json;charset=UTF-8'}, encoded(data)


class AeatClientTests(unittest.TestCase):
    def test_official_multiline_notices_do_not_block_valid_fourth_quarter(self):
        message = 'INF024 - Aviso del último periodo:\n\n1. Primera condición.\r\n2. Segunda\tcondición.'
        response = {'respuesta':{'pdf':[base64.b64encode(PDF).decode()], 'avisos':[message]}}
        result = parse_validation(encoded(response))
        self.assertTrue(result['valid'])
        self.assertIn('1. Primera condición.',result['warnings'][0])
        self.assertNotIn('\n',result['warnings'][0])
        response['respuesta']['avisos'] = ['Aviso\x00alterado']
        with self.assertRaises(AeatError): parse_validation(encoded(response))

    def client(self, transport, **options):
        return AeatClient(environment='production', external_certificate=CERT, transport=transport, **options)

    def test_validate_documented_uppercase_pdf_response_without_certificate(self):
        snapshot, payload = fixture()
        transport = FakeTransport(json_response({'RESPUESTA': {'PDF':[base64.b64encode(PDF).decode()], 'AVISOS':['Aviso']}}))
        client = AeatClient(transport=transport)
        result = client.validate(snapshot, payload)
        self.assertTrue(result['valid'])
        self.assertEqual(result['pdf'], PDF)
        method, url, body, headers, options = transport.calls[0]
        self.assertEqual(url, VALIDATE_URL)
        self.assertEqual(json.loads(body)['F01'], payload.decode())
        self.assertNotIn('SINVL', json.loads(body))
        self.assertFalse(options['client_certificate'])
        self.assertEqual(headers['Content-Type'], 'application/json;charset=UTF-8')

    def test_validation_business_errors_use_f01_without_retry(self):
        snapshot, payload = fixture()
        transport = FakeTransport(json_response({'respuesta':{'errores':['E00 ejemplo']}}))
        result = AeatClient(transport=transport).validate(snapshot,payload)
        self.assertFalse(result['valid'])
        self.assertIn('F01', json.loads(transport.calls[0][2]))
        self.assertNotIn('FIC', json.loads(transport.calls[0][2]))
        self.assertEqual(len(transport.calls),1)

    def test_validation_never_infers_success_without_complete_pdf(self):
        for data in ({'respuesta':{}}, {'respuesta':{'pdf':['bm90IHBkZg==']}},
                     {'respuesta':{'pdf':[base64.b64encode(PDF).decode()], 'errores':['error']}}):
            with self.subTest(data=data), self.assertRaises(AeatError):
                parse_validation(encoded(data))

    def test_duplicate_normalized_json_keys_and_nonfinite_values_rejected(self):
        for raw in (b'{"respuesta":{},"RESPUESTA":{}}', b'{"respuesta":{"PDF":[],"pdf":[]}}',
                    b'{"respuesta":{"pdf":NaN}}'):
            with self.subTest(raw=raw), self.assertRaises(AeatError):
                parse_validation(raw)

    def test_both_models_submission_contract_and_receipt(self):
        for model in ('303','390'):
            snapshot,payload = fixture(model)
            transport = FakeTransport(json_response(accepted(snapshot)), (200,{'Content-Type':'application/pdf'},PDF))
            result = self.client(transport).submit(snapshot,payload,'operation-1')
            self.assertEqual(result['outcome'],'accepted')
            self.assertEqual(result['receipt_pdf'],PDF)
            self.assertEqual(result['raw_response'],encoded(accepted(snapshot)))
            self.assertEqual(result['payload_sha256'],snapshot['payload_sha256'])
            request = json.loads(transport.calls[0][2])
            self.assertEqual(request['FIR'],'FirmaBasica')
            self.assertEqual(request['F01'],payload.decode())
            self.assertNotIn('operation_id',request)
            self.assertEqual(request['PERIODO'],'0A' if model == '390' else '4T')
            self.assertTrue(transport.calls[0][4]['client_certificate'])

    def test_ingreso_requires_nrc_and_domiciliation_rejects_nrc(self):
        snapshot,payload = fixture()
        snapshot['mode']='I'
        with self.assertRaises(AeatError):
            self.client(FakeTransport()).submit(snapshot,payload,'operation-1')
        snapshot['nrc']='1'*22
        transport=FakeTransport(json_response({'respuesta':{'errores':['Rechazado']}}))
        self.assertEqual(self.client(transport).submit(snapshot,payload,'operation-1')['outcome'],'rejected')
        self.assertEqual(json.loads(transport.calls[0][2])['NRC'],'1'*22)
        snapshot['mode']='U'
        with self.assertRaises(AeatError):
            self.client(FakeTransport()).submit(snapshot,payload,'operation-1')

    def test_no_certificate_or_changed_payload_never_sends(self):
        snapshot,payload = fixture()
        for client, content in ((AeatClient(transport=FakeTransport()),payload),
                                (self.client(FakeTransport()),payload+b' ')):
            with self.assertRaises(AeatError):
                client.submit(snapshot,content,'operation-1')
            self.assertEqual(client.transport.calls,[])

    def test_control_characters_wrong_period_and_missing_close_rejected(self):
        snapshot,payload=fixture()
        for bad in (payload+b'\n',payload.replace(b'20264T',b'20263T'),payload[:-8]):
            other=snapshot|{'payload_sha256':hashlib.sha256(bad).hexdigest()}
            with self.assertRaises(AeatError):
                AeatClient(transport=FakeTransport()).validate(other,bad)

    def test_submission_identity_mismatch_is_uncertain(self):
        snapshot,payload=fixture()
        for field,value in (('NIFDeclarante','00000001R'),('NIFPresentador','00000001R'),('Periodo','3T'),('Ejercicio','2025')):
            response=accepted(snapshot);response['respuesta']['correcta'][field]=value
            transport=FakeTransport(json_response(response))
            result=self.client(transport).submit(snapshot,payload,'operation-1')
            self.assertEqual(result['outcome'],'uncertain')
            self.assertEqual(len(transport.calls),1)

    def test_submission_timeout_html_or_redirect_never_retries(self):
        snapshot,payload=fixture()
        for response in (TimeoutError('private details'),(302,{'Location':'https://other.invalid'},b''),
                         (200,{'Content-Type':'text/html'},b'<html>login</html>')):
            transport=FakeTransport(response)
            result=self.client(transport).submit(snapshot,payload,'operation-1')
            self.assertEqual(result['outcome'],'uncertain')
            self.assertEqual(len(transport.calls),1)
            self.assertNotIn('private details',str(result))

    def test_accepted_without_receipt_keeps_acceptance_for_recovery(self):
        snapshot,payload=fixture()
        transport=FakeTransport(json_response(accepted(snapshot)),TimeoutError())
        result=self.client(transport).submit(snapshot,payload,'operation-1')
        self.assertEqual(result['outcome'],'accepted')
        self.assertEqual(result['csv'],CSV)
        self.assertIn('receipt_error',result)
        self.assertNotIn('receipt_pdf',result)

    def test_receipt_url_does_not_leak_certificate(self):
        for url in ('http://www2.agenciatributaria.gob.es/wlpl/a', 'https://evil.invalid/wlpl/a',
                    'https://www2.agenciatributaria.gob.es.evil.invalid/wlpl/a',
                    'https://user@www2.agenciatributaria.gob.es/wlpl/a',
                    'https://www2.agenciatributaria.gob.es:8443/wlpl/a',
                    'https://prewww2.aeat.es/wlpl/a', 'https://www2.agenciatributaria.gob.es/wlpl/%2e%2e/a',
                    'https://www2.agenciatributaria.gob.es/other', 'https://www2.agenciatributaria.gob.es/wlpl/a\n'):
            transport=FakeTransport()
            with self.subTest(url=url), self.assertRaises(AeatError):
                self.client(transport).receipt(url)
            self.assertEqual(transport.calls,[])

    def test_unknown_error_response_does_not_look_accepted(self):
        snapshot,_=fixture()
        for response in ({'respuesta':{'correcta':{}}}, {'respuesta':{'errores':[]}},
                         {'respuesta':{'errores':['failure'],'correcta':accepted(snapshot)['respuesta']['correcta']}}):
            with self.assertRaises(AeatError):
                parse_submission(encoded(response),snapshot)

    def test_external_certificate_identity_and_environment(self):
        client=self.client(FakeTransport())
        self.assertEqual(client.identity(),dict(certificate_sha256='a'*64,environment='production',configured=True))
        with self.assertRaises(AeatError):
            AeatClient(external_certificate=CERT)
        with self.assertRaises(AeatError):
            AeatClient(environment='anything')

    def test_response_bounds_and_compression(self):
        snapshot,payload=fixture()
        for response in ((200,{'Content-Type':'application/json'},b'x'*(MAX_RESPONSE+1)),
                         (200,{'Content-Type':'application/json','Content-Encoding':'gzip'},b'compressed')):
            with self.assertRaises(AeatTransportError):
                AeatClient(transport=FakeTransport(response)).validate(snapshot,payload)

    def test_builtin_transport_reads_chunks_with_verified_tls_and_closes(self):
        snapshot,payload=fixture()
        body=encoded({'respuesta':{'errores':['E00 ejemplo']}})
        class Socket:
            def settimeout(self, value):
                if not 0 < value <= 30:raise AssertionError('Unbounded timeout')
        class Response:
            status=200
            def __init__(self):self.chunks=[body[:10],body[10:],b'']
            def getheaders(self):return [('Content-Type','application/json')]
            def getheader(self,key):return str(len(body)) if key=='Content-Length' else None
            def read1(self,maximum):return self.chunks.pop(0)
        class Connection:
            sock=Socket()
            closed=False
            def request(self,*args):self.request_args=args
            def getresponse(self):return Response()
            def close(self):self.closed=True
        connection=Connection()
        with patch('aeat_client.http.client.HTTPSConnection',return_value=connection) as factory:
            result=AeatClient().validate(snapshot,payload)
        self.assertFalse(result['valid'])
        self.assertTrue(connection.closed)
        context=factory.call_args.kwargs['context']
        self.assertTrue(context.check_hostname)
        self.assertNotEqual(context.verify_mode,0)
        self.assertEqual(factory.call_args.args[0],'prewww2.aeat.es')

    def test_recovery_contract_candidates_are_not_acceptance(self):
        snapshot,_=fixture()
        raw=('<?xml version="1.0"?><servicioConsultasDirectas><respuestaCorrecta>'
             '<ejercicio>2026</ejercicio><modelo>303</modelo><periodo>4T</periodo><nif>00000000T</nif>'
             '<csv>'+CSV+'</csv><expediente>2026303000000000000000001</expediente><justificante>3030000000001</justificante>'
             '<fechaYHoraPresentacion>2026-11-17T14:04:00</fechaYHoraPresentacion></respuestaCorrecta></servicioConsultasDirectas>').encode()
        transport=FakeTransport((200,{'Content-Type':'application/xml'},raw))
        result=self.client(transport).recover(snapshot|{'date_from':'2026-11-17'},'operation-1')
        self.assertEqual(result['outcome'],'uncertain')
        self.assertEqual(result['matches'][0]['csv'],CSV)
        self.assertNotIn('payload_sha256',result['matches'][0])
        query=parse_qs(transport.calls[0][2].decode())
        self.assertEqual(query['FED'],['20261117'])
        self.assertEqual(query['ANR'],['PERSONA FICTICIA'])
        self.assertTrue(transport.calls[0][1].endswith('/ConsultaExt'))

    def test_query_rejects_entities_wrong_root_and_foreign_return(self):
        snapshot,_=fixture()
        for raw in (b'<!DOCTYPE x [<!ENTITY e "abc">]><servicioConsultasDirectas/>',
                    '<servicioConsultasDirectas/>'.encode('utf-16'), b'<html/>',
                    b'<servicioConsultasDirectas><respuestaCorrecta/></servicioConsultasDirectas>'):
            with self.subTest(raw=raw), self.assertRaises(AeatError):
                parse_consultation(raw,snapshot)

    def test_recovery_parse_error_preserves_raw_without_retry_or_private_error_text(self):
        snapshot,_=fixture()
        raw=b'<unexpected>private-response-marker</unexpected>'
        transport=FakeTransport((200,{'Content-Type':'application/xml'},raw))
        with self.assertRaises(AeatTransportError) as caught:
            self.client(transport).recover(snapshot,'operation-1')
        self.assertEqual(caught.exception.raw_response,raw)
        self.assertNotIn('private-response-marker',str(caught.exception))
        self.assertEqual(len(transport.calls),1)


if __name__ == '__main__':
    unittest.main()
