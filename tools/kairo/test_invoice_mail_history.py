"""Synthetic email evidence; no Outlook access or fiscal writes."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
from invoice_mail_history import consolidate, public_history, NAME
from home_invoice_status import read_month


def payload():
    return dict(schema=1, through='2025-10', workStart='2025-04-01', records=[
        dict(period='2025-04', messageId='1234567890abcdef', sentAt='2025-05-03T12:00:00+02:00'),
        dict(period='2025-10', messageId='abcdef1234567890', sentAt='2025-10-19T23:40:00-07:00')])


class HistoryTests(unittest.TestCase):
    def test_merge_dates_timezone_privacy_and_permissions(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(consolidate(tmp,payload()),2)
            extra=payload();extra['records']=[dict(period='2025-04',messageId='aaaaaaaaaaaaaaaa',sentAt='2025-05-04T08:00:00+02:00')]
            self.assertEqual(consolidate(tmp,extra),3)
            self.assertEqual(consolidate(tmp,extra),3)
            result=public_history(tmp)
            self.assertEqual(result['months']['2025-04'],dict(sentDate='2025-05-03',lastSentDate='2025-05-04',count=2))
            self.assertEqual(result['months']['2025-10']['sentDate'],'2025-10-20')
            self.assertNotIn('messageId',json.dumps(result))
            self.assertIs(result,public_history(tmp),'Unchanged archive is read once')
            self.assertEqual(sorted(p.name for p in Path(tmp).iterdir()),[NAME])

    def test_invalid_merge_preserves_existing_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIsNone(public_history(tmp))
            consolidate(tmp,payload());before=(Path(tmp)/NAME).read_bytes()
            for row in [dict(period='2025-04',messageId='1234567890abcdef',sentAt='2025-05-04T12:00:00+02:00'),
                        dict(period='2025-04',messageId='bad',sentAt='2025-05-03T12:00:00'),None]:
                bad=payload();bad['records']=[row]
                with self.assertRaises(ValueError):consolidate(tmp,bad)
                self.assertEqual((Path(tmp)/NAME).read_bytes(),before)

    def test_history_is_read_only_and_does_not_replace_live_schedule(self):
        with tempfile.TemporaryDirectory() as tmp:
            consolidate(tmp,payload())
            for name in ('service.sqlite','workflow.sqlite'):(Path(tmp)/name).touch()
            source=[]
            catalog=SimpleNamespace(catalog=lambda root:source,digest=lambda p:'x',rows=lambda *args:[])
            before={p.name:p.read_bytes() for p in Path(tmp).iterdir()}
            with patch.dict('sys.modules',{'invoice_catalog':catalog}):
                result=read_month(tmp,'2025-04')
                self.assertEqual((result['state'],result['sentDate']),('sent','2025-05-03'))
                self.assertFalse(result['issued'])
                self.assertEqual(read_month(tmp,'2025-03')['state'],'missing')
                source.append(dict(row=dict(status='approved',data=dict(period='2025-10',send_date='2025-10-30')),accepted=False,mail='Programado'))
                self.assertEqual(read_month(tmp,'2025-10')['state'],'scheduled')
            self.assertEqual(before,{p.name:p.read_bytes() for p in Path(tmp).iterdir()})


if __name__=='__main__':unittest.main()
