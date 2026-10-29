"""Offline DOM contract. Launches a separate Chromium, never the live profile."""
import json
import tempfile
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright
from outlook_auth import recover

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
    def test_choose_password(self):self.exercise('choice','ready')
    def test_mfa_pauses(self):self.exercise('mfa','mfa')
    def test_wrong_password_stops(self):self.exercise('rejected','rejected')
    def test_wrong_account_stops(self):self.exercise('wrong-account','unknown')
    def test_other_host_stops(self):self.exercise('success','unknown','other.invalid')


if __name__=='__main__':unittest.main()
