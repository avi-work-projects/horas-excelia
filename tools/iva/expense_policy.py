"""Versioned expense metadata, independent of extraction and tax calculation.

Version 1 describes review decisions; ``irpf_treatment`` is a classification,
not a confirmed deduction or an IRPF amount. Historical records without this
version marker are returned unchanged. No rule infers a seller from Amazon,
a tax identifier from a folder, or deductible use from an expense category.
"""
from copy import deepcopy

POLICY_VERSION = 1
CATEGORIES = ('general', 'equipment', 'telecom', 'electricity', 'gas', 'other')
TAX_SCOPES = ('iva_irpf', 'irpf_only', 'excluded', 'review')
IRPF_TREATMENTS = ('pending', 'current_expense', 'asset', 'excluded')
INVOICE_STATUSES = ('complete', 'needs_invoice', 'needs_review')
POLICY_FIELDS = frozenset(('expense_policy_version', 'category', 'tax_scope',
    'irpf_treatment', 'business_purpose', 'buyer_tax_id', 'invoice_status',
    'order_reference', 'buyer_identity_confirmed'))
CONFIRMATION_FIELDS = ('reviewed_all_pages', 'single_invoice',
                       'fiscal_review_confirmed', 'buyer_identity_confirmed')


def default_fields():
    """Fresh, unreviewed draft defaults. Callers may safely edit the returned dict."""
    return dict(expense_policy_version=POLICY_VERSION, category='general',
                tax_scope='review', irpf_treatment='pending', business_purpose='',
                buyer_tax_id='', invoice_status='needs_review', order_reference='',
                buyer_identity_confirmed=False, include=False, mapping='pending')


def has_policy(fields):
    return bool(POLICY_FIELDS.intersection(fields))


def scope_reason(fields):
    """UI-safe explanation of why a versioned document does not enter VAT totals."""
    if not has_policy(fields):
        return ''
    return {
        'irpf_only': 'Archivado para revisar en Renta; sin deducción IRPF calculada y fuera del cálculo de IVA.',
        'excluded': 'Excluido del cálculo de IVA y del expediente de deducciones IRPF.',
        'review': 'Pendiente de revisión fiscal; no incluido en el cálculo de IVA ni aprobado como deducible en IRPF.',
        'iva_irpf': '',
    }.get(fields.get('tax_scope'), '')


def validate_policy(fields, for_approval=False):
    """Validate versioned metadata without changing it; unversioned history is valid.

    Approval of ``irpf_only`` authorizes archival for subsequent Renta review,
    not a deduction. Only ``iva_irpf`` may set include=True and requires the
    existing fiscal confirmation plus documentary buyer identity confirmation.
    """
    if not has_policy(fields):
        return
    if type(fields.get('expense_policy_version')) is not int or fields['expense_policy_version'] != POLICY_VERSION:
        raise ValueError('Versión de ficha fiscal no admitida; revisa la ficha completa.')
    for key, options in (('category', CATEGORIES), ('tax_scope', TAX_SCOPES),
                         ('irpf_treatment', IRPF_TREATMENTS), ('invoice_status', INVOICE_STATUSES)):
        if fields.get(key) not in options:
            raise ValueError('Valor de ficha fiscal no admitido: ' + key)
    for key in ('business_purpose', 'buyer_tax_id', 'order_reference'):
        if not isinstance(fields.get(key), str) or len(fields[key]) > 500:
            raise ValueError('Campo documental no válido: ' + key)
    if type(fields.get('buyer_identity_confirmed')) is not bool:
        raise ValueError('La comprobación del destinatario debe ser explícita.')
    included = fields['tax_scope'] == 'iva_irpf'
    if type(fields.get('include')) is not bool or fields['include'] != included:
        raise ValueError('La inclusión en IVA no coincide con el destino fiscal.')
    if fields['category'] in ('electricity', 'gas') and included:
        raise ValueError('Luz y gas se archivan para revisión de Renta; no se incorporan al IVA en este circuito.')
    if not included and fields.get('mapping') != 'pending':
        raise ValueError('Un documento fuera de IVA no debe tener un tratamiento de deducción aplicado.')
    if fields['tax_scope'] == 'excluded' and fields['irpf_treatment'] != 'excluded':
        raise ValueError('Un documento excluido debe conservar también su exclusión en IRPF.')
    if for_approval and included:
        if fields['invoice_status'] != 'complete':
            raise ValueError('Completa y revisa la factura antes de incorporarla al IVA.')
        if not fields['buyer_tax_id'].strip() or not fields['buyer_identity_confirmed']:
            raise ValueError('Coteja la identidad fiscal del destinatario con la factura antes de incorporar el IVA.')
        if not fields['business_purpose'].strip():
            raise ValueError('Describe el uso profesional del gasto antes de incorporar el IVA.')
        if fields.get('fiscal_review_confirmed') is not True:
            raise ValueError('Confirma el tratamiento fiscal; la categoría no acredita deducibilidad.')


