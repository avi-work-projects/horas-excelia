import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import listen_models as listener


class StopListener(BaseException):
    pass


class ListenerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.config = Path(self.temp.name) / 'private.json'
        self.config.write_text('{}')

    def test_startup_and_transport_reconnection_do_not_run_worker(self):
        calls, pauses, work = [], [], []
        def transport(config, supplied):
            calls.append(supplied)
            if len(calls) < 3:
                raise listener.TransportError()
            raise StopListener()
        with self.assertRaises(StopListener):
            listener.listen(self.config, transport, lambda path: work.append(path), pauses.append)
        self.assertEqual([c['action'] for c in calls], ['wait', 'wait', 'wait'])
        self.assertEqual(pauses, [1, 2])
        self.assertEqual(work, [])

    def test_lost_finish_response_retries_ack_without_rerunning_worker(self):
        calls, work = [], []
        job = {'id':'synthetic', 'through':7}
        def transport(config, supplied):
            calls.append(supplied)
            if len(calls) == 1:
                return job
            if len(calls) == 2:
                raise listener.TransportError()
            if len(calls) == 3:
                return {'state':'verified'}
            raise StopListener()
        def worker(path):
            work.append(path)
            return {'state':'verified'}
        with self.assertRaises(StopListener):
            listener.listen(self.config, transport, worker, lambda _: None)
        self.assertEqual([c['action'] for c in calls], ['wait', 'finish', 'finish', 'wait'])
        self.assertEqual(calls[1], calls[2])
        self.assertEqual(len(work), 1)

    def test_worker_failure_is_terminal_until_next_request(self):
        calls, work = [], []
        def transport(config, supplied):
            calls.append(supplied)
            if len(calls) == 1:
                return {'id':'synthetic', 'through':1}
            if len(calls) == 2:
                return {'state':'error'}
            raise StopListener()
        def worker(path):
            work.append(path)
            raise ValueError('synthetic fiscal failure')
        with self.assertRaises(StopListener):
            listener.listen(self.config, transport, worker, lambda _: self.fail('No backoff for fiscal errors'))
        self.assertEqual([c['action'] for c in calls], ['wait', 'finish', 'wait'])
        self.assertEqual(calls[1]['error'], 'synthetic fiscal failure')
        self.assertEqual(len(work), 1)

    def test_ssh_wait_has_no_timeout_and_reuses_existing_connection_fields(self):
        config = dict(ssh_key='existing-key', host='existing-host', remote_python='/venv/bin/python',
                      remote_script='/private/tools/sync_models.py', remote_runtime='/private/runtime')
        with patch('listen_models.subprocess.run') as run:
            run.return_value.returncode = 0
            run.return_value.stdout = b'{"id":"job","through":1}'
            listener.remote(config, {'action':'wait'})
        args, kwargs = run.call_args
        self.assertNotIn('timeout', kwargs)
        self.assertIn('existing-key', args[0])
        self.assertIn('existing-host', args[0])
        self.assertIn('/private/tools/model_events.py', args[0][-1])
        self.assertEqual(json.loads(kwargs['input']), {'action':'wait'})


if __name__ == '__main__':
    unittest.main()
