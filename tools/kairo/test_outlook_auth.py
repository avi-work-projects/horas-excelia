"""Synthetic sign-in transitions. No real credential, browser session or mail."""
import json
import tempfile
import unittest
import threading
from http.server import ThreadingHTTPServer
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from outlook_auth import recover, public_state, read_state, write_state, choose_page

SENDER = 'person@example.invalid'
SECRET = 'synthetic-only-never-a-real-password'


class Locator:
    def __init__(self, page, name): self.page, self.name = page, name
    def count(self): return int(self.is_visible())
    def is_visible(self):
        return self.name == self.page.phase or self.name == 'next' and self.page.phase in ('username','password','stay_signed_in')
    def nth(self, _): return self
    def fill(self, value): self.page.fills.append((self.name,value))
    def click(self, **_):
        self.page.clicks += 1
        self.page.phase = self.page.transitions.pop(0)
    def get_attribute(self, _): return SENDER


class Page:
    def __init__(self, phase='username', transitions=None, host='login.microsoftonline.com'):
        self.phase, self.transitions = phase, list(transitions or [])
        self.host, self.fills, self.clicks = host, [], 0
    @property
    def url(self): return 'https://'+('outlook.office.com/mail/' if self.phase=='ready' else self.host+'/common/login')
    def locator(self, selector):
        name = {'#i0116':'username','#i0118':'password','#idSIButton9':'next',
                '#idDiv_SAOTCAS_Title':'mfa','#passwordError':'rejected',
                '#KmsiDescription':'stay_signed_in','#tilesHolder [data-test-id]':'account'}.get(selector,'absent')
        return Locator(self,name)
    def get_by_text(self, _):
        if _.pattern.startswith('^(Use my password'):
            return Locator(self,'password_choice')
        return Locator(self,'password' if getattr(self,'correct_account',True) else 'absent')
    def goto(self,*_,**__):self.phase='username'


