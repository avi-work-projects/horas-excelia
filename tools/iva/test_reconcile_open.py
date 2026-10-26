import unittest
from reconcile_open import reconcile
from test_ledger import data, record


class OpenReportTests(unittest.TestCase):
    def setUp(self):
        self.data = data([record(number='previous', period='1T', date='2026-03-01'),
                          record(period='2T', date='2026-04-01')])
        self.csv = ('Fila excel;Periodo;Casilla;Importe;Descripcion\n'
                    '3;1T;;;[Ingreso] Registro no incorporado\n'
                    '4;2T;LFE_PRE303_07;100,00;Registro incorporado correctamente\n'
                    '4;2T;LFE_PRE303_09;21,00;Registro incorporado correctamente\n')

    def test_exact_rows_and_expected_prior_exclusion(self):
        result = reconcile(self.data, '2T', self.csv)
        self.assertEqual(result['incorporated_records'], 1)
        self.assertEqual(result['excluded_previous_period_records'], 1)
        self.assertEqual(result['boxes']['29'], '0.00')

    def test_rejects_missing_duplicate_changed_wrong_period_or_unexpected_exclusion(self):
        variants = [self.csv.rsplit('\n', 2)[0], self.csv + self.csv.splitlines(True)[-1],
                    self.csv.replace('21,00', '20,99'), self.csv.replace('4;2T', '4;3T'),
                    self.csv.replace('3;1T', '3;2T'), self.csv.replace('LFE_PRE303_09', 'LFR_PRE303_29')]
        for variant in variants:
            with self.subTest(variant=variant), self.assertRaises(ValueError):
                reconcile(self.data, '2T', variant)
