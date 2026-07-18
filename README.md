# OpenClaw Publish

Public publishing site for Daily, Research, and Deliverables.

The repository is served from the `gh-pages` branch at:

https://pages.cobuddy.cc/

## Hugo Workflow

Hugo source lives in `_hugo/`. The repository root remains the GitHub Pages publishing root so existing public URLs keep working.

`content/index.json` is the source of truth for homepage and section listings. The build script copies it into `_hugo/data/content.json` before running Hugo.

Historical HTML pages and uploaded assets remain in their existing paths under `daily/`, `research/`, and `deliverables/`.

Build the generated index pages with:

```bash
./scripts/build-hugo.sh
```

Run the full local publish check with:

```bash
./scripts/check-site.sh
```

## Publishing Workflow

1. Add the page and any assets to the matching section:
   - Daily: `daily/YYYY/MM/DD/`
   - Research: `research/YYYY/MM/DD/slug/`
   - Deliverables: `deliverables/project-name/`
2. Add or update the matching entry in `content/index.json`.
3. Run `./scripts/check-site.sh`.
4. Fix any JSON, Hugo, link, attachment, or whitespace errors reported by the check.
5. Commit and push to `gh-pages`.
6. Verify the final public URL on `https://pages.cobuddy.cc/`.

Do not skip `./scripts/check-site.sh`; it is the local publish gate for this site.
