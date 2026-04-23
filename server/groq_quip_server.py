#!/usr/bin/env python3
"""
Lightweight local Groq quip server.

Run:
  export GROQ_API_KEY=your_key
  python3 server/groq_quip_server.py

Endpoint:
  POST http://127.0.0.1:8787/api/bot-quips
  body: {"context":"hero"|"site"}
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from collections import deque
import json
import os
import re

HOST = "127.0.0.1"
PORT = 8787
MODEL = "llama-3.1-8b-instant"
RECENT_MAX = 18

recent_quips = deque(maxlen=RECENT_MAX)


FALLBACK = [
    "Relax, I only roast interfaces that deserve it.",
    "My sarcasm subroutine is now warming up.",
    "If this gets any cleaner, we owe the pixels a tip.",
    "I run security and mood lighting. You are welcome.",
    "This studio does not do average. I checked.",
    "Your cursor has confidence. Suspicious, but promising.",
]


def sanitize(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > 160:
        text = text[:157].rstrip() + "..."
    return text


def unique_fallback() -> str:
    for line in FALLBACK:
        if line not in recent_quips:
            recent_quips.append(line)
            return line
    line = FALLBACK[0]
    recent_quips.append(line)
    return line


def generate_quip(context: str) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return unique_fallback()

    system_prompt = (
        "You are a witty, sarcastic but friendly studio sentinel bot. "
        "Write one short line (8-20 words), cinematic tone, playful sarcasm, no profanity. "
        "Do not repeat prior exact wording."
    )

    user_prompt = (
        f"Context: {context}. "
        f"Recent lines to avoid: {list(recent_quips)}. "
        "Return ONLY the sentence."
    )

    payload = {
        "model": MODEL,
        "temperature": 1.0,
        "max_tokens": 60,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    req = Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urlopen(req, timeout=18) as res:
            data = json.loads(res.read().decode("utf-8"))
            text = data["choices"][0]["message"]["content"]
            line = sanitize(text)
            if not line or line in recent_quips:
                return unique_fallback()
            recent_quips.append(line)
            return line
    except (HTTPError, URLError, KeyError, ValueError, TimeoutError):
        return unique_fallback()


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(200, {"ok": True})

    def do_POST(self):
        if self.path != "/api/bot-quips":
            self._send(404, {"error": "Not found"})
            return

        content_len = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_len) if content_len > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}

        context = str(payload.get("context", "site"))
        text = generate_quip(context)
        self._send(200, {"text": text})


def main():
    print(f"Quip server running on http://{HOST}:{PORT}")
    server = HTTPServer((HOST, PORT), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
