"""Guarded Outlook UI writer, disabled by default and reserved by the journal.

Selectors reflect the Spanish Outlook form validated on 28 October 2026.
Only the final button inside the verified custom-date dialog can submit.
"""
import re
from datetime import datetime
from urllib.parse import urlsplit

from hours_model import MADRID, addresses
from outlook_hours import mailbox_matches, outlook_page

MONTHS = ('January','February','March','April','May','June','July','August',
          'September','October','November','December')


def body_lines(value):
    # Rich-text editors add empty paragraphs and non-breaking spaces. Keep
    # every meaningful line and word; only layout whitespace is equivalent.
    return [re.sub(r'\s+',' ',line).strip() for line in value.splitlines() if line.strip()]


def visible_dialog(page, title):
    heading=page.get_by_role('heading',name=title,exact=True,include_hidden=True)
    dialog=page.locator('[role=dialog]:visible').filter(has=heading)
    dialog.wait_for(state='visible')
    if dialog.count()!=1:raise ValueError('Diálogo de programación ambiguo')
    return dialog


def verify_from(compose, sender):
    source=compose.locator('button[aria-label^="De:"]:visible,button[aria-label^="From:"]:visible')
    if source.count()!=1 or not re.fullmatch(r'(?:De|From):\s*'+re.escape(sender),source.get_attribute('aria-label'),re.I):
        raise ValueError('Remitente del borrador sin confirmar')


def add_recipients(page, compose, kind, values):
    label={'to':'Para','cc':'CC','bcc':'CCO'}[kind]
    field=compose.locator('[contenteditable=true][aria-label="'+label+'"]:visible')
    if field.count()!=1 or field.inner_text().replace('\u200b','').strip():
        raise ValueError('Campo de destinatarios no vacío o no reconocido')
    for index,address in enumerate(values):
        # fill() would remove every previous pill on the second recipient.
        field.press('End')
        page.keyboard.insert_text(address)
        # Resolve only the exact address. Enter can choose a stale suggestion
        # while Outlook is fetching the new one.
        exact=page.locator('#FloatingSuggestionsList').get_by_role('option',
            name=re.compile(r'(?:^| - )'+re.escape(address)+r'$',re.I))
        exact.wait_for(state='visible')
        if exact.count()!=1:raise ValueError('Destinatario sugerido ambiguo')
        exact.click()
        chips=field.locator('._EType_RECIPIENT_ENTITY')
        chips.nth(index).wait_for(state='visible')
        pending=field.evaluate("e=>[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').replace(/[\\s\\u200b]/g,'')")
        if chips.count()!=index+1 or pending:
            raise ValueError('Destinatario sin resolver')


