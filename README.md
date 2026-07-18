# OpenClaw Publish

Public publishing site for Daily, Research, and Deliverables.

The repository is served from the `gh-pages` branch at:

https://pages.cobuddy.cc/

## Hugo Workflow

Hugo source lives in `_hugo/`. The repository root remains the GitHub Pages publishing root so existing public URLs keep working.

Build the generated index pages with:

```bash
./scripts/build-hugo.sh
```

Run the full local publish check with:

```bash
./scripts/check-site.sh
```

`content/index.json` is the source of truth for homepage and section listings. The build script copies it into `_hugo/data/content.json` before running Hugo.

Historical HTML pages and uploaded assets remain in their existing paths under `daily/`, `research/`, and `deliverables/`.
