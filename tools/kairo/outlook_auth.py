"""Bounded password re-entry. The secret is supplied by systemd credentials.

Only recognized Microsoft sign-in controls may be used. MFA, rejected passwords
and unknown screens latch a pause. No mail operations, tokens, screenshots or
browser traces are collected. The mail writer's process lock is shared.
"""
import argparse
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from outlook_hours import mailbox_matches, outlook_page

PHASES = {'disabled', 'ready', 'checking', 'reauthenticating', 'mfa', 'rejected',
          'unknown', 'browser_unavailable', 'waiting'}
LOGIN_HOSTS = {'login.microsoftonline.com', 'login.microsoft.com'}
MFA_SELECTORS = ('#idDiv_SAOTCAS_Title', '#idDiv_SAOTCS_Proofs', '#idTxtBx_SAOTCC_OTC',
                 '#idDiv_SAOTCC_Description', '#idTxtBx_SAOTCS_ProofConfirmation',
                 'input[name="otc"]', 'input[name="VerificationCode"]',
                 'input[autocomplete="one-time-code"]')


def public_state(root):
    try:
        value = json.loads((Path(root)/'auth-status.json').read_text())
        if value['phase'] not in PHASES:
            raise ValueError()
        return {key: value.get(key) for key in ('phase', 'checkedAt')}
    except FileNotFoundError:
        return {'phase': 'disabled', 'checkedAt': None}
    except (OSError, ValueError, KeyError, TypeError):
        return {'phase': 'unknown', 'checkedAt': None}


def read_state(root):
    try:
        value = json.loads((Path(root)/'auth-status.json').read_text())
        if value['phase'] not in PHASES or not isinstance(value['paused'],bool):
            raise ValueError()
        if value.get('checkedAt') is not None and not datetime.fromisoformat(value['checkedAt']).tzinfo:
            raise ValueError()
        return {key:value.get(key) for key in ('phase','paused','checkedAt')}
    except FileNotFoundError:
        return {}
    except (OSError, ValueError, KeyError, TypeError):
        return {'phase':'unknown','paused':True}


def write_state(root, phase, paused=False):
    root = Path(root)
    value = dict(phase=phase, paused=paused,
                 checkedAt=datetime.now(timezone.utc).isoformat())
    target = root/'auth-status.json'
    temporary = root/'auth-status.tmp'
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as stream:
        json.dump(value, stream)
    os.replace(temporary, target)
    return value


def visible(page, selector):
    locator = page.locator(selector)
    return locator.count() == 1 and locator.is_visible()


def account_tile(page, sender):
    tiles = page.locator('#tilesHolder [data-test-id]')
    found = [tiles.nth(i) for i in range(tiles.count())
             if (tiles.nth(i).get_attribute('data-test-id') or '').casefold() == sender.casefold()
             and tiles.nth(i).is_visible()]
    return found[0] if len(found) == 1 else None


def password_choice(page):
    choices = page.get_by_text(re.compile(r'^(Use my password|Usar mi contraseña)$', re.I))
    return choices if choices.count() == 1 and choices.is_visible() else None


def screen(page, sender):
    if outlook_page(page.url):
        if mailbox_matches(page, sender):
            return 'ready'
        return 'unknown' if page.locator('[role=treeitem]').count() else 'checking'
    url = urlsplit(page.url)
    if (url.scheme != 'https' or url.hostname not in LOGIN_HOSTS
            or url.port not in (None, 443) or url.username or url.password):
        return 'unknown'
    if any(visible(page, selector) for selector in MFA_SELECTORS):
        return 'mfa'
    if any(visible(page, selector) for selector in ('#passwordError', '#usernameError')):
        return 'rejected'
    if visible(page, '#i0118'):
        labels = page.get_by_text(re.compile('^'+re.escape(sender)+'$', re.I))
        return 'password' if any(labels.nth(i).is_visible() for i in range(labels.count())) else 'unknown'
    if visible(page, '#i0116'):
        return 'username'
    if password_choice(page) is not None:
        return 'password_choice'
    if visible(page, '#KmsiDescription') and visible(page, '#idSIButton9'):
        return 'stay_signed_in'
    if account_tile(page, sender) is not None:
        return 'account'
    return 'checking'


