"""Small HTTP adapter for running the existing cloud handler on a VM.

The application logic deliberately stays in ``index.py`` so the Cloud Function
and the VM fallback use the same routes, authentication and YDB schema.
"""

import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from index import handler


class ApiHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _handle(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b""
        event = {
            "requestContext": {
                "http": {
                    "method": self.command,
                    "path": self.path.split("?", 1)[0],
                }
            },
            "headers": dict(self.headers.items()),
            "body": raw_body.decode("utf-8"),
            "isBase64Encoded": False,
        }
        response = handler(event, None)
        body = str(response.get("body", "")).encode("utf-8")
        self.send_response(int(response.get("statusCode", 500)))
        for name, value in (response.get("headers") or {}).items():
            self.send_header(str(name), str(value))
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    do_GET = _handle
    do_POST = _handle
    do_OPTIONS = _handle

    def log_message(self, format_, *args):
        print(f"{self.client_address[0]} {format_ % args}", flush=True)


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8080"))
    ThreadingHTTPServer((host, port), ApiHandler).serve_forever()
