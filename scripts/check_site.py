"""Pre-deploy checks for site/: forbidden files, broken local references, and unfilled data-todo placeholders.

Usage: python scripts/check_site.py [site_dir]
Exits non-zero on any problem.
"""
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

FORBIDDEN = re.compile(
    r"(\.tf|\.tfvars|\.tfstate(\..*)?|\.terraform.*|\.env.*|\.pem|\.key)$", re.IGNORECASE
)
REF = re.compile(r"""(?:src|href)\s*=\s*["']([^"']+)["']""", re.IGNORECASE)


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "site")
    errors = []

    if not (root / "index.html").is_file():
        errors.append(f"{root}/index.html is missing")

    for path in root.rglob("*"):
        if path.is_file() and FORBIDDEN.search(path.name):
            errors.append(f"forbidden file in deploy folder: {path}")

    for page in root.rglob("*.html"):
        text = page.read_text(encoding="utf-8")
        if "data-todo" in text:
            errors.append(f"{page}: unfinished placeholder (data-todo) must be filled in before deploying")
        for ref in REF.findall(text):
            parsed = urlparse(ref)
            if parsed.scheme or ref.startswith(("#", "//", "mailto:", "tel:", "javascript:")):
                continue
            rel = unquote(parsed.path)
            if not rel:
                continue
            target = (root / rel.lstrip("/")) if rel.startswith("/") else (page.parent / rel)
            if target.is_dir():
                target = target / "index.html"
            if not target.is_file():
                errors.append(f"{page}: broken reference '{ref}'")

    for e in errors:
        print(f"ERROR: {e}")
    if not errors:
        print(f"OK: {sum(1 for p in root.rglob('*') if p.is_file())} files in {root}, all local references resolve")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
