"""Private project allow-list by effective month; no data or fiscal mutations."""
import re


def effective_project(settings, period):
    def valid_month(value):
        return isinstance(value, str) and re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', value)
    if not valid_month(period):
        raise ValueError('Mes de facturación no válido')
    project = settings.get('project')
    if not isinstance(project, str) or not project.strip():
        raise ValueError('Proyecto base no configurado')
    rules = settings.get('project_periods', {})
    if not isinstance(rules, dict) or any(not valid_month(start) or not isinstance(value, str) or not value.strip() for start, value in rules.items()):
        raise ValueError('Vigencias de proyecto no válidas; revisar configuración privada')
    for start in sorted(rules):
        if start <= period:
            project = rules[start]
    return project


def validate_identity(source, settings, require):
    # Project authorization is explicit in private settings, never inferred from
    # the newly received invoice. Keep all the original strict identity checks.
    require(source['issuer'] == settings['issuer'], 'Emisor distinto: revisar configuración')
    require(source['client'] == settings['customer'], 'Cliente distinto: revisar configuración')
    require(source['payment']['iban'] == settings['iban'], 'Cuenta distinta: revisar configuración')
    require(source['project'] == effective_project(settings, source['period']),
            'Proyecto distinto del autorizado para este mes: revisar vigencia')
