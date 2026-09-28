"""Serve site/ locally with the same security headers as production.

Keep HEADERS in sync with aws_cloudfront_response_headers_policy.security in atrevely/ajtrev-infra (main.tf).
Usage: python scripts/serve_with_headers.py site 8001
"""
import functools
import http.server
import sys

CSP = (
    "default-src 'none'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src https://fonts.gstatic.com; "
    "img-src 'self'; "
    "base-uri 'none'; "
    "form-action 'none'; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "upgrade-insecure-requests"
)
HEADERS = {
    "Content-Security-Policy": CSP,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        for k, v in HEADERS.items():
            self.send_header(k, v)
        super().end_headers()


if __name__ == "__main__":
    root, port = sys.argv[1], int(sys.argv[2])
    http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=root)).serve_forever()
