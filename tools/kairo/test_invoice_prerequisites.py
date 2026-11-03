"""Synthetic saved hours and predecessor states. Never connects to Outlook."""
import calendar
import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from invoice_prerequisites import check, require
from prepare_invoice_prerequisites import patch as patch_service


class PrerequisiteTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        config = self.root / 'hours.json'
        config.write_text(json.dumps({'sender': 'person@example.invalid', 'state_dir': str(self.root)}))
        self.config = {'gestify_prerequisites': {'first_period': '2026-10', 'hours_config': str(config)}}
        with closing(sqlite3.connect(self.root / 'hours.sqlite')) as db, db:
            db.execute('CREATE TABLE status_facts(account TEXT, period TEXT, payload TEXT)')
        self.rows = [{'key': week[0].isoformat(), 'state': 'scheduled'}
                     for week in calendar.Calendar().monthdatescalendar(2027, 1)
                     if any(day.month == 1 for day in week[:5])]

    def save(self, stamp='2026-11-03T10:00:00Z', account='person@example.invalid'):
        with closing(sqlite3.connect(self.root / 'hours.sqlite')) as db, db:
            db.execute('INSERT INTO status_facts VALUES(?,?,?)',
                       (account, '2027-01', json.dumps({'verified': True, 'checkedAt': stamp, 'rows': self.rows})))

    def test_requires_all_month_weeks_then_previous_scheduled_or_sent(self):
        self.assertEqual(check(self.root, '2027-01', self.config)['code'], 'hours')
        self.save()
        for state in ('missing', 'draft', 'scheduled', 'sent'):
            with self.subTest(state=state), patch('invoice_prerequisites.read_month', return_value={'state': state}):
                result = check(self.root, '2027-01', self.config)
                self.assertEqual(result is None, state in ('scheduled', 'sent'))
                if result:
                    self.assertEqual(result['previousPeriod'], '2026-12')

    def test_changed_and_other_account_do_not_count_as_programmed(self):
        self.save(account='other@example.invalid')
        self.assertEqual(check(self.root, '2027-01', self.config)['code'], 'hours')
        self.save()
        self.rows[0]['state'] = 'changed'
        self.save(stamp='2026-11-03T11:00:00Z')
        with self.assertRaisesRegex(ValueError, 'envíos de horas'):
            require(self.root, '2027-01', self.config)

    def test_missing_database_does_not_create_one(self):
        (self.root / 'hours.sqlite').unlink()
        self.assertEqual(check(self.root, '2027-01', self.config)['code'], 'unavailable')
        self.assertFalse((self.root / 'hours.sqlite').exists())

    def test_first_configured_month_uses_hours_without_requiring_an_older_invoice(self):
        self.config['gestify_prerequisites']['first_period'] = '2027-01'
        self.save()
        with patch('invoice_prerequisites.read_month') as previous:
            self.assertIsNone(check(self.root, '2027-01', self.config))
            previous.assert_not_called()

    def test_patch_keeps_guard_before_live_invoice_and_approval(self):
        source = "def approve(expected):\n p={'period':'2027-01'}\n cfg=config()\n live=live_matches(p)\n save_approval(p)\n"
        result = patch_service(source)
        self.assertLess(result.index('require(ROOT'), result.index('live_matches'))
        self.assertIn('save_approval(p)', result)


if __name__ == '__main__':
    unittest.main()
