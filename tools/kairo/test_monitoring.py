"""No network, SMTP or fiscal code. Run on Linux (fcntl)."""
import json
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch
import monitoring as m


class Fake:
    calls = []
    fail = False
    def __init__(self, key): pass
    def api(self, path, data=None):
        if self.fail: raise ValueError('offline')
        self.calls.append(('api', path, data))
        return {'uuid': 'a'*8+'-aaaa-aaaa-aaaa-'+'a'*12}
    def ping(self, uuid, failed=False):
        if self.fail: raise ValueError('offline')
        self.calls.append(('ping', uuid, failed))


class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.p = patch.object(m, 'ROOT', Path(self.tmp.name)); self.p.start()
        Fake.calls = []; Fake.fail = False
        self.t = datetime(2027, 2, 19, 8, 0, tzinfo=m.ZONE)
        self.row = {'id': 1, 'data': {'send_date': '2027-02-19'}, 'status': 'accepted', 'mail_confirmed': False}
        self.cfg = {'api_key': 'synthetic', 'channels': 'test', 'availability_uuid': 'test'}
    def tearDown(self):
        self.p.stop(); self.tmp.cleanup()
    def test_arms_exact_date_before_deadline(self):
        state = {}
        m.sync_delivery(Fake(''), self.cfg, state, self.row, self.t-timedelta(days=2))
        self.assertEqual(Fake.calls[0][2]['schedule'], '2027-02-19 08:00:00')
        self.assertEqual(state['delivery_signal'], '')
    def test_no_false_success_before_send(self):
        state = {'delivery_plan': '1:2027-02-19', 'delivery_uuid': 'test'}
        m.sync_delivery(Fake(''), self.cfg, state, self.row, self.t)
        self.assertEqual(Fake.calls, [])
        m.sync_delivery(Fake(''), self.cfg, state, self.row, self.t+timedelta(minutes=5))
        self.assertEqual(Fake.calls[-1], ('ping', 'test', True))
    def test_sent_requires_durable_smtp_confirmation_and_deduplicates(self):
        state = {'delivery_plan': '1:2027-02-19', 'delivery_uuid': 'test'}
        self.row['status'] = 'sent'
        m.sync_delivery(Fake(''), self.cfg, state, self.row, self.t)
        self.assertEqual(Fake.calls, [])
        self.row['mail_confirmed'] = True
        for _ in range(2): m.sync_delivery(Fake(''), self.cfg, state, self.row, self.t)
        self.assertEqual(Fake.calls, [('ping', 'test', False)])
    def test_maintenance_changes_only_availability(self):
        m.save('monitor-config.json', self.cfg)
        with patch.object(m, 'Client', Fake), patch.object(m, 'now', return_value=self.t):
            m.action({'action': 'maintenance', 'hours': 4})
        self.assertEqual(Fake.calls[0][1], 'checks/test')
        self.assertEqual(Fake.calls[0][2]['timeout'], 14400)
        self.assertIn('maintenance_until', m.read('monitor-state.json'))
    def test_failed_remote_pause_is_not_reported_as_saved(self):
        m.save('monitor-config.json', self.cfg); Fake.fail = True
        with patch.object(m, 'Client', Fake), self.assertRaises(ValueError):
            m.action({'action': 'maintenance', 'hours': 1})
        self.assertNotIn('maintenance_until', m.read('monitor-state.json'))
    def test_monthly_is_observed_during_maintenance(self):
        m.save('monitor-config.json', self.cfg)
        m.save('monitor-state.json', {'maintenance_until': (self.t+timedelta(hours=1)).isoformat(),
                                    'delivery_plan': '1:2027-02-19', 'delivery_uuid': 'monthly'})
        self.row['status'] = 'uncertain'
        with patch.object(m, 'Client', Fake), patch.object(m, 'now', return_value=self.t), patch.object(m, 'plan', return_value=self.row):
            m.tick()
        self.assertEqual(Fake.calls, [('ping', 'monthly', True)])


if __name__ == '__main__': unittest.main()
