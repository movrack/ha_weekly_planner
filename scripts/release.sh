#!/usr/bin/env bash
# Create the git tag and the GitHub release for the version now on `main`.
# Dry run by default; pass --apply to tag and publish.
# Usage: scripts/release.sh [--apply]
set -euo pipefail
cd "$(dirname "$0")/.."

APPLY=0
[ "${1:-}" = "--apply" ] && APPLY=1

git fetch -q origin --tags
SHA=$(git rev-parse origin/main)
show() { git show "${SHA}:$1"; }

V=$(show custom_components/weekly_planner/manifest.json | python3 -c 'import json,sys;print(json.load(sys.stdin)["version"])')
PY=$(show pyproject.toml | sed -n 's/^version = "\(.*\)"/\1/p' | head -1)
NODE=$(show frontend/package.json | python3 -c 'import json,sys;print(json.load(sys.stdin)["version"])')
[ "$V" = "$PY" ] && [ "$V" = "$NODE" ] || { echo "Versions differ: manifest=$V pyproject=$PY package.json=$NODE" >&2; exit 1; }

TAG="v$V"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && { echo "Tag $TAG already exists" >&2; exit 1; }

NOTES=$(mktemp)
show CHANGELOG.md | awk -v v="$V" '$0 ~ "^## \\[" v "\\]" {f=1; next} /^## \[/ {f=0} f' > "$NOTES"
[ -s "$NOTES" ] || { echo "No CHANGELOG section for $V" >&2; exit 1; }

echo "Release $TAG on origin/main ${SHA:0:7}"; echo "--- notes"; cat "$NOTES"
if [ "$APPLY" -ne 1 ]; then echo "--- dry run (use --apply)"; exit 0; fi

gh release create "$TAG" --target "$SHA" --title "$TAG" --notes-file "$NOTES" --latest
echo "Done: $TAG"
