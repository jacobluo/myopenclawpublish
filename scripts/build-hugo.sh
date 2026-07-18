#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "$repo_root/_hugo/data"
cp "$repo_root/content/index.json" "$repo_root/_hugo/data/content.json"

hugo --source "$repo_root/_hugo" --destination "$repo_root"
