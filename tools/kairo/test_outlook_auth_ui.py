"""Offline DOM contract. Launches a separate Chromium, never the live profile."""
import json
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch
from playwright.sync_api import sync_playwright
from outlook_auth import cancel_browser_passkey, recover, screen

SENDER='person@example.invalid'
PASSWORD='synthetic-password-only'


def html(mode):
    label='another@example.invalid' if mode=='wrong-account' else SENDER
    choice_script='''<script>document.querySelector('#i0116').style.display='none';const b=document.createElement('button');b.textContent='Use my password';b.onclick=()=>{window.actions++;b.remove();document.querySelector('#i0118').style.display='block';};document.body.append(b);</script>''' if mode=='choice' else ''
    return '''<div id="displayName">'''+label+'''</div>
<input id="i0116"><input id="i0118" type="password" style="display:none">
<div id="idDiv_SAOTCAS_Title" style="display:none">Approve sign in request</div>
<div id="passwordError" style="display:none">Incorrect password</div>
<button id="idSIButton9">Next</button><script>
window.actions=0;document.querySelector('#idSIButton9').onclick=()=>{
 window.actions++;const user=document.querySelector('#i0116'),pass=document.querySelector('#i0118');
 if(user.style.display!=='none'){user.style.display='none';pass.style.display='block';}
 else {pass.style.display='none';const mode='''+json.dumps(mode)+''';
  if(mode==='mfa')document.querySelector('#idDiv_SAOTCAS_Title').style.display='block';
  else if(mode==='rejected')document.querySelector('#passwordError').style.display='block';
  else location.href='https://outlook.office.com/mail/';
 }
};</script>'''+choice_script


class BrowserContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.runtime=sync_playwright().start()
        cls.browser=cls.runtime.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
                                               args=['--disable-dev-shm-usage'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.runtime.stop()

    def exercise(self, mode, expected, host='login.microsoftonline.com'):
        context=self.browser.new_context()
        def route(request):
            body=('<div role="treeitem" title="'+SENDER+'">Mailbox</div>'
                  if request.request.url.startswith('https://outlook.office.com/') else html(mode))
            request.fulfill(status=200,content_type='text/html',body=body)
        context.route('**/*',route)
        try:
            page=context.new_page();page.goto('https://'+host+'/common/test-fixture')
            with tempfile.TemporaryDirectory() as root:
                result=recover(page,SENDER,PASSWORD,root,sleep=lambda _:page.wait_for_timeout(30))
                self.assertEqual(result['phase'],expected)
                self.assertNotIn(PASSWORD,(Path(root)/'auth-status.json').read_text())
                if expected in ('mfa','rejected'):
                    self.assertEqual(page.evaluate('window.actions'),2)
                    recover(page,SENDER,PASSWORD,root,sleep=lambda _:None)
                    self.assertEqual(page.evaluate('window.actions'),2)
                elif expected=='unknown':
                    self.assertEqual(page.evaluate('window.actions'),0 if host!='login.microsoftonline.com' else 1)
        finally:context.close()

    def test_password_success(self):self.exercise('success','ready')
    def test_username_form_with_an_invisible_autofill_password(self):
        page = self.browser.new_page()
        try:
            body = '<input id="i0116" type="email"><input id="i0118" type="password" aria-hidden="true" tabindex="-1" style="opacity:0">'
            page.route('**/*', lambda route: route.fulfill(content_type='text/html', body=body))
            page.goto('https://login.microsoftonline.com/common/fixture')
            self.assertEqual(screen(page, SENDER), 'username')
        finally:
            page.close()
    def test_choose_password(self):self.exercise('choice','ready')
    def test_mfa_pauses(self):self.exercise('mfa','mfa')
    def test_wrong_password_stops(self):self.exercise('rejected','rejected')
    def test_wrong_account_stops(self):self.exercise('wrong-account','unknown')
    def test_other_host_stops(self):self.exercise('success','unknown','other.invalid')

    def test_passkey_preference_returns_to_password_using_microsoft_back(self):
        for path in ('/common/bridge/fido','/common/fido/get'):
            with self.subTest(path=path):
                context=self.browser.new_context()
                def route(request):
                    if request.request.url.startswith('https://outlook.office.com/'):
                        body='<div role="treeitem" title="'+SENDER+'">Mailbox</div>'
                    elif request.request.url.endswith(path):
                        body='<button id="idBtn_Back" onclick="location.href=\'/common/resume\'">Back</button>'
                    else:body=html('choice')
                    request.fulfill(status=200,content_type='text/html',body=body)
                context.route('**/*',route)
                try:
                    page=context.new_page();page.goto('https://login.microsoft.com'+path)
                    with tempfile.TemporaryDirectory() as root:
                        result=recover(page,SENDER,PASSWORD,root,sleep=lambda _:page.wait_for_timeout(30))
                        self.assertEqual(result['phase'],'ready')
                finally:context.close()

    def test_private_browser_cancel_only_for_recognized_first_factor(self):
        page = self.browser.new_page()
        origin = 'https://login.microsoftonline.com/common/bridge/fido'
        try:
            page.route('**/*', lambda route: route.fulfill(content_type='text/html', body=
                       '<div>' + SENDER + '</div><button id="idBtn_Back">Back</button>'))
            page.goto(origin)
            conn = MagicMock()
            conn.__enter__.return_value = conn
            greeting = b'RFB 003.008\n\x01\x01' + bytes(4) + bytes(20) + bytes([0, 0, 0, 4]) + b'k:95'
            conn.makefile.return_value = io.BytesIO(greeting)
            with patch('outlook_auth.socket.create_connection', return_value=conn) as connect:
                self.assertFalse(cancel_browser_passkey(page, 'other@example.invalid'))
                with page.context.expect_page() as opened:
                    page.evaluate("window.open('about:blank')")
                self.assertFalse(cancel_browser_passkey(page, SENDER))
                opened.value.close()
                connect.assert_not_called()
                self.assertTrue(cancel_browser_passkey(page, SENDER))
                self.assertEqual(conn.sendall.call_args.args, (bytes.fromhex('040100000000ff1b040000000000ff1b'),))
                page.evaluate("document.body.innerHTML += '<p id=idDiv_SAOTCAS_Title>Approve sign in</p>'")
                self.assertFalse(cancel_browser_passkey(page, SENDER))
                connect.assert_called_once_with(('127.0.0.1', 5901), timeout=2)
        finally:
            page.close()


if __name__=='__main__':unittest.main()
