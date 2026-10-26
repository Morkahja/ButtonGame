#!/usr/bin/env python3
"""Backup/restore Button Game's Android-host leaderboard over local Wi-Fi.

Run while Serve on Wi-Fi is active on the phone. Uses the existing scores API;
does not touch the Android app's private storage or change game code.
"""
import argparse
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

FIELDS = ("name", "score", "reactionMs", "apm", "durationMs", "trapsEnabled")


def request_json(url, data=None):
    payload = None if data is None else json.dumps(data).encode("utf-8")
    headers = {"Content-Type": "application/json"} if payload is not None else {}
    req = Request(url, data=payload, headers=headers, method="POST" if payload else "GET")
    with urlopen(req, timeout=12) as response:
        result = json.load(response)
    if not isinstance(result, dict) or not isinstance(result.get("scores"), list):
        raise ValueError("Unexpected response from the Button Game host")
    return result["scores"]


def main():
    parser = argparse.ArgumentParser(description="Backup/restore scores before reinstalling Button Game")
    parser.add_argument("action", choices=("backup", "restore"))
    parser.add_argument("host_url", help="Serve on Wi-Fi URL, e.g. http://192.168.1.30:8766/")
    parser.add_argument("file", type=Path, help="Local .json file to save or restore")
    args = parser.parse_args()
    host = args.host_url.rstrip("/")
    if not host.startswith(("http://", "https://")):
        parser.error("host_url must start with http:// or https://")
    endpoint = host + "/api/scores"
    if args.action == "backup":
        scores = request_json(endpoint)
        # Exclusive creation prevents accidentally destroying an earlier backup.
        with args.file.open("x", encoding="utf-8") as f:
            json.dump({"scores": scores}, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"Backed up {len(scores)} host high scores to {args.file}")
    else:
        with args.file.open(encoding="utf-8") as f:
            saved = json.load(f)
        if not isinstance(saved, dict) or not isinstance(saved.get("scores"), list):
            raise ValueError("Not a Button Game scores backup")
        existing = request_json(endpoint)
        if existing:
            raise ValueError("Host already has scores. Restore only to an empty host to avoid duplicates.")
        for number, score in enumerate(saved["scores"], 1):
            if not isinstance(score, dict) or "name" not in score or "score" not in score:
                raise ValueError(f"Invalid high score entry #{number}")
            entry = {key: score[key] for key in FIELDS if key in score}
            request_json(endpoint, entry)
        print(f"Restored {len(saved['scores'])} high scores to the Android host")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, HTTPError, URLError, json.JSONDecodeError) as exc:
        sys.exit(f"Score transfer failed: {exc}")
