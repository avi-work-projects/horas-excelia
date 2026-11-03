"""Shared private Kairo chrome. The wordmark, font and design tokens come from Casa."""
from pathlib import Path

ROOT=Path(__file__).parent
GESTIFY='https://avi-work-projects.github.io/horas-excelia/'
STEPS=('Borrador','Factura','Correo','Aprobar','Programación')


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
    # Apply the user's choice before first paint on every private screen.
    head+='''<script>(()=>{const root=document.documentElement,system=matchMedia('(prefers-color-scheme: light)');let choice;
try{choice=localStorage.getItem('kairo-color-mode')}catch{}
function apply(){const light=choice?choice==='light':system.matches;root.dataset.kTheme=light?'light':'dark';document.querySelector('meta[name=theme-color]').content=light?'#f3f7ef':'#142722';const b=document.getElementById('k-theme');if(b){b.setAttribute('aria-pressed',String(light));b.title=light?'Cambiar al tema oscuro':'Cambiar al tema claro'}}
apply();system.addEventListener('change',apply);document.addEventListener('DOMContentLoaded',()=>{apply();document.getElementById('k-theme').onclick=()=>{choice=root.dataset.kTheme==='light'?'dark':'light';try{localStorage.setItem('kairo-color-mode',choice)}catch{}apply()}})})();</script>'''
    header=f'''<header class="k-top"><div class="k-bar"><a href="/" class="wordmark k-mark" aria-label="Kairo · Inicio"></a><button type="button" id="k-theme" aria-label="Tema claro" title="Cambiar tema"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg></button><a class="k-back" id="return" href="{GESTIFY}">Volver a Gestify <span aria-hidden="true">↗</span></a></div></header>'''
    return (template.replace('<!--KAIRO_HEAD-->',head).replace('<!--KAIRO_HEADER-->',(ROOT/'dispatch-icons.svg').read_text(encoding='utf-8')+header)
            .replace('<!--KAIRO_STEPS-->',stepper(current,interactive) if current else ''))
