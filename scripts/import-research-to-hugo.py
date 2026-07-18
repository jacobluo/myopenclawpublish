#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_ROOT = ROOT / "research"
HUGO_RESEARCH_ROOT = ROOT / "_hugo" / "content" / "research"


def yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def html_title(html: str, fallback: str) -> str:
    match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    if not match:
        return fallback
    return re.sub(r"\s+", " ", match.group(1)).strip()


def html_description(html: str) -> str:
    match = re.search(
        r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']',
        html,
        re.I | re.S,
    )
    if not match:
        return ""
    return re.sub(r"\s+", " ", match.group(1)).strip()


def date_from_url(url: str) -> str:
    match = re.search(r"/research/(\d{4})/(\d{2})/(\d{2})/", url)
    if not match:
        return "2026-06-20"
    return "-".join(match.groups())


def main() -> None:
    index = json.loads((ROOT / "content" / "index.json").read_text(encoding="utf-8"))
    by_url = {
        item["url"]: item
        for item in index
        if item.get("category") == "research"
    }

    converted = 0
    for source in sorted(RESEARCH_ROOT.rglob("index.html")):
        if source == RESEARCH_ROOT / "index.html":
            continue

        rel_parent = source.parent.relative_to(ROOT)
        url = "/" + rel_parent.as_posix() + "/"
        html = source.read_text(encoding="utf-8")
        item = by_url.get(url, {})

        title = item.get("title") or html_title(html, rel_parent.name)
        summary = item.get("summary") or html_description(html)
        date = item.get("date") or date_from_url(url)

        target = HUGO_RESEARCH_ROOT / source.parent.relative_to(RESEARCH_ROOT) / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)

        front_matter = "\n".join(
            [
                "---",
                f"title: {yaml_string(title)}",
                f"date: {yaml_string(date)}",
                "category: \"research\"",
                f"url: {yaml_string(url)}",
                f"summary: {yaml_string(summary)}",
                "layout: \"raw\"",
                "---",
                "",
            ]
        )
        target.write_text(front_matter + html, encoding="utf-8")
        converted += 1

    print(f"Converted {converted} research pages to Hugo raw content.")


if __name__ == "__main__":
    main()
