#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require hugo
require python3

if command -v jq >/dev/null 2>&1; then
  jq empty content/index.json
else
  python3 -m json.tool content/index.json >/dev/null
fi

./scripts/build-hugo.sh

python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

root = Path(".").resolve()

required = [
    "index.html",
    "daily/index.html",
    "research/index.html",
    "deliverables/index.html",
    "content/index.json",
    "CNAME",
    ".nojekyll",
]

missing_required = [path for path in required if not (root / path).is_file()]
if missing_required:
    print("Missing required files:")
    for path in missing_required:
        print(f"  - {path}")
    raise SystemExit(1)


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("href", "src") and value:
                self.refs.append(value)


missing_refs = []
checked_refs = 0
html_files = [
    path for path in root.rglob("*.html")
    if ".git" not in path.parts and "_hugo" not in path.parts
]

for html_file in html_files:
    parser = RefParser()
    parser.feed(html_file.read_text(encoding="utf-8"))

    for ref in parser.refs:
        if ref.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:", "javascript:")):
            continue

        path = urlparse(ref).path
        if not path:
            continue

        if path.startswith("/"):
            target = root / unquote(path.lstrip("/"))
        else:
            target = (html_file.parent / unquote(path)).resolve()

        checked_refs += 1
        exists = target.is_file() or (target.is_dir() and (target / "index.html").is_file())
        if not exists:
            try:
                display_target = target.relative_to(root)
            except ValueError:
                display_target = target
            missing_refs.append((html_file.relative_to(root), ref, display_target))

if missing_refs:
    print(f"Missing local refs: {len(missing_refs)}")
    for source, ref, target in missing_refs[:100]:
        print(f"  - {source}: {ref} -> {target}")
    raise SystemExit(1)

print(f"OK: {len(html_files)} HTML files, {checked_refs} local refs checked.")
PY

git diff --check

echo "OK: site check passed."
