"""Rendered AEAT controls with synthetic snapshots; no network or tax actions."""
import base64
import copy
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import tempfile
import time
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import aeat_web
from aeat_client import AeatClient
from aeat_submission import snapshot_data, VALIDATION_TTL
from aeat_workflow import candidate


class Controls(HTMLParser):
    def __init__(self, markup):
        super().__init__()
        self.forms, self.inputs, self.actions = {}, {}, {}
        self.current = None
        self.feed(markup)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'form':
            self.current = attrs.get('id')
            self.forms[self.current] = []
        elif tag == 'button':
            if self.current in self.forms:
                self.forms[self.current].append(attrs)
            if 'data-aeat-action' in attrs:
                self.actions[attrs['data-aeat-action']] = attrs
        elif tag == 'input':
            self.inputs[(self.current, attrs.get('name'))] = attrs

    def handle_endtag(self, tag):
        if tag == 'form':
            self.current = None

    @property
    def can_submit(self):
        return any('disabled' not in attrs for attrs in self.forms.get('aeat-submit', []))


class RenderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.app = SimpleNamespace(state=Path(self.temp.name), csrf='test-csrf')
        self.config = dict(environment='production', allow_live_submission=True,
                           certificate_thumbprint='b'*40,
                           certificate={'sha256':'a'*64,'not_after':'2030-01-01T00:00:00'})
        self.current = self.source()
        self.entry = self.operation(self.current)
        self.confirmation = {key:self.entry[key] for key in ('certificate_sha256','environment')} | {
            'operation_id':self.entry['id'], 'revision':self.entry['snapshot']['revision'],
            'payload_sha256':self.entry['snapshot']['payload_sha256']}
        fake_store = SimpleNamespace(confirmation=lambda identifier: copy.deepcopy(self.confirmation))
        self.addCleanup(patch.stopall)
        patch('aeat_web.store', return_value=fake_store).start()
        self.ended = patch('aeat_web.period_has_ended', return_value=True).start()

    def source(self, period='3T', mode='U'):
        model = '390' if period == 'anual' else '303'
        wire = '0A' if period == 'anual' else period
        payload = ('<T'+model+'02026'+wire+'0000><AUX>FICTICIO</AUX></T'+model+'02026'+wire+'0000>').encode()
        original = dict(year=2026,period=period,revision='r1',payload_sha256=hashlib.sha256(payload).hexdigest(),
                        boxes={'71':'189.00'}, basis={'ledger':'c'*64}, mode=mode, account='ES•• ···· 0000',
                        payload=base64.b64encode(payload).decode())
        return dict(year=2026,period=period,name='PERSONA FICTICIA',nif='00000000T',ledger_sha256='c'*64,
                    snapshot=original,already_filed=False,coverage='Completo para esta prueba',as_of='2026-09-30')

    def operation(self, current, nrc=''):
        snapshot,payload = candidate(current,nrc)
        return dict(id='d'*32,state='validated',snapshot=snapshot_data(snapshot,payload),
                    certificate_sha256='a'*64,environment='production',simulation=False,created=time.time(),
                    validation={'valid':True,'errors':[],'warnings':[],'validated_at':time.time()},evidence={},last_error=None)

    def render(self, current=None, entry=None, config=None):
        current = self.current if current is None else current
        entry = self.entry if entry is None else entry
        markup = aeat_web.render(current,entry,[entry] if entry else [],self.config if config is None else config,self.app)
        return markup,Controls(markup)

    def test_closed_exact_validated_source_exposes_unchecked_confirmation(self):
        markup,controls = self.render()
        self.assertTrue(controls.can_submit)
        checkbox = controls.inputs[('aeat-submit','confirmed')]
        self.assertEqual(checkbox['type'],'checkbox')
        self.assertIn('required',checkbox)
        self.assertNotIn('checked',checkbox)
        boot = json.loads(re.search(r'const ae=(.*?);let busy=',markup).group(1))
        self.assertEqual(boot['confirmation'],self.confirmation)
        self.assertNotIn('confirmed',boot['confirmation'])
        self.assertEqual(boot['period'],'3T')
        self.assertIn('Resultado: 189.00 €',markup)
        self.assertIn('NIF 00000000T',markup)

    def test_open_period_cannot_submit_even_with_approved_validated_payload(self):
        self.ended.return_value=False
        markup,controls=self.render()
        self.assertFalse(controls.can_submit)
        self.assertNotIn('aeat-submit',controls.forms)
        self.assertIn('El periodo todavía no ha terminado',markup)

    def test_changed_snapshot_cannot_submit(self):
        for field,value in (('revision','r2'),('account','ES•• ···· 9999'),('boxes',{'71':'200.00'})):
            changed=copy.deepcopy(self.current)
            changed['snapshot'][field]=value
            with self.subTest(field=field):
                markup,controls=self.render(current=changed)
                self.assertFalse(controls.can_submit)
                self.assertIn('La preparación ha cambiado',markup)

    def test_missing_generated_snapshot_cannot_submit(self):
        changed=copy.deepcopy(self.current)
        changed.update(snapshot=None,problem='Falta cerrar el trimestre')
        markup,controls=self.render(current=changed)
        self.assertFalse(controls.can_submit)
        self.assertTrue(all('disabled' in b for b in controls.forms['aeat-validate']))
        self.assertIn('Falta cerrar el trimestre',markup)

    def test_missing_configuration_or_disabled_submission_cannot_submit(self):
        for config in ({},self.config|{'certificate':{}},self.config|{'certificate_thumbprint':''},
                       self.config|{'allow_live_submission':False}):
            with self.subTest(config=config):
                _,controls=self.render(config=config)
                self.assertFalse(controls.can_submit)

    def test_already_filed_period_cannot_validate_or_submit_again(self):
        changed=self.current|{'already_filed':True}
        markup,controls=self.render(current=changed)
        self.assertFalse(controls.can_submit)
        self.assertTrue(all('disabled' in b for b in controls.forms['aeat-validate']))
        self.assertIn('Periodo ya presentado',markup)

    def test_uncertain_and_inflight_allow_recovery_not_resubmission(self):
        for state in ('uncertain','submitting','accepted','receipt_pending'):
            with self.subTest(state=state):
                markup,controls=self.render(entry=self.entry|{'state':state})
                self.assertFalse(controls.can_submit)
                self.assertNotIn('aeat-submit',controls.forms)
                self.assertIn('recover',controls.actions)
                self.assertNotIn('disabled',controls.actions['recover'])
                self.assertTrue(all('disabled' in button for button in controls.forms['aeat-validate']))
                self.assertIn('no vuelve a enviarlo',markup)

    def test_nonvalidated_states_cannot_submit(self):
        for state in ('prepared','validating','rejected'):
            with self.subTest(state=state):
                _,controls=self.render(entry=self.entry|{'state':state})
                self.assertFalse(controls.can_submit)

    def test_untrusted_display_values_are_escaped(self):
        attack='<img src=x onerror=alert(1)>'
        changed=copy.deepcopy(self.current)
        changed.update(snapshot=None,name=attack,problem=attack,coverage=attack)
        changed_entry=copy.deepcopy(self.entry)
        changed_entry.update(last_error=attack,validation={'errors':[attack],'warnings':[attack]})
        changed_entry['evidence']={'csv':attack,'recovery':{'matches':[{'csv':attack,'filed_at':attack}]}}
        markup,_=self.render(current=changed,entry=changed_entry)
        self.assertNotIn(attack,markup)
        self.assertIn('&lt;img src=x onerror=alert(1)&gt;',markup)

    def test_bootstrap_escapes_script_terminator(self):
        self.app.csrf='</script><script>alert(1)</script>'
        markup,_=self.render()
        self.assertNotIn(self.app.csrf,markup)
        boot=json.loads(re.search(r'const ae=(.*?);let busy=',markup).group(1))
        self.assertEqual(boot['csrf'],self.app.csrf)

    def test_ingreso_nrc_stays_bound_to_exact_review(self):
        current=self.source(mode='I')
        entry=self.operation(current,'A'*22)
        markup,controls=self.render(current=current,entry=entry)
        self.assertTrue(controls.can_submit)
        self.assertEqual(controls.inputs[('aeat-validate','nrc')]['value'],'A'*22)
        self.assertIn('Ingreso con el NRC revisado',markup)
        changed=copy.deepcopy(entry);changed['snapshot']['nrc']='B'*22
        _,controls=self.render(current=current,entry=changed)
        self.assertFalse(controls.can_submit)

    def test_303_and_390_candidate_are_accepted_by_transport_payload_boundary(self):
        captured=[]
        def transport(method,url,body,headers,**options):
            captured.append(json.loads(body))
            return 200,{'Content-Type':'application/json'},b'{"respuesta":{"errores":["E00 ficticio"]}}'
        for period in ('3T','anual'):
            current=self.source(period=period)
            snapshot,payload=candidate(current)
            frozen=snapshot_data(snapshot,payload)
            result=AeatClient(transport=transport).validate(frozen,payload)
            self.assertFalse(result['valid'])
            self.assertEqual(captured[-1]['PERIODO'],'0A' if period=='anual' else '3T')
            self.assertEqual(captured[-1]['F01'],payload.decode())

    def test_certificate_or_environment_change_does_not_offer_submission(self):
        changed_certificate=copy.deepcopy(self.config)
        changed_certificate['certificate']['sha256']='f'*64
        for config in (changed_certificate,self.config|{'environment':'test'}):
            with self.subTest(config=config):
                _,controls=self.render(config=config)
                self.assertFalse(controls.can_submit)

    def test_expired_future_or_unsuccessful_validation_cannot_submit(self):
        for validation in (None, {}, {'valid':False,'validated_at':time.time()},
                           {'valid':True,'validated_at':time.time()-VALIDATION_TTL-60},
                           {'valid':True,'validated_at':time.time()+3600}):
            with self.subTest(validation=validation):
                changed=self.entry|{'validation':validation}
                _,controls=self.render(entry=changed)
                self.assertFalse(controls.can_submit)


if __name__ == '__main__':
    unittest.main()
