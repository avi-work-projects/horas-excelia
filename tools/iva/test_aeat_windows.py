"""Windows certificate/HTTP boundary: synthetic responses, no tax service calls."""
import base64
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time
import unittest
from unittest.mock import patch

from aeat_windows import ERROR, HOSTS, WindowsTransport, _invoke


THUMBPRINT = 'A' * 40
URL = 'https://prewww2.aeat.es/wlpl/PFTW-PICW/ServValiDos'
HEADERS = {'Accept': 'application/json', 'Accept-Encoding': 'identity', 'User-Agent': 'Kairo-AEAT/1'}


class WindowsTransportTests(unittest.TestCase):
    def setUp(self):
        self.calls = []
        self.response = {'status': 200, 'headers': {'content-type': 'application/json'}, 'body': 'e30='}
        self.transport = WindowsTransport(THUMBPRINT, invoke=self.invoke)

    def invoke(self, request):
        self.calls.append(request)
        return self.response

    def call(self, **overrides):
        values = dict(method='POST', url=URL, body=b'{}', headers=HEADERS,
                      timeout=10, max_bytes=1024, client_certificate=False)
        values.update(overrides)
        return self.transport(**values)

    def test_client_callback_preserves_bytes_headers_and_certificate_choice(self):
        body = 'Documento de ensayo: año'.encode()
        self.assertEqual(self.call(body=body), (200, {'content-type': 'application/json'}, b'{}'))
        self.assertEqual(base64.b64decode(self.calls[0]['body']), body)
        self.assertEqual(self.calls[0]['headers']['Accept-Encoding'], 'identity')
        self.assertIs(self.calls[0]['client_certificate'], False)
        self.call(client_certificate=True)
        self.assertIs(self.calls[-1]['client_certificate'], True)

    def test_exact_hosts_and_no_credentials_or_alternate_ports(self):
        for host in HOSTS:
            with self.subTest(host=host):
                self.call(url='https://' + host + '/wlpl/test')
        self.calls.clear()
        for url in ('http://prewww2.aeat.es/', 'https://www3.agenciatributaria.gob.es/',
                    'https://prewww2.aeat.es.example.test/', 'https://prewww2.aeat.es.:443/',
                    'https://user:secret@prewww2.aeat.es/', 'https://prewww2.aeat.es:444/',
                    'https://prewww2.aeat.es/#secret', 'https://prewww2.aeat.es\\@example.test/',
                    'https://prewww2.aeat.es/\nsecret'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                self.call(url=url)
        self.assertEqual(self.calls, [])

    def test_invalid_limits_and_headers_fail_before_process(self):
        for changed in ({'timeout': float('nan')}, {'timeout': float('inf')}, {'timeout': True},
                        {'timeout': 0}, {'timeout': 121}, {'max_bytes': True}, {'max_bytes': 0},
                        {'max_bytes': 33554433}, {'client_certificate': 'false'},
                        {'headers': {'Authorization': 'secret'}},
                        {'headers': {'Accept': 'a\r\nHost: example.test'}},
                        {'headers': {'Accept-Encoding': 'gzip'}},
                        {'headers': {'Accept': 'a', 'accept': 'b'}},
                        {'method': 'GET', 'body': b'{}'}, {'body': 'not bytes'}):
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.call(**changed)
        self.assertEqual(self.calls, [])

    def test_malformed_excessive_and_redirect_responses_are_rejected(self):
        for changed in ({'body': 'invalid!'}, {'body': 'e30=' * 800},
                        {'status': True}, {'status': 302}, {'status': 307},
                        {'headers': {'content-type': ['bad']}}, {'headers': None}):
            self.response = dict(status=200, headers={}, body='e30=') | changed
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                self.call()

    def test_certificate_result_exposes_only_required_public_metadata(self):
        self.response = {'certificate': {'sha256': 'b' * 64, 'subject': 'CN=Test',
                         'not_after': '2029-05-21T09:12:36.0000000Z',
                         'has_private_key': True, 'unexpected': 'must not escape'}}
        result = self.transport.certificate()
        self.assertEqual(set(result), {'sha256', 'subject', 'not_after', 'has_private_key'})
        self.response['certificate']['has_private_key'] = False
        with self.assertRaises(ValueError):
            self.transport.certificate()

    @unittest.skipUnless(os.name == 'nt', 'Windows subprocess boundary')
    def test_child_data_and_timeout_do_not_leak_in_errors(self):
        result = subprocess.CompletedProcess([], 1, b'{"ok":false,"secret":"hidden"}', b'private error')
        for outcome in (result, subprocess.TimeoutExpired('private command', 1, output=b'private')):
            with patch('aeat_windows.subprocess.run') as run:
                if isinstance(outcome, Exception):
                    run.side_effect = outcome
                else:
                    run.return_value = outcome
                with self.assertRaises(ValueError) as failure:
                    _invoke({'action': 'certificate', 'thumbprint': THUMBPRINT})
                self.assertEqual(str(failure.exception), ERROR)


# Tests execute the production helper with only its network handler substituted.
# The fake runs in-process, makes no socket connections and needs no certificate.
FAKE_HTTP = r'''
Add-Type -AssemblyName System.Net.Http
Add-Type -ReferencedAssemblies System.Net.Http -TypeDefinition @"
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
public class UnseekableBytes : MemoryStream {
    public UnseekableBytes(byte[] data) : base(data) {}
    public override bool CanSeek { get { return false; } }
}
public class SyntheticHttpHandler : HttpMessageHandler {
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token) {
        string path = request.RequestUri.AbsolutePath;
        if (path == "/timeout") await Task.Delay(10000, token);
        var response = new HttpResponseMessage(HttpStatusCode.OK);
        if (path == "/redirect") {
            response.StatusCode = HttpStatusCode.Redirect;
            response.Headers.Location = new Uri("https://example.test/secret");
        }
        if (path == "/large-header") response.Content = new ByteArrayContent(new byte[4096]);
        else if (path == "/large-stream") response.Content = new StreamContent(new UnseekableBytes(new byte[4096]));
        else response.Content = new ByteArrayContent(new byte[] {123,125});
        return response;
    }
}
"@
'''


@unittest.skipUnless(os.name == 'nt', 'Native Windows helper')
class NativeHelperTests(unittest.TestCase):
    def run_helper(self, request, *, synthetic=False):
        executable = Path(os.environ.get('SystemRoot', 'C:/Windows')) / 'System32/WindowsPowerShell/v1.0/powershell.exe'
        source = Path(__file__).with_name('aeat_windows.ps1').read_text(encoding='utf-8')
        with tempfile.TemporaryDirectory() as temp:
            helper = Path(temp)/'helper.ps1'
            if synthetic:
                original = '$http = New-Object System.Net.Http.HttpClient($handler)'
                self.assertEqual(source.count(original), 1)
                source = FAKE_HTTP + source.replace(original, '$http = New-Object System.Net.Http.HttpClient((New-Object SyntheticHttpHandler))')
            helper.write_text(source, encoding='utf-8')
            result = subprocess.run([str(executable), '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
                                     '-File', str(helper)], input=json.dumps(request).encode(), capture_output=True, timeout=25,
                                    creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        # Never include stderr or malformed output in an assertion: data may be private.
        self.assertTrue(result.stdout.startswith(b'{'), 'Helper did not return its bounded JSON result')
        return json.loads(result.stdout.decode('utf-8-sig'))

    def request(self, path, **changes):
        return dict(action='request', thumbprint=THUMBPRINT, method='GET', url='https://www1.agenciatributaria.gob.es'+path,
                    body=None, headers=HEADERS, timeout=1, max_bytes=1024, client_certificate=False) | changes

    def test_native_allowlist_rejects_before_network_or_certificate(self):
        result = self.run_helper(self.request('/', url='https://example.test/private', client_certificate=True))
        self.assertIs(result['ok'], False)
        self.assertEqual(result['stage'], 'request_validation')
        self.assertNotIn('private', json.dumps(result))

    def test_native_http_reads_bounded_response_and_refuses_redirect(self):
        result = self.run_helper(self.request('/ok'), synthetic=True)
        self.assertIs(result['ok'], True)
        self.assertEqual(base64.b64decode(result['body']), b'{}')
        for path in ('/redirect', '/large-header', '/large-stream'):
            with self.subTest(path=path):
                result = self.run_helper(self.request(path), synthetic=True)
                self.assertIs(result['ok'], False)
                self.assertEqual(result['stage'], 'http_response')

    def test_native_timeout_is_total_deadline_without_retry(self):
        started = time.monotonic()
        result = self.run_helper(self.request('/timeout'), synthetic=True)
        self.assertIs(result['ok'], False)
        self.assertEqual(result['stage'], 'http_send')
        self.assertLess(time.monotonic()-started, 8)

    @unittest.skipUnless(os.environ.get('AEAT_WINDOWS_TEST_CERTIFICATE'), 'Opt-in read of local public certificate metadata')
    def test_native_store_without_certificate_provider(self):
        # Public metadata only. No signing, export or network request.
        result = self.run_helper({'action': 'certificate', 'thumbprint': os.environ['AEAT_WINDOWS_TEST_CERTIFICATE']})
        self.assertIs(result['ok'], True)
        metadata = result['certificate']
        self.assertEqual(len(metadata['sha256']), 64)
        self.assertIs(metadata['has_private_key'], True)
        self.assertEqual(set(metadata), {'sha256', 'subject', 'not_after', 'has_private_key'})


if __name__ == '__main__':
    unittest.main()
