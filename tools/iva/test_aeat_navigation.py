"""Run the rendered AEAT JavaScript in Node with an inert DOM and transport."""
import json
import re
import shutil
import subprocess
import unittest

import test_aeat_web as render_fixtures


NODE = shutil.which('node')
HARNESS = r"""
const assert = require('node:assert/strict');
const vm = require('node:vm');
const input = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));

function element(tag) {
  let content = '';
  return {
    tag, disabled: false, listeners: {}, children: [], scrolls: 0,
    get textContent() { return content; },
    set textContent(value) { content = String(value); this.children = []; },
    set innerHTML(value) { throw new Error('Unsafe HTML insertion'); },
    addEventListener(type, listener) { this.listeners[type] = listener; },
    append(child) { this.children.push(child); },
    scrollIntoView() { this.scrolls++; },
  };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}
const out = element('p');
const forms = Object.fromEntries(input.forms.map(id => [id, element('form')]));
for (const form of Object.values(forms)) {
  form.elements = {};
  form.confirmed = {checked: false};
}
const actions = input.actions.map(action => Object.assign(element('button'), {
  dataset: {aeatAction: action},
}));
const buttons = [...actions, ...Object.values(forms).map(() => element('button'))];
const events = {}, calls = [], navigations = [];
const pending = deferred();
const location = {
  pathname: '/facturas/modelos/aeat', search: '?periodo=3T',
  set href(url) { navigations.push({url, guard: unload()}); },
};
function unload() {
  const event = {prevented: false, preventDefault() { this.prevented = true; }};
  events.beforeunload(event);
  return {prevented: event.prevented, returnValue: event.returnValue};
}
const document = {
  getElementById(id) { return id === 'aeat-result' ? out : forms[id] || null; },
  querySelectorAll(selector) {
    if (selector === '.aeat-page button') return buttons;
    if (selector === '[data-aeat-action]') return actions;
    throw new Error('Unexpected selector: ' + selector);
  },
  createElement(tag) { assert.equal(tag, 'a'); return element(tag); },
};
vm.runInNewContext(input.script, {
  document, location,
  addEventListener(type, listener) { events[type] = listener; },
  fetch(url, options) { calls.push({url, options}); return pending.promise; },
}, {timeout: 1000});

const flush = () => new Promise(resolve => setImmediate(resolve));
function click(action) {
  const button = actions.find(b => b.dataset.aeatAction === action);
  assert.ok(button, 'The rendered page must expose the tested action');
  // Dispatch twice even when disabled to exercise the busy guard itself.
  button.listeners.click();
}
function submit() {
  const form = forms['aeat-submit'];
  const event = {target: form, prevented: false, preventDefault() { this.prevented = true; }};
  form.listeners.submit(event);
  assert.equal(event.prevented, true);
}
function assertPending() {
  assert.equal(calls.length, 1);
  assert.deepEqual(unload(), {prevented: true, returnValue: ''});
  assert.ok(buttons.every(b => b.disabled));
  assert.equal(out.scrolls, 1);
  assert.equal(navigations.length, 0);
}
function assertIdle() {
  assert.deepEqual(unload(), {prevented: false, returnValue: undefined});
}
function request() {
  assert.equal(calls[0].url, '/facturas/modelos/aeat');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers['X-CSRF'], 'test-csrf');
  return JSON.parse(calls[0].options.body);
}

(async () => {
  assertIdle();
  if (input.scenario === 'success') {
    click('check_connection');
    click('check_connection');
    assertPending();
    assert.match(out.textContent, /Consultando Hacienda/);
    assert.equal(request().action, 'check_connection');
    const decoded = deferred();
    pending.resolve({ok: true, json: () => decoded.promise});
    await flush();
    assertPending(); // Reading the response is still part of the operation.
    const url = '/facturas/modelos/aeat?periodo=3T&conexion=1#certificado';
    decoded.resolve({message: 'Conexión confirmada.', url});
    await flush();
    assert.equal(out.textContent, 'Conexión confirmada.');
    assert.deepEqual(navigations, [{url, guard: {prevented: false, returnValue: undefined}}]);
    assertIdle();
    assert.equal(calls.length, 1);
  } else if (input.scenario === 'submit') {
    submit();
    assert.equal(calls.length, 0); // Exact review still requires the checkbox.
    forms['aeat-submit'].confirmed.checked = true;
    submit();
    submit();
    assertPending();
    assert.match(out.textContent, /Enviando la declaración/);
    const data = request();
    assert.equal(data.action, 'submit');
    assert.deepEqual(data.confirmation, {...input.confirmation, confirmed: true});
    const url = '/facturas/modelos/aeat?periodo=3T&id=' + data.operation_id;
    pending.resolve({ok: true, json: async () => ({url})});
    await flush();
    assert.equal(out.textContent, 'Acción completada.');
    assert.deepEqual(navigations, [{url, guard: {prevented: false, returnValue: undefined}}]);
    assertIdle();
    assert.equal(calls.length, 1);
  } else {
    click('check_connection');
    click('check_connection');
    assertPending();
    const attack = '<img src=x onerror="globalThis.executed=true">';
    if (input.scenario === 'http_error') {
      pending.resolve({ok: false, json: async () => ({message: attack, url: 'https://invalid.example/'})});
    } else if (input.scenario === 'network_error') {
      pending.reject(new Error(attack));
    } else {
      assert.equal(input.scenario, 'json_error');
      pending.resolve({ok: true, json: async () => { throw new Error(attack); }});
    }
    await flush();
    assert.equal(out.textContent, attack + ' Vuelve a cargar esta vista para comprobar el estado antes de repetir.');
    assert.equal(out.children.length, 1);
    assert.equal(out.children[0].tag, 'a');
    assert.equal(out.children[0].href, location.pathname + location.search);
    assert.equal(out.children[0].textContent, ' Volver a cargar');
    assert.equal(navigations.length, 0);
    assert.equal(calls.length, 1);
    assert.ok(buttons.every(b => b.disabled));
    assertIdle();
  }
  process.stdout.write(JSON.stringify({ok: true, scenario: input.scenario}));
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
"""


@unittest.skipUnless(NODE, 'Node is required to execute the rendered JavaScript')
class AeatNavigationTests(unittest.TestCase):
    def setUp(self):
        self.fixture = render_fixtures.RenderTests()
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        markup, controls = self.fixture.render()
        scripts = re.findall(r'<script>(.*?)</script>', markup, re.S)
        self.assertEqual(len(scripts), 1)
        self.input = dict(script=scripts[0], forms=list(controls.forms),
                          actions=list(controls.actions), confirmation=self.fixture.confirmation)

    def run_scenario(self, scenario):
        result = subprocess.run([NODE, '-e', HARNESS],
                                input=json.dumps(self.input | {'scenario':scenario}),
                                text=True, encoding='utf-8', capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout), {'ok':True, 'scenario':scenario})

    def test_pending_request_guards_exit_but_success_redirect_does_not(self):
        self.run_scenario('success')

    def test_confirmed_submission_sends_once_and_redirects_without_warning(self):
        self.run_scenario('submit')

    def test_http_error_is_text_and_requires_manual_reload_without_redirect(self):
        self.run_scenario('http_error')

    def test_transport_and_json_errors_clear_guard_without_automatic_retry(self):
        for scenario in ('network_error','json_error'):
            with self.subTest(scenario=scenario):
                self.run_scenario(scenario)


if __name__ == '__main__':
    unittest.main()
