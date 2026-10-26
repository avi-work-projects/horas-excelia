"""Synthetic invoice status and HTTP boundary; no production services or mail."""
import copy
import json
import unittest
from unittest.mock import patch
from home_invoice_status import month_status, reply_status
from prepare_home_status import patch_status_service


def item(state='review', mail='Sin programar', accepted=False, period='2027-02'):
    return {'row': {'status': state, 'data': {'period': period, 'send_date': '2027-02-19', 'secret': 'never-return'}}, 'mail': mail, 'accepted': accepted}


class StatusTests(unittest.TestCase):
    def test_real_mail_wins_and_private_fields_never_leave(self):
        source = [item('sent', 'Enviado', True)]
        original = copy.deepcopy(source)
        result = month_status('2027-02', source)
        self.assertEqual(result['state'], 'sent')
        self.assertTrue(result['sent'])
        self.assertNotIn('secret', json.dumps(result))
        self.assertEqual(source, original)

    def test_scheduled_is_distinct_from_draft_and_issued(self):
        for state, mail, issued, expected in [('review', 'Sin programar', False, 'draft'), ('approved', 'Programado', False, 'scheduled'), ('accepted', 'Programado', True, 'scheduled'), ('accepted', 'Sin programar', True, 'issued'), ('blocked', 'Sin programar', False, 'attention'), ('sending', 'Requiere revisión', True, 'processing'), ('uncertain', 'Requiere revisión', True, 'attention'), ('email_cancelled', 'Cancelado', True, 'attention')]:
            with self.subTest(state=state, mail=mail):
                result = month_status('2027-02', [item(state, mail, issued)])
                self.assertEqual(result['state'], expected)
                self.assertEqual(result['issued'], issued)
                self.assertEqual(result['scheduledDate'], '2027-02-19' if expected == 'scheduled' else None)

    def test_missing_different_period_and_ambiguity(self):
        self.assertEqual(month_status('2027-02', [])['state'], 'missing')
        self.assertEqual(month_status('2027-02', [item(period='2027-03')])['state'], 'missing')
        self.assertEqual(month_status('2027-02', [item(), item()])['state'], 'multiple')
        with self.assertRaises(ValueError):
            month_status('../service.sqlite', [])


class Handler:
    def __init__(self, origin='https://synthetic.github.io', allowed=True, path='/facturas/gestify-status?period=2027-02'):
        self.path = path
        self.headers = {'Origin': origin}
        self.authenticated = allowed
    def allowed(self):
        return self.authenticated
    def reply(self, status, body, mime=None, extra=None):
        return status, body, extra or {}


class HttpTests(unittest.TestCase):
    def call(self, handler=None, origin='https://synthetic.github.io', **kwargs):
        return reply_status(handler or Handler(), '/unused', origin, **kwargs)

    def test_identity_origin_and_disabled(self):
        for handler in [Handler(allowed=False), Handler(origin='https://untrusted.test'), Handler(origin=None)]:
            result = self.call(handler)
            self.assertEqual(result[0], 403)
            self.assertNotIn('Access-Control-Allow-Origin', result[2])
        self.assertEqual(self.call(origin='')[0], 404)

    def test_get_no_store_payload_and_failure_is_not_missing(self):
        expected = month_status('2027-02', [item()])
        with patch('home_invoice_status.read_month', return_value=expected) as read:
            result = self.call()
            read.assert_called_once_with('/unused', '2027-02')
            self.assertEqual(result[0], 200)
            self.assertEqual(json.loads(result[1]), expected)
            self.assertEqual(result[2]['Access-Control-Allow-Origin'], 'https://synthetic.github.io')
            self.assertNotIn('Access-Control-Allow-Credentials', result[2])
        with patch('home_invoice_status.read_month', side_effect=RuntimeError('secret path')):
            result = self.call()
            self.assertEqual(result[0], 503)
            self.assertNotIn('secret', result[1])

    def test_invalid_period_duplicates_and_extra_parameters(self):
        for query in ['period=2027-13', 'period=2027-02&period=2027-03', 'period=2027-02&action=send', '']:
            self.assertEqual(self.call(Handler(path='/gestify-status?' + query))[0], 400)

    def test_preflight_only_for_get_and_exact_origin(self):
        handler = Handler()
        handler.headers.update({'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Private-Network': 'true'})
        result = self.call(handler, preflight=True)
        self.assertEqual(result[0], 204)
        self.assertEqual(result[2]['Access-Control-Allow-Methods'], 'GET')
        self.assertEqual(result[2]['Access-Control-Allow-Private-Network'], 'true')
        handler.headers['Access-Control-Request-Method'] = 'POST'
        self.assertEqual(self.call(handler, preflight=True)[0], 403)
        handler.headers['Access-Control-Request-Method'] = 'GET'
        handler.headers['Access-Control-Request-Headers'] = 'x-csrf'
        self.assertEqual(self.call(handler, preflight=True)[0], 403)

    def test_patch_preserves_write_routes_and_identity(self):
        source = "class Handler:\n def allowed(self):return True\n def reply(self,*args):pass\n def do_GET(self):\n  try:\n   if path=='/gestify':\n    from gestify_bridge import receiver\n  except:pass\n def do_POST(self):\n  raise RuntimeError('writes stay unchanged')\n"
        updated = patch_status_service(source)
        self.assertIn("if path=='/gestify-status':", updated)
        with self.assertRaises(ValueError):
            patch_status_service(updated)


if __name__ == '__main__':
    unittest.main()
