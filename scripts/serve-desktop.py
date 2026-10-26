#!/usr/bin/env python3
"""Button Game LAN desktop host: static game, shared scores and live players.

Uses only the Python standard library. Run from any working directory:
    python3 scripts/serve-desktop.py
Data is kept in a private, git-ignored .local-data directory in the project.
"""

import argparse
import json
import math
import os
import tempfile
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
MAX_SCORES = 50
MAX_NAME = 16
PRESENCE_TTL = 5.0
MAX_BODY = 16384


def number(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        return 0
    return max(0, int(value))


class GameData:
    def __init__(self, file):
        self.file = Path(file)
        self.lock = threading.RLock()
        self.players = {}
        self.next_seat = 1
        self.scores = []
        if self.file.is_file():
            raw = json.loads(self.file.read_text(encoding="utf-8"))
            if not isinstance(raw, list):
                raise ValueError("Saved desktop leaderboard must be a JSON array")
            self.scores = [self._score(e) for e in raw if isinstance(e, dict)]
            self.scores.sort(key=lambda e: -e["score"])
            self.scores = self.scores[:MAX_SCORES]

    @staticmethod
    def _score(obj):
        return {
            "name": str(obj.get("name") or "Player").strip()[:MAX_NAME] or "Player",
            "score": number(obj.get("score", 0)),
            "reactionMs": number(obj.get("reactionMs", 0)),
            "apm": number(obj.get("apm", 0)),
            "durationMs": number(obj.get("durationMs", 0)),
            "trapsEnabled": obj.get("trapsEnabled") is True,
        }

    def list_scores(self):
        with self.lock:
            return {"scores": [dict(x) for x in self.scores]}

    def add_score(self, obj):
        with self.lock:
            self.scores.append(self._score(obj))
            self.scores.sort(key=lambda e: -e["score"])
            self.scores = self.scores[:MAX_SCORES]
            self.file.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            fd, tmp = tempfile.mkstemp(prefix=".scores-", dir=self.file.parent)
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    json.dump(self.scores, f, ensure_ascii=False, indent=2)
                    f.write("\n")
                os.replace(tmp, self.file)
            finally:
                if os.path.exists(tmp):
                    os.unlink(tmp)
            return self.list_scores()

    def list_players(self):
        with self.lock:
            now = time.monotonic()
            self.players = {k: v for k, v in self.players.items() if now - v["lastSeen"] <= PRESENCE_TTL}
            return {"players": [{k: v for k, v in p.items() if k != "lastSeen"}
                                for p in sorted(self.players.values(), key=lambda x: x["seat"])]}

    def update_player(self, obj):
        key = str(obj.get("id") or "").strip()[:128]
        if not key:
            raise ValueError("missing id")
        with self.lock:
            self.list_players()
            seat = self.players[key]["seat"] if key in self.players else self.next_seat
            if key not in self.players:
                self.next_seat += 1
            name = str(obj.get("name") or "").strip()[:MAX_NAME]
            self.players[key] = {
                "id": key, "name": name, "seat": seat,
                "label": name or f"Player {seat}",
                "score": number(obj.get("score", 0)),
                "timeLeft": number(obj.get("timeLeft", 0)),
                "reactionMs": number(obj.get("reactionMs", 0)),
                "apm": number(obj.get("apm", 0)),
                "playing": obj.get("playing") is True,
                "lastSeen": time.monotonic(),
            }
            return self.list_players()


class GameHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, game_data, **kwargs):
        self.game_data = game_data
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def json_response(self, result, status=200):
        payload = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        route = unquote(urlsplit(self.path).path)
        if route == "/api/scores":
            return self.json_response(self.game_data.list_scores())
        if route == "/api/presence":
            return self.json_response(self.game_data.list_players())
        # Only serve the public web game, never local score files, Git metadata,
        # or private developer material in the repository.
        parts = Path(route).parts
        safe_asset = (route.startswith("/assets/") and ".." not in parts
                      and (ROOT / route.lstrip("/")).resolve().is_relative_to((ROOT / "assets").resolve()))
        if route not in ("/", "/index.html", "/game.js") and not safe_asset:
            return self.json_response({"error": "not found"}, 404)
        return super().do_GET()

    def do_POST(self):
        route = urlsplit(self.path).path
        if route not in ("/api/scores", "/api/presence"):
            return self.json_response({"error": "not found"}, 404)
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if size < 1 or size > MAX_BODY:
                return self.json_response({"error": "invalid request size"}, 400)
            obj = json.loads(self.rfile.read(size))
            if not isinstance(obj, dict):
                raise ValueError("expected a JSON object")
            result = (self.game_data.add_score(obj) if route == "/api/scores"
                      else self.game_data.update_player(obj))
            return self.json_response(result)
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            return self.json_response({"error": str(exc)}, 400)


def make_server(bind, port, data_file):
    from functools import partial
    return ThreadingHTTPServer((bind, port), partial(GameHandler, game_data=GameData(data_file)))


def main():
    parser = argparse.ArgumentParser(description="Host Button Game on a desktop or home Wi-Fi")
    parser.add_argument("--bind", default="0.0.0.0", help="Listening address; 127.0.0.1 for this computer only")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--data", type=Path, default=ROOT / ".local-data" / "desktop-scores.json")
    args = parser.parse_args()
    server = make_server(args.bind, args.port, args.data)
    print(f"Button Game desktop host ready: http://localhost:{server.server_port}/", flush=True)
    if args.bind == "0.0.0.0":
        print(f"Other devices on your Wi-Fi: http://YOUR_COMPUTER_LAN_IP:{server.server_port}/", flush=True)
        print("Find your local IP with: hostname -I", flush=True)
    print(f"Scores saved locally: {args.data}", flush=True)
    print("Keep this terminal running. Press Ctrl+C to stop. Trusted LAN only; no authentication.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
