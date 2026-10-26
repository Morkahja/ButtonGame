"""Integration tests for Button Game desktop LAN HTTP host (standard library)."""
import importlib.util
import json
import tempfile
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

SERVER_FILE = Path(__file__).resolve().parents[1] / "scripts" / "serve-desktop.py"
spec = importlib.util.spec_from_file_location("button_game_desktop_host", SERVER_FILE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class DesktopHostTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.file = Path(self.tmp.name) / "scores.json"
        self.start_server()

    def start_server(self):
        self.server = module.make_server("127.0.0.1", 0, self.file)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.server.server_port}"

    def stop_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=3)

    def tearDown(self):
        self.stop_server()
        self.tmp.cleanup()

    def request(self, route, payload=None):
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {} if body is None else {"Content-Type": "application/json"}
        req = Request(self.url + route, data=body, headers=headers, method="POST" if body else "GET")
        with urlopen(req, timeout=3) as res:
            if route in ("/", "/game.js"):
                return res.read()
            return json.loads(res.read())

    def test_scores_persist_and_keep_traps(self):
        self.assertEqual([], self.request("/api/scores")["scores"])
        self.request("/api/scores", {"name": " Babuni ", "score": 37, "reactionMs": 211,
                                      "apm": 45, "durationMs": 12000, "trapsEnabled": True})
        self.request("/api/scores", {"name": "Other", "score": 73, "trapsEnabled": False})
        scores = self.request("/api/scores")["scores"]
        self.assertEqual([73, 37], [s["score"] for s in scores])
        self.assertTrue(scores[1]["trapsEnabled"])
        self.assertEqual(211, scores[1]["reactionMs"])
        self.stop_server()
        self.start_server()
        scores2 = self.request("/api/scores")["scores"]
        self.assertEqual(scores, scores2)

    def test_presence_and_player_labels(self):
        a = self.request("/api/presence", {"id": "p1", "score": 10, "playing": True})
        self.assertEqual("Player 1", a["players"][0]["label"])
        self.request("/api/presence", {"id": "p2", "name": "Friend", "score": 20})
        a = self.request("/api/presence", {"id": "p1", "name": "Babuni", "score": 11})
        self.assertEqual([1, 2], [p["seat"] for p in a["players"]])
        self.assertEqual(["Babuni", "Friend"], [p["label"] for p in a["players"]])

    def test_public_static_only(self):
        self.assertIn(b"<html", self.request("/"))
        self.assertIn(b"function", self.request("/game.js"))
        for route in ("/.git/config", "/.local-data/desktop-scores.json", "/scripts/serve-desktop.py", "/README.md", "/assets/../scripts/serve-desktop.py"):
            with self.subTest(route=route), self.assertRaises(HTTPError) as error:
                self.request(route)
            self.assertEqual(404, error.exception.code)

    def test_bad_requests(self):
        with self.assertRaises(HTTPError) as error:
            self.request("/api/presence", {"name": "Missing ID"})
        self.assertEqual(400, error.exception.code)
        self.request("/api/scores", {"name": "", "score": -1, "trapsEnabled": "yes"})
        s = self.request("/api/scores")["scores"][0]
        self.assertEqual(0, s["score"])
        self.assertEqual("Player", s["name"])
        self.assertFalse(s["trapsEnabled"])


if __name__ == "__main__":
    unittest.main()
