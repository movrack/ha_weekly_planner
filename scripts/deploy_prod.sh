#!/usr/bin/env bash
# Copy the integration to a Home Assistant host over SSH (used while the repository is private).
#
#   scripts/deploy_prod.sh            # dry run: show what would change
#   scripts/deploy_prod.sh --apply    # copy the files
#
# Environment: WP_HOST (SSH alias, default ha-ccode), WP_CONFIG (default /config).
# Nothing is restarted: a first install or a Python change needs a Home Assistant restart,
# a card-only change only needs `weekly_planner.reload` and a browser refresh.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${WP_HOST:-ha-ccode}"
DEST="${WP_CONFIG:-/config}/custom_components/weekly_planner/"
SRC="custom_components/weekly_planner/"
MODE="${1:---dry-run}"

[ -f "$SRC/frontend/weekly-planner-card.js" ] || { echo "Build the card first: (cd frontend && npm run build)"; exit 1; }
if [ -n "$(git status --porcelain -- custom_components)" ]; then
  echo "Uncommitted changes in custom_components: commit them first."; exit 1
fi

if [ "$MODE" = "--apply" ]; then
  echo "Running tests before deploying…"
  uv run --group test pytest -q >/dev/null 2>&1 || { echo "Python tests fail: not deploying."; exit 1; }
  (cd frontend && npm test --silent >/dev/null 2>&1) || { echo "Card tests fail: not deploying."; exit 1; }
fi

RSYNC=(rsync -rlt --checksum --delete --exclude __pycache__ -e "ssh -o BatchMode=yes -o ConnectTimeout=10")
if [ "$MODE" = "--apply" ]; then
  ssh -o BatchMode=yes "$HOST" "mkdir -p '$DEST'"
  "${RSYNC[@]}" -i "$SRC" "$HOST:$DEST"
  echo "Copied $(git rev-parse --short HEAD) to $HOST:$DEST"
else
  "${RSYNC[@]}" -n -i "$SRC" "$HOST:$DEST" || true
  echo "Dry run. Re-run with --apply to copy."
fi
