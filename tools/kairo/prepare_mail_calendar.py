"""Add access to weekly mail in the private billing navigation."""
from pathlib import Path


def patch_dashboard(source):
    anchor='>Modelos</a></nav>'
    if source.count(anchor)!=1:
        raise ValueError('Ha cambiado la navegación privada de facturación')
    return source.replace(anchor,'>Modelos</a><a href="/horas/calendario">Correos de horas</a></nav>')


def patch_review(source):
    anchor='<a class="back" href="/facturas/monitor">Avisos</a>'
    if source.count(anchor)!=1:raise ValueError('Ha cambiado la cabecera de revisión')
    return source.replace(anchor,'''<a class="back" href="/horas/calendario?period={e(p['period'])}">Correos de horas</a>'''+anchor)


if __name__=='__main__':
    import sys
    src,dest=map(Path,sys.argv[1:])
    if dest.exists():raise SystemExit('El candidato ya existe')
    patch={'invoice_dashboard.py':patch_dashboard,'review_view.py':patch_review}[src.name]
    dest.write_text(patch(src.read_text(encoding='utf-8')),encoding='utf-8')
