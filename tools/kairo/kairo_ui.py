"""Shared private Kairo chrome. The wordmark, font and design tokens come from Casa."""
from pathlib import Path

ROOT=Path(__file__).parent
GESTIFY='https://avi-work-projects.github.io/horas-excelia/'
STEPS=('Borrador','Factura','Correo','Aprobar','Archivo')


def stepper(current, interactive):
    items=[]
    for number,label in enumerate(STEPS,1):
        mark=' aria-current="step"' if number==current else ''
        if interactive:
            control=f'<button type="button" data-step="{number}" aria-label="Paso {number}, {label}"{mark}><i>{number}</i>{label}</button>'
        else:
            control=f'<span{mark}><i>{number}</i>{label}</span>'
        items.append('<li>'+control+'</li>')
    return '<ol class="k-steps" aria-label="Pasos de facturación">'+''.join(items)+'</ol>'


def shell(template, current=None, interactive=False):
    head='<meta name="theme-color" content="#142722"><link rel="icon" href="/assets/icon.svg"><link rel="stylesheet" href="/style.css"><style>'+(ROOT/'kairo_ui.css').read_text(encoding='utf-8')+'</style>'
    header=f'''<header class="k-top"><div class="k-bar"><a href="/" class="wordmark k-mark" aria-label="Kairo · Inicio"></a><a class="k-back" id="return" href="{GESTIFY}">Volver a Gestify <span aria-hidden="true">↗</span></a></div></header>'''
    return (template.replace('<!--KAIRO_HEAD-->',head).replace('<!--KAIRO_HEADER-->',header)
            .replace('<!--KAIRO_STEPS-->',stepper(current,interactive) if current else ''))
