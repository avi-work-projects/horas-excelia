"""Manually maintained Renta documentary checklist; never a tax calculation.

The private catalog belongs to AUTONOMO. Reading a page does not scan folders,
retrieve mail, modify a ledger or decide whether an expense can be deducted.
"""
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re

from expense_workflow import atomic, inspect_pdf
from model_events import process_lock
from modelos_ui import e

SHA = re.compile(r'[a-f0-9]{64}\Z')
IDENT = re.compile(r'[a-z0-9][a-z0-9_-]{0,99}\Z')
MAX_PDF = 32 * 1024 * 1024
MAX_FILES = 2000
MAX_CATALOG = 8 * 1024 * 1024


def now():
    return datetime.now(timezone.utc).isoformat()


def _plain(path):
    return not path.is_symlink() and not getattr(path, 'is_junction', lambda: False)()


class Store:
    def __init__(self, state_root, archive_root, year=2026):
        if type(year) is not int or not 2000 <= year <= 2100:
            raise ValueError('Ejercicio no válido')
        self.year = year
        self.archive = Path(archive_root).resolve()
        self.state = Path(state_root).resolve()
        self.roots = tuple(f'{folder}/{year}' for folder in (
            'DECLARACION RENTA', 'FACTURAS', 'ENTRADA/GASTOS', 'ENTRADA/CORREO'))
        self.catalog_relative = f'DECLARACION RENTA/{year}/seguimiento_documental_{year}.json'
        self.path = self.archive / self.catalog_relative
        self.lock = self.state / f'renta-documentos-{year}.lock'

    def _safe(self, relative, pdf=False):
        if not isinstance(relative, str) or not relative or '\\' in relative or ':' in relative or '\0' in relative:
            raise ValueError('Ruta documental no válida')
        parts = relative.split('/')
        if any(part in ('', '.', '..') for part in parts) or PurePosixPath(relative).is_absolute():
            raise ValueError('Ruta fuera de las carpetas autorizadas')
        if not any(relative.startswith(root + '/') for root in self.roots):
            raise ValueError('Documento fuera de las carpetas del ejercicio')
        target = self.archive
        for part in parts:
            target = target / part
            if not _plain(target):
                raise ValueError('No se admiten enlaces ni carpetas redirigidas')
        if not target.resolve().is_relative_to(self.archive):
            raise ValueError('Ruta fuera del archivo autorizado')
        if pdf and target.suffix.lower() != '.pdf':
            raise ValueError('El documento debe ser PDF')
        return target

    def _empty(self):
        return dict(schema_version=1, year=self.year, items=[], documents=[], scanned_at=None, warnings=[])

    def read(self):
        path = self._safe(self.catalog_relative)
        if not path.exists():
            return self._empty()
        if path.stat().st_size > MAX_CATALOG:
            raise ValueError('El seguimiento documental supera el tamaño permitido')
        try:
            result = json.loads(path.read_text(encoding='utf-8-sig'))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise ValueError('No se puede leer el seguimiento documental') from exc
        self._validate(result)
        return result

    def _validate(self, result):
        if not isinstance(result, dict) or result.get('schema_version') != 1 or result.get('year') != self.year:
            raise ValueError('Seguimiento documental incompatible con este ejercicio')
        items, docs = result.get('items'), result.get('documents')
        if not isinstance(items, list) or not isinstance(docs, list) or len(items) > 200 or len(docs) > MAX_FILES:
            raise ValueError('Listado documental no válido')
        ids, hashes = set(), set()
        for item in items:
            if not isinstance(item, dict) or not isinstance(item.get('id'), str) or not IDENT.fullmatch(item['id']) or item['id'] in ids:
                raise ValueError('Identificador de partida no válido')
            if not isinstance(item.get('label'), str) or not item['label'].strip() or len(item['label']) > 300 or type(item.get('complete')) is not bool:
                raise ValueError('Partida documental no válida')
            ids.add(item['id'])
        for doc in docs:
            if not isinstance(doc, dict) or not isinstance(doc.get('sha256'), str) or not SHA.fullmatch(doc['sha256']) or doc['sha256'] in hashes:
                raise ValueError('Huella documental no válida o duplicada')
            if doc.get('item_id') not in (None, '') and doc['item_id'] not in ids:
                raise ValueError('El documento pertenece a una partida inexistente')
            aliases = doc.get('aliases', [])
            if not isinstance(aliases, list) or len(aliases) > MAX_FILES:
                raise ValueError('Alias documentales no válidos')
            # Paths are checked before any access. A newly redirected/missing
            # path must not make the rest of the catalog unreadable.
            if not isinstance(doc.get('path'), str) or not all(isinstance(p, str) for p in aliases):
                raise ValueError('Ruta documental no válida')
            hashes.add(doc['sha256'])

    def _save(self, result):
        self._validate(result)
        path = self._safe(self.catalog_relative)
        raw = (json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
        if len(raw) > MAX_CATALOG:
            raise ValueError('El seguimiento documental supera el tamaño permitido')
        atomic(path, raw)
        return result

    def _pdf(self, relative):
        path = self._safe(relative, pdf=True)
        if not path.is_file() or path.stat().st_size > MAX_PDF:
            raise ValueError('PDF no disponible o demasiado grande (máximo 32 MiB)')
        with path.open('rb') as stream:
            raw = stream.read(MAX_PDF + 1)
        if len(raw) > MAX_PDF or not raw.startswith(b'%PDF-'):
            raise ValueError('El archivo no es un PDF permitido')
        self._safe(relative, pdf=True)
        return path, raw

    def scan(self):
        """Explicit bounded scan, deduplicated by bytes; keep manual decisions."""
        with process_lock(self.lock):
            result = self.read()
            previous = {doc['sha256']: doc for doc in result['documents']}
            found, warnings, count = {}, [], 0
            for root_relative in self.roots:
                # A harmless nonexistent child lets _safe validate the root too.
                root = self._safe(root_relative + '/.scan-root').parent
                if not root.exists():
                    continue
                for directory, folders, files in os.walk(root, followlinks=False):
                    allowed = []
                    for folder in sorted(folders):
                        child = Path(directory) / folder
                        if _plain(child):
                            allowed.append(folder)
                        else:
                            warnings.append('Carpeta enlazada omitida: ' + child.relative_to(self.archive).as_posix())
                    folders[:] = allowed
                    for filename in sorted(files):
                        if Path(filename).suffix.lower() != '.pdf':
                            continue
                        count += 1
                        if count > MAX_FILES:
                            raise ValueError('Hay más de 2000 PDF; el catálogo no se ha modificado')
                        relative = (Path(directory) / filename).relative_to(self.archive).as_posix()
                        try:
                            _, raw = self._pdf(relative)
                            sha = hashlib.sha256(raw).hexdigest()
                            if sha not in found:
                                # Validate new PDFs once, not every alias or scan.
                                if sha not in previous:
                                    inspect_pdf(raw)
                                old = previous.get(sha, {})
                                found[sha] = dict(old, sha256=sha, path=relative, aliases=[],
                                                  label=old.get('label') or filename,
                                                  item_id=old.get('item_id'), available=True)
                            elif relative != found[sha]['path']:
                                found[sha]['aliases'].append(relative)
                        except (OSError, ValueError) as exc:
                            warnings.append(relative + ': ' + str(exc))
            for sha, old in previous.items():
                if sha not in found:
                    found[sha] = dict(old, available=False)
            result['documents'] = sorted(found.values(), key=lambda d: (str(d.get('label', '')).casefold(), d['sha256']))
            result['scanned_at'] = now()
            result['warnings'] = warnings
            return self._save(result)

    def mark(self, item, complete):
        if not isinstance(item, str) or type(complete) is not bool:
            raise ValueError('Indica la partida y un estado de revisión válido')
        with process_lock(self.lock):
            result = self.read()
            target = next((row for row in result['items'] if row['id'] == item), None)
            if target is None:
                raise ValueError('Partida no encontrada')
            target['complete'] = complete
            target['reviewed_at'] = now()
            return self._save(result)

    def assign(self, sha, item):
        if not isinstance(sha, str) or not SHA.fullmatch(sha) or (item is not None and not isinstance(item, str)):
            raise ValueError('Documento o partida no válidos')
        with process_lock(self.lock):
            result = self.read()
            if item and item not in {row['id'] for row in result['items']}:
                raise ValueError('Partida no encontrada')
            target = next((row for row in result['documents'] if row['sha256'] == sha), None)
            if target is None:
                raise ValueError('Documento no encontrado')
            target['item_id'] = item or None
            target['assigned_at'] = now()
            return self._save(result)

    def document(self, sha, as_bytes=False):
        if not isinstance(sha, str) or not SHA.fullmatch(sha):
            raise ValueError('Huella documental no válida')
        target = next((doc for doc in self.read()['documents'] if doc['sha256'] == sha), None)
        if target is None:
            raise ValueError('Documento no encontrado')
        for relative in [target['path'], *target.get('aliases', [])]:
            try:
                path, raw = self._pdf(relative)
                if hashlib.sha256(raw).hexdigest() == sha:
                    return raw if as_bytes else path
            except (OSError, ValueError):
                continue
        raise ValueError('El original ya no está disponible o ha cambiado. Vuelve a revisar la carpeta.')


STYLE = '''<style>
.renta-documentary .renta-top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap}
.renta-documentary .renta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));align-items:start;gap:12px;margin:20px 0}
.renta-documentary .renta-card{padding:16px}.renta-documentary .renta-card>summary{cursor:pointer;display:flex;align-items:center;gap:10px;list-style:none}
.renta-documentary .renta-card>summary::-webkit-details-marker{display:none}.renta-documentary .renta-title{flex:1;min-width:0}.renta-documentary .renta-title strong,.renta-documentary .renta-title small{display:block}
.renta-documentary .renta-title small{font-weight:400;margin-top:3px}.renta-documentary .renta-check{display:flex;align-items:center;gap:6px;font-size:12px}.renta-documentary .renta-check input{width:17px;height:17px;accent-color:var(--k-accent)}
.renta-documentary .renta-search{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin-top:14px}.renta-documentary .renta-search label{display:flex;flex:1;min-width:145px;flex-direction:column;gap:4px;font-size:12px}
.renta-documentary select{max-width:100%;padding:8px;border:1px solid var(--k-line);border-radius:8px;color:var(--text);background:var(--k-surface)}
.renta-documentary .renta-files{padding-left:20px}.renta-documentary .renta-files li{margin:8px 0;overflow-wrap:anywhere}.renta-documentary .renta-table-scroll{overflow-x:auto}
.renta-documentary .renta-table{border-collapse:collapse;width:100%;table-layout:fixed}.renta-documentary .renta-table th,.renta-documentary .renta-table td{padding:12px 8px;text-align:left;vertical-align:top;border-bottom:1px solid var(--k-line);overflow-wrap:anywhere}.renta-documentary .renta-table th:first-child{width:50%}.renta-documentary .renta-table select{width:100%}
.renta-documentary .renta-file-meta{display:block;font-size:12px;margin-top:4px}.renta-documentary .renta-summary{margin:10px 0}.renta-documentary .renta-warning{font-size:13px}.renta-documentary .renta-provenance{font-size:12px;overflow-wrap:anywhere}
</style>'''


def _period(doc):
    # No date is inferred from a folder or filename. An assistant may record
    # dates only alongside evidence after reading the actual document.
    if doc.get('period_evidence') and (doc.get('period_start') or doc.get('period_end')):
        return 'Periodo leído: ' + str(doc.get('period_start') or '?') + ' → ' + str(doc.get('period_end') or '?')
    if doc.get('date_evidence') and doc.get('date'):
        return 'Fecha leída: ' + str(doc['date'])
    return 'Periodo por comprobar en el PDF'


def _link(doc):
    label = doc.get('label') or PurePosixPath(doc['path']).name
    if doc.get('available', True):
        return '<a href="/renta/documento?id=' + e(doc['sha256']) + '" target="_blank" rel="noopener">' + e(label) + '</a>'
    return e(label) + ' <span class="quiet">· Original no disponible</span>'


def render(store, accounts=()):
    data = store.read()
    items, docs = data['items'], data['documents']
    available = sum(doc.get('available', True) for doc in docs)
    completed = sum(item['complete'] for item in items)
    unassigned = sum(not doc.get('item_id') for doc in docs)
    options = '<option value="all">Todos los correos</option>' + ''.join(
        '<option value="' + e(account) + '">' + e(account) + '</option>'
        for account in dict.fromkeys(accounts) if isinstance(account, str) and account and account != 'all')
    body = STYLE + '<section class="local-page renta-documentary"><div class="renta-top"><div><div class="eyebrow">SEGUIMIENTO DOCUMENTAL</div><h1>Renta ' + str(store.year) + '</h1><p class="lead">Reúne los justificantes y marca cada partida cuando hayas terminado de revisarla.</p></div><div><button type="button" data-renta-scan>Revisar documentos locales</button><p class="quiet">' + e(('Última revisión: ' + data['scanned_at'][:16].replace('T', ' ') + ' UTC') if data.get('scanned_at') else 'Carpetas aún sin revisar') + '</p></div></div>'
    body += '<p class="renta-summary"><strong>' + str(available) + '</strong> PDF disponibles · <strong>' + str(len(items) - completed) + '</strong> partidas pendientes · <strong>' + str(completed) + '</strong> marcadas como completas · <strong>' + str(unassigned) + '</strong> PDF sin clasificar</p><p class="quiet">Tener documentos no completa una partida. Tú confirmas si cubren lo necesario. Este seguimiento no incorpora importes a los libros ni decide deducciones.</p>'
    if not items:
        body += '<div class="notice">Todavía no hay partidas en el seguimiento de este ejercicio. Se preparan a partir de tus documentos de referencia.</div>'
    body += '<div class="renta-grid">'
    for item in items:
        linked = [doc for doc in docs if doc.get('item_id') == item['id']]
        count = sum(doc.get('available', True) for doc in linked)
        body += '<details class="feature-card renta-card"><summary><span class="renta-title"><strong>' + e(item['label']) + '</strong><small class="quiet">' + str(count) + ' PDF · ' + ('Completa por revisión manual' if item['complete'] else 'Revisión pendiente') + '</small></span><label class="renta-check"><input type="checkbox" data-renta-check="' + e(item['id']) + '" aria-label="Marcar ' + e(item['label']) + ' como completa"' + (' checked' if item['complete'] else '') + '>Completa</label></summary>'
        if item.get('note'):
            body += '<p>' + e(item['note']) + '</p>'
        if item.get('needed_documents'):
            body += '<p class="quiet">Por reunir o revisar: ' + e('; '.join(str(v) for v in item['needed_documents'])) + '</p>'
        body += '<ul class="renta-files">' + ''.join('<li>' + _link(doc) + '<span class="quiet renta-file-meta">' + e(_period(doc)) + '</span></li>' for doc in linked) + '</ul>' if linked else '<p class="quiet">Sin justificantes vinculados todavía.</p>'
        body += '<form class="renta-search" data-item="' + e(item['id']) + '"><label>Buscar en<select name="kind"><option value="mail">Correo</option><option value="web">Web del proveedor</option></select></label><label>Cuenta<select name="account">' + options + '</select></label><button type="submit">Preparar búsqueda</button></form>'
        evidence = item.get('excel_evidence', [])
        if evidence:
            body += '<details class="renta-provenance"><summary>Referencia de la partida</summary>'
            for entry in evidence:
                body += '<p>' + e((str(entry.get('path', '')) + ' · ' + str(entry.get('sheet', '')) + ' · ' + str(entry.get('range', ''))) if isinstance(entry, dict) else str(entry)) + '</p>'
            body += '</details>'
        body += '</details>'
    body += '</div><article class="feature-card"><h2>Documentos encontrados</h2><p class="quiet">Cada PDF aparece una vez, aunque haya copias en varias carpetas. Asigna los que estén sin clasificar a la partida correspondiente.</p>'
    if docs:
        body += '<div class="renta-table-scroll"><table class="renta-table"><thead><tr><th>Documento y periodo</th><th>Partida</th><th>Original</th></tr></thead><tbody>'
        for doc in docs:
            choices = '<option value="">Sin clasificar</option>' + ''.join('<option value="' + e(item['id']) + '"' + (' selected' if doc.get('item_id') == item['id'] else '') + '>' + e(item['label']) + '</option>' for item in items)
            body += '<tr><td>' + _link(doc) + '<span class="quiet renta-file-meta">' + e(_period(doc)) + '</span></td><td><select data-renta-assign="' + e(doc['sha256']) + '" aria-label="Partida de ' + e(doc.get('label', doc['path'])) + '">' + choices + '</select></td><td><details><summary>' + ('Disponible' if doc.get('available', True) else 'No disponible') + '</summary><p class="quiet">' + e(doc['path']) + '</p>' + ''.join('<p class="quiet">Copia: ' + e(alias) + '</p>' for alias in doc.get('aliases', [])) + '</details></td></tr>'
        body += '</tbody></table></div>'
    else:
        body += '<p class="quiet">Pulsa Revisar documentos locales después de guardar nuevos PDF.</p>'
    body += '</article>'
    if data.get('warnings'):
        body += '<details class="feature-card renta-warning"><summary>Archivos que necesitan atención (' + str(len(data['warnings'])) + ')</summary><ul>' + ''.join('<li>' + e(warning) + '</li>' for warning in data['warnings']) + '</ul></details>'
    return body + '</section>'