class AuthTests(unittest.TestCase):
    def run_auth(self, page, root):
        with patch('outlook_auth.mailbox_matches', side_effect=lambda p,s:p.phase=='ready'):
            return recover(page,SENDER,SECRET,root,sleep=lambda _:None)

    def test_known_username_password_and_stay_signed_in(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page(transitions=['password','stay_signed_in','ready'])
            self.assertEqual(self.run_auth(page,root)['phase'],'ready')
            self.assertEqual(page.fills,[('username',SENDER),('password',SECRET)])
            self.assertEqual(page.clicks,3)
            self.assertNotIn(SECRET,(Path(root)/'auth-status.json').read_text())
            self.assertEqual(set(public_state(root)),{'phase','checkedAt'})

    def test_password_choice_then_verified_account_password(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page('password_choice',['password','ready'])
            self.assertEqual(self.run_auth(page,root)['phase'],'ready')
            self.assertEqual(page.fills,[('password',SECRET)])
            self.assertEqual(page.clicks,2)

    def test_mfa_pauses_and_never_repeats_after_restart(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page(transitions=['password','mfa'])
            self.assertEqual(self.run_auth(page,root)['phase'],'mfa')
            self.assertTrue(read_state(root)['paused'])
            self.run_auth(page,root);self.assertEqual(page.clicks,2)
            page.phase='ready';self.assertEqual(self.run_auth(page,root)['phase'],'ready')
            self.assertFalse(read_state(root)['paused'])

    def test_rejected_password_latches_one_attempt(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page('password',['rejected'])
            self.assertEqual(self.run_auth(page,root)['phase'],'rejected')
            for _ in range(3): self.run_auth(page,root)
            self.assertEqual(page.clicks,1)

    def test_unknown_host_never_receives_password(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page('password',host='login.microsoftonline.com.attacker.invalid')
            self.assertEqual(self.run_auth(page,root)['phase'],'unknown')
            self.assertEqual(page.fills,[]);self.assertEqual(page.clicks,0)

    def test_password_for_another_account_is_not_filled(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page('password',['ready']);page.correct_account=False
            self.assertEqual(self.run_auth(page,root)['phase'],'unknown')
            self.assertEqual(page.fills,[])

    def test_status_never_exposes_private_fields(self):
        with tempfile.TemporaryDirectory() as root:
            (Path(root)/'auth-status.json').write_text(json.dumps({'phase':'mfa','password':SECRET}))
            self.assertNotIn(SECRET,json.dumps(public_state(root)))
            self.assertEqual(public_state(root)['phase'],'mfa')

    def test_interrupted_attempt_is_not_replayed_and_wait_is_bounded(self):
        with tempfile.TemporaryDirectory() as root:
            write_state(root,'reauthenticating',paused=True)
            page=Page('password',['ready'])
            self.run_auth(page,root);self.assertEqual(page.fills,[])
            write_state(root,'waiting')
            loading=Page('loading')
            self.assertEqual(self.run_auth(loading,root)['phase'],'unknown')
            self.assertTrue(read_state(root)['paused'])

    def test_account_picker_only_uses_the_matching_tile(self):
        with tempfile.TemporaryDirectory() as root:
            page=Page('account',['password','ready'])
            self.assertEqual(self.run_auth(page,root)['phase'],'ready')
            self.assertEqual(page.fills,[('password',SECRET)])

    def test_corrupt_state_requires_review_instead_of_replaying_password(self):
        with tempfile.TemporaryDirectory() as root:
            (Path(root)/'auth-status.json').write_text('{broken')
            page=Page('password',['ready'])
            self.assertEqual(self.run_auth(page,root)['phase'],'unknown')
            self.assertEqual(page.fills,[])
            self.assertEqual(public_state(root)['phase'],'unknown')

    def test_replacing_secret_explicitly_allows_a_fresh_login(self):
        with tempfile.TemporaryDirectory() as root:
            write_state(root,'waiting')
            page=Page('rejected',['password','ready'])
            self.assertEqual(self.run_auth(page,root)['phase'],'ready')
            self.assertEqual(page.clicks,2)

    def test_mail_tab_identity_survives_redirects_and_ignores_old_login_tabs(self):
        with tempfile.TemporaryDirectory() as root:
            pages=[SimpleNamespace(url=url) for url in ['https://outlook.office.com/mail/','https://login.microsoftonline.com/common/authorize','https://login.microsoftonline.com/common/login']]
            context=SimpleNamespace(pages=pages)
            def session(page):return SimpleNamespace(send=lambda _:dict(targetInfo=dict(targetId=str(pages.index(page)))),detach=lambda:None)
            context.new_cdp_session=session
            for page in pages:page.context=context
            browser=SimpleNamespace(contexts=[context])
            self.assertIs(choose_page(browser,root),pages[0])
            pages[0].url='https://login.microsoftonline.com/common/password'
            self.assertIs(choose_page(browser,root),pages[0])
            pages[1].url='https://outlook.office.com/mail/'
            pages[0].url='https://outlook.office.com/mail/drafts'
            self.assertIsNone(choose_page(browser,root))

    def test_health_endpoint_checks_owner_origin_and_exposes_no_secret(self):
        from hours_service import make_handler
        from hours_store import Store
        with tempfile.TemporaryDirectory() as root:
            write_state(root,'mfa',paused=True)
            cfg={'private_origin':'https://kairo.invalid','app_origin':'https://app.invalid','owner':'test-owner','sender':SENDER}
            handler=make_handler(cfg,Store(root),lambda *_:self.fail('No debe consultar Outlook'))
            server=ThreadingHTTPServer(('127.0.0.1',0),handler)
            thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
            headers={'Host':'kairo.invalid','Origin':'https://app.invalid','Tailscale-User-Login':'test-owner'}
            url='http://127.0.0.1:'+str(server.server_port)+'/auth-status'
            try:
                with urlopen(Request(url,headers=headers),timeout=3) as response:
                    value=json.load(response);self.assertEqual(value['phase'],'mfa');self.assertEqual(set(value),{'phase','checkedAt'})
                for change in ({'Origin':'https://other.invalid'},{'Tailscale-User-Login':'other'}):
                    with self.assertRaises(HTTPError) as failure:urlopen(Request(url,headers=headers|change),timeout=3)
                    self.assertEqual(failure.exception.code,403)
            finally:server.shutdown();server.server_close();handler.jobs.close();thread.join(timeout=3)


if __name__ == '__main__': unittest.main()
