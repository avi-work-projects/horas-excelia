"""Annual working dossier, not an AEAT 390 file or a completed tax assessment."""
from decimal import Decimal


def prepare(report):
    quarters = report['quarters']
    if set(quarters) != {'1T', '2T', '3T', '4T'}:
        raise ValueError('Four explicit quarters required, including incomplete ones')
    differences = [dict(period=p, differences=q['difference']) for p, q in quarters.items()
                   if any(Decimal(v) != 0 for v in q['difference'].values())]
    missing_references = [p for p, q in quarters.items() if q['reference'].get('71') is None]
    # Never net quarterly differences away or treat an absent quarter as filed zero.
    return {
        'year': report['year'], 'status': 'Preparación documental; no es un 390 importable',
        'filing_ready': False,
        'documentary_totals': dict(report['annual_documentary_totals']),
        'quarterly_differences': differences,
        'missing_filed_references': missing_references,
        'filed_results_subtotal': str(sum((Decimal(q['reference']['71']) for q in quarters.values()
                                         if q['reference'].get('71') is not None), Decimal('0.00'))),
        'pending': [
            'Confirmar cobertura de todo el año; disponer de registros no equivale a cerrar el ejercicio.',
            'Conciliar los cuatro 303 y conservar las diferencias por trimestre, aunque se compensen entre sí.',
            'Revisar obligación de presentar, actividad y operaciones especiales antes del mapeo fiscal anual.',
            'Adaptar y validar el fichero con el diseño y servicio oficial del ejercicio correspondiente.',
        ],
        'scope': 'Totales del criterio documental actual; no reclasifica gastos ni calcula IRPF o amortizaciones.',
    }
