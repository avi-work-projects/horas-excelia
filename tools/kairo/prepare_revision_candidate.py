"""Pure source transformation, does not deploy or run the invoice service."""
import ast


def patch(source):
    changes = [
        ('def prepare_plan(docid=1,issue_date_override=None):',
         'def prepare_plan(docid=1,issue_date_override=None,revision_archive=None):'),
        (" pdf='archive/'+s['period']+'/'+s['contentHash']+'/borrador.pdf'",
         " pdf=(revision_archive or ('archive/'+s['period']+'/'+s['contentHash']))+'/borrador.pdf'"),
        ("  status('blocked','Nueva revisión recibida: aprobación anterior invalidada; conciliar el borrador')\n  with db() as c:c.execute('UPDATE plans SET approval=NULL WHERE id=?',(previous['id'],))",
         "  return replace_draft(raw)"),
        ('def import_json(raw, notify_review=True):', '''def prepare_plan_revision(docid,archive):
 return prepare_plan(docid,revision_archive=archive)

def replace_draft(raw):
 import panel,engine
 from draft_revision import replace
 return replace(sys.modules[__name__],panel,engine,raw)

def import_json(raw, notify_review=True):'''),
    ]
    for old, new in changes:
        if source.count(old) != 1:
            raise ValueError('Service changed; review before patching')
        source = source.replace(old, new)
    ast.parse(source)
    return source
