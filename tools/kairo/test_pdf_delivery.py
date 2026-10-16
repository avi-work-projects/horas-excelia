"""Synthetic references only: no fiscal service, credentials or real documents."""
import unittest
from pdf_delivery import reference


class PDFDeliveryTests(unittest.TestCase):
    def row(self, status):
        return {'status': status, 'data': {'docid': 7, 'number': '01-02/2027',
                'panel_hash': 'a' * 64, 'pdf_hash': 'b' * 64}}

    def test_draft_and_final_never_share_url_or_filename(self):
        draft = reference(self.row('review'))
        final = reference(self.row('accepted'))
        self.assertNotEqual(draft[0], final[0])
        self.assertEqual(draft[1], 'BORRADOR_01-02_2027.pdf')
        self.assertEqual(final[1], 'Factura_01-02_2027.pdf')
        self.assertFalse(draft[2])
        self.assertTrue(final[2])

    def test_sending_and_sent_keep_same_final_reference(self):
        expected = reference(self.row('accepted'))
        for status in ('sending', 'sent', 'email_cancelled'):
            self.assertEqual(reference(self.row(status)), expected)

    def test_changed_draft_changes_reference(self):
        row = self.row('review')
        old = reference(row)
        row['data']['pdf_hash'] = 'c' * 64
        self.assertNotEqual(reference(row)[0], old[0])

    def test_rejects_unsafe_filename_and_token(self):
        for key, value in [('number', '../secret'), ('panel_hash', 'invalid')]:
            row = self.row('accepted')
            row['data'][key] = value
            with self.assertRaises(ValueError):
                reference(row)


if __name__ == '__main__':
    unittest.main()
