#!/usr/bin/env bash
# Manual fallback of the Release workflow: create the git tag and the GitHub release for the version now
# on `main`, with `weekly_planner.zip` (built from a clean export of origin/main) attached.
# Dry run by default (builds and checks the zip, prints the notes); pass --apply to tag and publish.
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
case "$V" in *-*) echo "Pre-release $V: publish it with the Release workflow (Run workflow), not from main" >&2; exit 1;; esac

TAG="v$V"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && { echo "Tag $TAG already exists" >&2; exit 1; }

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
git archive "$SHA" | tar -x -C "$WORK"
"$WORK/scripts/release_notes.sh" "$V" "$WORK/CHANGELOG.md" > "$WORK/notes.md"
(cd "$WORK/frontend" && npm ci --no-audit --no-fund && npm run build)
python3 "$WORK/scripts/release_zip.py" "$V" "$WORK/weekly_planner.zip"

echo "Release $TAG on origin/main ${SHA:0:7}"; echo "--- notes"; cat "$WORK/notes.md"
if [ "$APPLY" -ne 1 ]; then echo "--- dry run (use --apply)"; exit 0; fi

gh release create "$TAG" "$WORK/weekly_planner.zip" --target "$SHA" --title "$TAG" --notes-file "$WORK/notes.md" --latest
echo "Done: $TAG"
