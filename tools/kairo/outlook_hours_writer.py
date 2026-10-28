"""Guarded UI writer. Disabled by default; never falls back to immediate Send.

The UI contract is tested in an offline synthetic browser. Enabling real writes
requires the owner's review and a controlled validation of Outlook's composer.
"""
import re
from datetime import datetime
from urllib.parse import urlsplit

from hours_model import MADRID, addresses


class OutlookWriter:
    def __init__(self, sender, reader, *, enabled=False):
        self.sender = addresses([sender], True)[0]
        self.reader = reader
        self.enabled = enabled

    def __call__(self, request, row):
        if not self.enabled:
            raise PermissionError('Programación real deshabilitada')
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser=p.chromium.connect_over_cdp('http://127.0.0.1:9223',timeout=10000)
            try:
                pages=[q for c in browser.contexts for q in c.pages if q.url.startswith('https://outlook.office.com/mail/')]
                if len(pages)!=1:raise ValueError('Revisa la sesión de Outlook')
                page=pages[0]
                mailboxes=page.locator('[role=treeitem]').all_text_contents()
                if not any(self.sender in x.lower() for x in mailboxes):raise ValueError('Remitente sin confirmar')
                if page.locator('[contenteditable=true]:visible').count():raise ValueError('Hay un borrador abierto')
                if row['action']=='update':
                    record=self.reader.records.get(row['recordId'])
                    if not record or record['state']!='scheduled':raise ValueError('La programación ha cambiado')
                    url=urlsplit(record['url'])
                    if url.scheme!='https' or url.hostname!='outlook.office.com' or not url.path.startswith('/mail/drafts/id/'):
                        raise ValueError('No es una programación editable de Outlook')
                    page.goto(record['url'],wait_until='domcontentloaded')
                    page.get_by_role('button',name=re.compile('^Cancelar envío$|^Cancel send$',re.I)).click()
                else:
                    page.get_by_role('button',name=re.compile('^Correo nuevo$|^New mail$',re.I)).click()
                self.edit_and_schedule(page,request,row)
            finally:browser.close()

    def edit_and_schedule(self,page,request,row):
        """Only compose/date UI. A journal reservation must already exist."""
        week=next(w for w in request['weeks'] if w['key']==row['key'])
        compose=page.locator('[data-app-section=MailReadCompose]')
        subject=compose.get_by_role('textbox',name=re.compile('^Agregar un asunto$|^Add a subject$',re.I))
        body=compose.get_by_role('textbox',name=re.compile('^Cuerpo del mensaje|^Message body',re.I))
        subject.wait_for();body.wait_for()
        if row['action']=='create':
            # From must be explicitly visible and agree, not merely assumed from
            # the active account. Unknown composer layouts stop before Send.
            sender=compose.locator('[data-email-address][data-recipient-kind=from]')
            if sender.count()!=1 or sender.get_attribute('data-email-address').lower()!=self.sender:
                raise ValueError('Remitente del borrador sin confirmar')
            for kind,label in [('to',r'^Para$|^To$'),('cc',r'^CC$|^Cc$')]:
                values=addresses(request['config'][kind],kind=='to')
                if not values:continue
                field=compose.get_by_role('combobox',name=re.compile(label))
                if field.count()!=1:raise ValueError('Campo de destinatarios no reconocido')
                for address in values:
                    field.fill(address);field.press('Enter')
            subject.fill(week['subject'])
        # Updates retain the existing subject and all existing recipients.
        body.fill(week['body'])
        compose.get_by_role('button',name=re.compile('^Más opciones de envío$|^More send options$',re.I)).click()
        page.get_by_role('menuitem',name=re.compile('^Programar envío$|^Schedule send$',re.I)).click()
        dialog=page.get_by_role('dialog',name=re.compile('Programar envío|Schedule send',re.I))
        dialog.wait_for()
        custom=dialog.get_by_role('button',name=re.compile('^Hora personalizada$|^Custom time$',re.I))
        if custom.count():custom.click()
        when=datetime.fromisoformat(row['schedule']).astimezone(MADRID)
        day=dialog.locator('input[type=date]');clock=dialog.locator('input[type=time]')
        if day.count()!=1 or clock.count()!=1:raise ValueError('Fecha y hora de Outlook no reconocidas')
        day.fill(when.date().isoformat());clock.fill(when.strftime('%H:%M'))
        if day.input_value()!=when.date().isoformat() or clock.input_value()[:5]!='08:00':
            raise ValueError('Fecha u hora sin confirmar')
        # Scope the final button to the verified scheduling dialog. There is
        # deliberately no fallback to the composer's immediate Send button.
        dialog.get_by_role('button',name=re.compile('^Confirmar programación$|^Programar$|^Send$|^Enviar$',re.I)).click()
        dialog.wait_for(state='hidden')
