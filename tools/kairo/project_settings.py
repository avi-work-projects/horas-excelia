"""Explicit project changes from the authenticated Gestify settings screen.

Called under the existing service/process locks, identity, Origin and CSRF
checks. Never updates invoice snapshots, approvals, plans or email content.
"""
import json
import os
import re
import tempfile
from project_periods import effective_project


def proposal(settings, change, protected, current_month):
    if not isinstance(change, dict) or set(change) != {'project', 'from', 'previous'}:
        raise ValueError('Cambio de proyecto no válido')
    start, project, previous = (change[k] for k in ('from', 'project', 'previous'))
    if not isinstance(start, str) or not re.fullmatch(r'20\d\d-(0[1-9]|1[0-2])', start):
        raise ValueError('Selecciona desde qué mes se aplica el proyecto')
    if any(not isinstance(s, str) or not s.strip() or s != s.strip() or len(s) > 200
           or any(ord(c) < 32 for c in s) for s in (project, previous)):
        raise ValueError('Código de proyecto no válido')
    current = effective_project(settings, start)
    rules = dict(settings.get('project_periods', {}))
    # An identical retry recovers a lost response, even after a month rollover.
    if rules.get(start) == project:
        return dict(settings)
    if start < current_month:
        raise ValueError('El cambio debe comenzar en el mes actual o en uno futuro')
    if current != previous:
        raise ValueError('El proyecto de Kairo ha cambiado. Conserva la configuración actual y revisa el conflicto')
    rules[start] = project
    if len(rules) > 100:
        raise ValueError('Demasiadas vigencias de proyecto; revisa la configuración')
    candidate = dict(settings, project_periods=rules)
    for period in protected:
        if effective_project(candidate, period) != effective_project(settings, period):
            raise ValueError('Ya hay una factura preparada para '+period+'. Elige un mes posterior; se conserva la factura existente')
    return candidate


def handle(service, panel, data):
    path = service.ROOT / 'settings.json'
    settings = json.loads(path.read_text(encoding='utf-8'))
    with service.db() as db:
        protected = {json.loads(r['data'])['period'] for r in db.execute('SELECT data FROM plans')}
    with panel.db() as db:
        protected.update(json.loads(r['snapshot'])['period'] for r in db.execute('SELECT snapshot FROM drafts'))
    try:
        candidate = proposal(settings, data.get('change'), protected, service.now().strftime('%Y-%m'))
    except ValueError as error:
        rules = settings.get('project_periods', {})
        start = max(rules, default='')
        return {'state': 'project_rejected', 'message': str(error),
                'current': {'base': settings['project'], 'periods': rules,
                            'project': rules.get(start, settings['project']), 'from': start}}
    if candidate != settings:
        # Replace only after complete validation. Keep permissions private and
        # retain every unrelated setting. A failed write leaves the old file.
        fd, temp = tempfile.mkstemp(prefix='.project-', dir=service.ROOT)
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as output:
                json.dump(candidate, output, ensure_ascii=False, indent=2)
                output.write('\n'); output.flush(); os.fsync(output.fileno())
            os.replace(temp, path)
        finally:
            if os.path.exists(temp): os.unlink(temp)
    return {'state': 'project_saved', 'project': data['change']['project'],
            'from': data['change']['from'], 'base': candidate['project'],
            'periods': candidate.get('project_periods', {})}
