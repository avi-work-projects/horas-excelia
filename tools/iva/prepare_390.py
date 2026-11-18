"""Annual working dossier, not an AEAT 390 file or a completed tax assessment."""
from decimal import Decimal


def prepare(report):
    quarters = report['quarters']
    if set(quarters) != {'1T', '2T', '3T', '4T'}:
        raise ValueError('Four explicit quarters required, including incomplete ones')
    differences = [dict(period=p, differences=q['difference']) for p, q in quarters.items()
                   if any(Decimal(v) != 0 for v in q['difference'].values())]
    missing_references = [p for p, q in quarters.items() if q['reference'].get('71') is None]
    missing_eu_references = [p for p, q in quarters.items()
        if Decimal(q.get('boxes', {}).get('10', '0.00')) != 0
        and any(k not in q['reference'] for k in ('10', '11', '27', '36', '37'))]
    totals = report['annual_documentary_totals']
    eu = {name: totals.get(box, '0.00') for name, box in
          (('base', '10'), ('accrued_vat', '11'), ('deductible_base', '36'), ('deductible_vat', '37'))}
    pending = [f'{p}: falta la referencia del 303 presentado.' for p in missing_references]
    pending.extend(f'{p}: faltan casillas del 303 para conciliar servicios intracomunitarios.'
                   for p in missing_eu_references)
    if any(Decimal(value) != 0 for value in eu.values()):
        pending.append('Revisar NIF-IVA y declaración recapitulativa de operaciones intracomunitarias (modelo 349); este dossier no los verifica ni prepara.')
    # Never net quarterly differences away or treat an absent quarter as filed zero.
    return {
        'year': report['year'], 'status': 'Preparación documental provisional; no es un 390 importable',
        'filing_ready': False, 'provisional': True,
        'documentary_totals': dict(totals),
        'intracommunity_services': eu,
        'quarterly_differences': differences,
        'missing_filed_references': missing_references,
        'missing_intracommunity_references': missing_eu_references,
        'filed_results_subtotal': str(sum((Decimal(q['reference']['71']) for q in quarters.values()
                                         if q['reference'].get('71') is not None), Decimal('0.00'))),
        'pending': pending + [
            'Confirmar cobertura de todo el año; disponer de registros no equivale a cerrar el ejercicio.',
            'Conciliar los cuatro 303 y conservar las diferencias por trimestre, aunque se compensen entre sí.',
            'Revisar obligación de presentar, actividad y operaciones especiales antes del mapeo fiscal anual.',
            'Adaptar y validar el fichero con el diseño y servicio oficial del ejercicio correspondiente.',
        ],
        'scope': 'Totales del criterio documental actual; no reclasifica gastos ni calcula IRPF o amortizaciones.',
    }