def select_calendar_date(dialog, when):
    navigation=dialog.locator('button[aria-label$=", change month"]')
    if navigation.count()!=1:raise ValueError('Calendario de Outlook no reconocido')
    match=re.fullmatch(r'('+'|'.join(MONTHS)+r') (20\d\d), change month',navigation.get_attribute('aria-label') or '')
    if not match:raise ValueError('Mes visible sin confirmar')
    current=int(match[2])*12+MONTHS.index(match[1])
    target=when.year*12+when.month-1
    if abs(target-current)>120:raise ValueError('Fecha fuera del calendario admitido')
    while current!=target:
        step=1 if target>current else -1
        next_month=current+step
        title=('Next month ' if step>0 else 'Previous month ')+MONTHS[next_month%12]
        arrow=dialog.get_by_title(title,exact=True)
        if arrow.count()!=1:raise ValueError('Navegación de calendario no reconocida')
        arrow.click()
        label=MONTHS[next_month%12]+' '+str(next_month//12)+', change month'
        dialog.locator('button[aria-label="'+label+'"]').wait_for(state='visible')
        current=next_month
    label=str(when.day)+', '+MONTHS[when.month-1]+', '+str(when.year)
    date=dialog.get_by_role('button',name=label,exact=True,include_hidden=True)
    if date.count()!=1:raise ValueError('Día del calendario ambiguo')
    date.click()


class OutlookWriter:
    def __init__(self, sender, reader, *, enabled=False, clock=None):
        self.sender=addresses([sender],True)[0]
        self.reader=reader
        self.enabled=enabled
        self.clock=clock or (lambda:datetime.now(MADRID))

    def __call__(self, request, row):
        if not self.enabled:raise PermissionError('Programación real deshabilitada')
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser=p.chromium.connect_over_cdp('http://127.0.0.1:9223',timeout=10000)
            try:
                if len(browser.contexts)!=1:raise ValueError('Revisa la sesión privada de Outlook')
                pages=[q for c in browser.contexts for q in c.pages if outlook_page(q.url)]
                if len(pages)!=1:raise ValueError('Revisa la sesión de Outlook')
                page=pages[0];page.set_default_timeout(15000)
                if not mailbox_matches(page,self.sender):raise ValueError('Remitente sin confirmar')
                if page.locator('[contenteditable=true]:visible').count():raise ValueError('Hay un borrador abierto')
                if row['action']=='update':
                    record=self.reader.records.get(row['recordId'])
                    if not record or record['state']!='scheduled':raise ValueError('La programación ha cambiado')
                    if not outlook_page(record['url']) or not urlsplit(record['url']).path.startswith('/mail/drafts/id/'):
                        raise ValueError('No es una programación editable de Outlook')
                    self.reader.open_scheduled(page,record)
                    page.get_by_role('button',name=re.compile('^Cancelar envío$|^Cancel send$',re.I),include_hidden=True).click()
                else:
                    page.get_by_role('button',name=re.compile('^Correo nuevo$|^New mail$',re.I),include_hidden=True).click()
                self.edit_and_schedule(page,request,row)
            finally:browser.close()

    def edit_and_schedule(self, page, request, row):
        if not self.enabled:raise PermissionError('Programación real deshabilitada')
        when=datetime.fromisoformat(row['schedule'])
        if when.tzinfo is None:raise ValueError('La fecha prevista debe incluir zona horaria')
        when=when.astimezone(MADRID)
        if when<=self.clock() or when.strftime('%H:%M:%S')!='08:00:00':
            raise ValueError('La fecha prevista ya pasó o no es a las 08:00')
        if page.evaluate('Intl.DateTimeFormat().resolvedOptions().timeZone')!='Europe/Madrid':
            raise ValueError('La zona horaria del navegador no es Madrid')
        week=next(w for w in request['weeks'] if w['key']==row['key'])
        compose=page.locator('[data-app-section=MailReadCompose]')
        subject=compose.locator('input[aria-label="Asunto"]:visible')
        body=compose.locator('[role=textbox][aria-label="Cuerpo del mensaje"][contenteditable=true]:visible')
        subject.wait_for();body.wait_for();verify_from(compose,self.sender)
        original_subject=subject.input_value()
        if row['action']=='create':
            to=addresses(request['config']['to'],True);cc=addresses(request['config']['cc'])
            add_recipients(page,compose,'bcc',[])
            add_recipients(page,compose,'to',to)
            add_recipients(page,compose,'cc',cc)
            subject.fill(week['subject'])
        # Updates retain all recipients and the original subject.
        body.fill(week['body'])
        compose.locator('button[aria-label="Más opciones de envío"]:visible').click()
        page.get_by_role('menuitem',name='Programar envío',exact=True,include_hidden=True).click()
        suggested=visible_dialog(page,'Programar envío')
        custom=suggested.locator('button').filter(has_text=re.compile(r'Tiempo personalizado$'))
        if custom.count()!=1:raise ValueError('Control de fecha personalizada ambiguo')
        custom.click()
        dialog=visible_dialog(page,'Establecer fecha y hora personalizadas')
        day=dialog.locator('input').and_(dialog.get_by_label('Seleccionar una fecha',exact=True))
        clock=dialog.locator('input').and_(dialog.get_by_label('Seleccionar una hora',exact=True))
        if day.count()!=1 or clock.count()!=1:raise ValueError('Fecha y hora de Outlook no reconocidas')
        select_calendar_date(dialog,when)
        clock.fill('08:00');clock.press('Tab')
        selected='Selected date '+MONTHS[when.month-1]+' '+str(when.day)+', '+str(when.year)
        grid=dialog.locator('[role=grid]')
        if day.input_value()!=when.strftime('%d/%m/%Y') or not re.fullmatch(r'0?8:00',clock.input_value()) or grid.count()!=1 or selected not in (grid.get_attribute('aria-label') or ''):
            raise ValueError('Fecha u hora sin confirmar')
        expected_subject=week['subject'] if row['action']=='create' else original_subject
        if subject.input_value()!=expected_subject or body_lines(body.inner_text())!=body_lines(week['body']):
            raise ValueError('El borrador no coincide con la revisión')
        verify_from(compose,self.sender)
        if when<=self.clock():raise ValueError('La hora prevista ya pasó durante la revisión')
        if self.reader is not None:self.reader.invalidate()
        # Never select immediate Send or a suggested slot.
        dialog.get_by_role('button',name='Enviar',exact=True,include_hidden=True).click()
        dialog.wait_for(state='hidden');body.wait_for(state='hidden')
