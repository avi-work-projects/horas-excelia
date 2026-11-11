import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from unittest.mock import patch

import model_events as events


class EventQueueTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'runtime'

    def waiter(self):
        child = subprocess.Popen([sys.executable, '-B', str(Path(events.__file__)), '--server', '--runtime', str(self.root)],
                                 stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.addCleanup(lambda: child.kill() if child.poll() is None else None)
        self.addCleanup(lambda: (child.stdout.close(), child.stderr.close()))
        child.stdin.write(b'{"action":"wait"}')
        child.stdin.close()
        child.stdin = None
        return child

    def test_idle_status_is_read_only_and_real_os_wait_wakes_on_request(self):
        self.assertEqual(events.status(self.root)['state'], 'idle')
        self.assertFalse(self.root.exists())
        calls, results = [], []
        checked = threading.Event()
        claim = events._claim
        def counted(runtime):
            result = claim(runtime)
            calls.append(result)
            checked.set()
            return result
        def wait():
            results.append(events.wait_for_request(self.root))
        with patch.object(events, '_claim', counted):
            thread = threading.Thread(target=wait, daemon=True)
            thread.start()
            try:
                self.assertTrue(checked.wait(5))
                time.sleep(0.2)
                self.assertEqual(calls, [None], 'Idle must not query SQLite again without an OS notification')
                events.request(self.root, 'manual', 'synthetic')
                thread.join(5)
                self.assertFalse(thread.is_alive())
            finally:
                if thread.is_alive():
                    events.request(self.root, 'manual', 'cleanup')
                    thread.join(5)
        job = results[0]
        self.assertEqual(job['through'], 1)
        self.assertEqual(events.status(self.root)['state'], 'running')
        before = {p.name:p.read_bytes() for p in self.root.iterdir() if p.is_file()}
        events.status(self.root)
        self.assertEqual(before, {p.name:p.read_bytes() for p in self.root.iterdir() if p.is_file()})

    def test_grouped_requests_and_new_request_during_run_are_not_lost(self):
        events.request(self.root, 'manual', 'synthetic')
        events.request(self.root, 'expense', 'synthetic')
        job = events.wait_for_request(self.root)
        self.assertEqual(job['through'], 2)
        events.request(self.root, 'evidence', 'synthetic')
        state = events.status(self.root)
        self.assertEqual(state['state'], 'running')
        self.assertTrue(state['pending'])
        self.assertEqual(events.finish(self.root, job, {'state':'verified'})['state'], 'queued')
        next_job = events.wait_for_request(self.root)
        self.assertEqual(next_job['through'], 3)
        self.assertNotEqual(next_job['id'], job['id'])
        done = events.finish(self.root, next_job, {'state':'verified'})
        self.assertEqual((done['state'], done['processed_seq'], done['pending']), ('verified', 3, False))

    def test_failure_waits_for_new_manual_action_and_hides_private_errors(self):
        events.request(self.root, 'expense', 'private-user')
        job = events.wait_for_request(self.root)
        result = events.finish(self.root, job, None, 'SECRET /private/document.pdf')
        self.assertEqual(result['state'], 'error')
        self.assertNotIn('SECRET', json.dumps(result))
        self.assertNotIn('private-user', json.dumps(events.status(self.root)))
        child = self.waiter()
        time.sleep(0.2)
        self.assertIsNone(child.poll(), 'A failed job must not be retried automatically')
        self.assertEqual(events.status(self.root)['state'], 'error')
        events.request(self.root, 'manual', 'synthetic')
        out, err = child.communicate(timeout=10)
        self.assertEqual(child.returncode, 0, err.decode(errors='replace'))
        self.assertEqual(json.loads(out)['through'], 2)

    def test_interrupted_job_recovered_and_ack_checks_id_and_through(self):
        events.request(self.root, 'manual', 'synthetic')
        first = self.waiter()
        out, err = first.communicate(timeout=10)
        self.assertEqual(first.returncode, 0, err.decode(errors='replace'))
        job = json.loads(out)
        # The process that claimed the job has exited without finish.
        recovered = events.wait_for_request(self.root)
        self.assertEqual((job['id'], job['through']), (recovered['id'], recovered['through']))
        self.assertTrue(recovered['recovered'])
        with self.assertRaises(ValueError):
            events.finish(self.root, recovered | {'through':99}, {'state':'verified'})
        with self.assertRaises(ValueError):
            events.finish(self.root, recovered, None)
        result = {'state':'verified'}
        done = events.finish(self.root, recovered, result)
        self.assertEqual(events.finish(self.root, recovered, result), done)
        with self.assertRaises(ValueError):
            events.finish(self.root, recovered, None, 'late failure')

    def test_os_lock_survives_orphan_file_and_releases_on_process_death(self):
        lock = Path(self.temp.name) / 'listener.lock'
        lock.write_bytes(b'old lock file left by an earlier process')
        code = 'from model_events import process_lock\nimport sys\nwith process_lock(sys.argv[1]):\n print("LOCKED",flush=True)\n sys.stdin.read()\n'
        environment = dict(os.environ)
        environment['PYTHONPATH'] = str(Path(events.__file__).parent) + os.pathsep + environment.get('PYTHONPATH','')
        child = subprocess.Popen([sys.executable, '-B', '-c', code, str(lock)], env=environment,
                                 stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            self.assertEqual(child.stdout.readline().strip(), b'LOCKED')
            with self.assertRaises(RuntimeError):
                with events.process_lock(lock):
                    pass
            child.kill()
            child.communicate(timeout=10)
            with events.process_lock(lock):
                self.assertTrue(lock.exists())
            self.assertTrue(lock.exists(), 'Never unlink an OS lock inode')
        finally:
            if child.poll() is None:
                child.kill()
                child.communicate(timeout=10)


if __name__ == '__main__':
    unittest.main()