def normalize_fields(fields):
    """Return normalized versioned draft fields; never mutate historical inputs.

    Scope controls VAT inclusion. Amounts and the documentary rate are preserved;
    non-VAT scopes are forced to include=False and mapping=pending. Changing to
    iva_irpf does not supply its VAT mapping, rate or review confirmations.
    """
    result = deepcopy(fields)
    if not has_policy(result):
        return result
    if 'expense_policy_version' not in result:
        raise ValueError('La ficha fiscal necesita su versión explícita.')
    result = default_fields() | result
    result['include'] = result['tax_scope'] == 'iva_irpf'
    if not result['include']:
        result['mapping'] = 'pending'
    if result['tax_scope'] == 'excluded':
        result['irpf_treatment'] = 'excluded'
    validate_policy(result)
    return result


def record_note(fields):
    """Preserve the user's note and add the explicit non-VAT archival reason."""
    note = fields.get('note', '').strip()
    reason = scope_reason(fields)
    return note if not reason or reason in note else (note + ' | ' + reason if note else reason)


PROPOSAL_SCHEMA_VERSION = 1
PROPOSAL_FIELDS = frozenset(('number', 'party', 'tax_id', 'date', 'base', 'vat',
    'withholding', 'total', 'rate', 'buyer_tax_id', 'order_reference', 'category', 'invoice_status'))


def proposal_contract():
    """Contract for an optional external extractor; this module makes no AI call.

    Each values[field] needs evidence[field]=[{page: 1, quote: '...'}]. Pages are
    1-based; quotations are proposals to verify, not authenticated evidence.
    Approval flags, inclusion and fiscal treatment are never extractor inputs.
    """
    return dict(schema_version=PROPOSAL_SCHEMA_VERSION, fields=sorted(PROPOSAL_FIELDS),
                document_sha256='SHA256 del PDF original',
                evidence_format={'field': [{'page': 1, 'quote': 'Texto del documento'}]})


def validate_proposal(proposal, pages, document_sha256):
    if not isinstance(proposal, dict) or set(proposal) != {'schema_version', 'document_sha256', 'values', 'evidence'}:
        raise ValueError('Contrato de propuesta de extracción no válido.')
    if type(proposal['schema_version']) is not int or proposal['schema_version'] != PROPOSAL_SCHEMA_VERSION:
        raise ValueError('Versión de propuesta no admitida.')
    if proposal['document_sha256'] != document_sha256:
        raise ValueError('La propuesta pertenece a otro documento.')
    values, evidence = proposal['values'], proposal['evidence']
    if not isinstance(values, dict) or not values or set(values) - PROPOSAL_FIELDS:
        raise ValueError('La extracción contiene campos no documentales o no admitidos.')
    if not isinstance(evidence, dict) or set(evidence) != set(values):
        raise ValueError('Cada campo propuesto necesita evidencia documental.')
    for key, value in values.items():
        if not isinstance(value, str) or len(value) > 500:
            raise ValueError('Valor de extracción no válido.')
        if key == 'category' and value not in CATEGORIES:
            raise ValueError('Categoría propuesta no admitida.')
        if key == 'invoice_status' and value not in INVOICE_STATUSES:
            raise ValueError('Estado documental propuesto no admitido.')
        refs = evidence[key]
        if not isinstance(refs, list) or not 1 <= len(refs) <= 10:
            raise ValueError('Evidencia de extracción no válida.')
        for ref in refs:
            if (not isinstance(ref, dict) or set(ref) != {'page', 'quote'}
                    or type(ref['page']) is not int or not 1 <= ref['page'] <= pages
                    or not isinstance(ref['quote'], str) or not 0 < len(ref['quote'].strip()) <= 1000):
                raise ValueError('La evidencia debe citar una página y texto del PDF.')
    return deepcopy(proposal)
