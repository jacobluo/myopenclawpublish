#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DAILY_ROOT = ROOT / "daily" / "2026"
HUGO_DAILY_ROOT = ROOT / "_hugo" / "content" / "daily"


def yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def body_content(html: str) -> str:
    match = re.search(r"<body[^>]*>(?P<body>.*)</body>", html, re.I | re.S)
    if not match:
        raise ValueError("missing body")

    body = match.group("body").strip()
    body = re.sub(r"^\s*<h1\b[^>]*>.*?</h1>\s*", "", body, count=1, flags=re.I | re.S)
    return body.strip() + "\n"


def main() -> None:
    index = json.loads((ROOT / "content" / "index.json").read_text(encoding="utf-8"))
    by_url = {
        item["url"]: item
        for item in index
        if item.get("category") == "daily"
    }

    converted = 0
    for source in sorted(DAILY_ROOT.glob("*/*/index.html")):
        source_html = source.read_text(encoding="utf-8")
        if "Hugo Daily" in source_html and "daily-report" in source_html:
            raise SystemExit(
                "Daily pages already look Hugo-generated. "
                "This one-time importer must run against the pre-Hugo static daily pages."
            )

        rel = source.relative_to(ROOT)
        year, month, day = rel.parts[1], rel.parts[2], rel.parts[3]
        url = f"/daily/{year}/{month}/{day}/"
        item = by_url.get(url)
        if not item:
            raise SystemExit(f"Missing content/index.json entry for {url}")

        target_dir = HUGO_DAILY_ROOT / year / month / day
        target_dir.mkdir(parents=True, exist_ok=True)

        front_matter = "\n".join(
            [
                "---",
                f"title: {yaml_string(item['title'])}",
                f"date: {yaml_string(item['date'])}",
                "category: \"daily\"",
                f"url: {yaml_string(url)}",
                f"summary: {yaml_string(item.get('summary', ''))}",
                "---",
                "",
            ]
        )

        content = body_content(source_html)
        (target_dir / "index.html").write_text(front_matter + content, encoding="utf-8")
        converted += 1

    print(f"Converted {converted} daily pages to Hugo content.")


if __name__ == "__main__":
    main()