def recover(page, sender, password, root, sleep=time.sleep):
    previous = read_state(root)
    phase = screen(page, sender)
    loading = phase == 'checking' and outlook_page(page.url)
    waited = (datetime.now(timezone.utc)-datetime.fromisoformat(previous['checkedAt'])).total_seconds() if previous.get('checkedAt') else 0
    restart_loading = loading and (previous.get('phase') == 'waiting' or previous.get('phase') == 'checking' and waited >= 30)
    if not previous.get('paused') and (restart_loading or phase == 'rejected' and previous.get('phase') == 'waiting'):
        # Only an operator replacing the credential may clear a previous failure.
        # Start a fresh Outlook sign-in rather than reusing a rejected POST form.
        if page.locator('[contenteditable=true]:visible').count():
            return previous
        write_state(root, 'reauthenticating', paused=True)
        page.goto('https://outlook.office.com/mail/', wait_until='domcontentloaded', timeout=15000)
        phase = screen(page, sender)
    if phase == 'ready':
        return write_state(root, 'ready')
    # Observing a manual successful login releases a pause. A restart alone does not.
    if phase in ('mfa', 'rejected'):
        return write_state(root, phase, paused=True)
    if previous.get('paused'):
        if previous.get('phase') == 'reauthenticating':
            return write_state(root, 'unknown', paused=True)
        return previous
    if phase in ('mfa', 'rejected', 'unknown'):
        return write_state(root, phase, paused=True)
    if phase == 'checking' and outlook_page(page.url):
        if not restart_loading:
            return previous if previous.get('phase') == 'checking' else write_state(root, phase)
    # Persist the reservation before any interaction. A crash must not replay it.
    write_state(root, 'reauthenticating', paused=True)
    used = set()
    for _ in range(20):
        phase = screen(page, sender)
        if phase == 'ready':
            return write_state(root, 'ready')
        if phase in ('mfa', 'rejected', 'unknown'):
            return write_state(root, phase, paused=True)
        if phase in ('username', 'password', 'stay_signed_in', 'account', 'password_choice') and phase not in used:
            if phase not in ('account', 'password_choice') and not visible(page, '#idSIButton9'):
                return write_state(root, 'unknown', paused=True)
            used.add(phase)
            if phase == 'account':
                account_tile(page, sender).click(timeout=5000)
            elif phase == 'password_choice':
                password_choice(page).click(timeout=5000)
            elif phase == 'username':
                page.locator('#i0116').fill(sender)
            elif phase == 'password':
                page.locator('#i0118').fill(password)
            if phase not in ('account', 'password_choice'):
                page.locator('#idSIButton9').click(timeout=5000)
        sleep(1)
    return write_state(root, 'unknown', paused=True)


def choose_page(browser, root):
    pages = [page for context in browser.contexts for page in context.pages]
    active = [page for page in pages if outlook_page(page.url)]
    if len(active)>1:return None
    candidates = [page for page in pages if outlook_page(page.url) or urlsplit(page.url).hostname in LOGIN_HOSTS]
    try:
        target = json.loads((Path(root)/'auth-target.json').read_text())['id']
    except (OSError,ValueError,KeyError,TypeError):target = None
    identities = []
    for page in candidates:
        session = page.context.new_cdp_session(page)
        try:identifier = session.send('Target.getTargetInfo')['targetInfo']['targetId']
        finally:session.detach()
        identities.append((page,identifier))
    matched = [(page,identifier) for page,identifier in identities if identifier == target]
    selected = active[0] if len(active) == 1 else matched[0][0] if len(matched) == 1 else candidates[0] if len(candidates) == 1 else None
    if selected is not None:
        identifier = next(value for page,value in identities if page == selected)
        if identifier != target:
            path = Path(root)/'auth-target.json'
            fd = os.open(path,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
            with os.fdopen(fd,'w') as stream:json.dump({'id':identifier},stream)
    return selected


def probe(config, password):
    import fcntl
    root = Path(config['state_dir'])
    # Non-blocking: do not interrupt a reader, composer or writer using Chromium.
    with (root/'browser.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        from playwright.sync_api import sync_playwright
        try:
            with sync_playwright() as runtime:
                browser = runtime.chromium.connect_over_cdp('http://127.0.0.1:9223', timeout=5000)
                page = choose_page(browser,root)
                if page is None:
                    if not read_state(root).get('paused'):
                        write_state(root, 'unknown', paused=True)
                    return
                recover(page, config['sender'], password, root)
                # Stopping Playwright disconnects CDP; never close the user's browser.
        except Exception:
            if not read_state(root).get('paused'):
                write_state(root, 'browser_unavailable')
            # Exceptions may include field values. Never print them or a traceback.


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, required=True)
    args = parser.parse_args()
    config = json.loads(args.config.read_text())
    credential = Path(os.environ['CREDENTIALS_DIRECTORY'])/'outlook-password'
    try:password = credential.read_text(encoding='utf-8')
    except (OSError,UnicodeError):raise SystemExit('Credencial no disponible') from None
    if not password or len(password) > 1024:
        raise SystemExit('Credencial no disponible')
    while True:
        probe(config, password)
        time.sleep(15)


if __name__ == '__main__':
    main()
