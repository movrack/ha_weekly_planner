#!/usr/bin/env bash
# Copy the integration to a Home Assistant host over SSH (for testing on your own instance).
#
#   scripts/deploy_prod.sh            # dry run: show what would change
#   scripts/deploy_prod.sh --apply    # copy the files
#
# Environment: WP_HOST (SSH host or alias, required), WP_CONFIG (default /config).
# Nothing is restarted: a first install or a Python change needs a Home Assistant restart,
# a card-only change only needs `weekly_planner.reload` (the card updates itself).
# Deployments use the tested working tree; a commit is not a prerequisite.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${WP_HOST:?Set WP_HOST to the SSH host or alias of your Home Assistant}"
DEST="${WP_CONFIG:-/config}/custom_components/weekly_planner/"
SRC="custom_components/weekly_planner/"
MODE="${1:---dry-run}"

[ -f "$SRC/frontend/weekly-planner-card.js" ] || { echo "Build the card first: (cd frontend && npm run build)"; exit 1; }

if [ "$MODE" = "--apply" ]; then
  echo "Running tests before deploying…"
  uv run --group test pytest -q >/dev/null 2>&1 || { echo "Python tests fail: not deploying."; exit 1; }
  (cd frontend && npm run typecheck --silent && npm test --silent && npm run build --silent) >/dev/null 2>&1 || { echo "Card checks fail: not deploying."; exit 1; }
fi

REVISION="$(git rev-parse --short HEAD)"
if [ -n "$(git status --porcelain -- custom_components frontend)" ]; then
  REVISION="$REVISION + uncommitted working-tree changes"
fi
CARD_SHA="$(shasum -a 256 "$SRC/frontend/weekly-planner-card.js")"
CARD_SHA="${CARD_SHA%% *}"

RSYNC=(rsync -rlt --checksum --delete --exclude __pycache__ -e "ssh -o BatchMode=yes -o ConnectTimeout=10")
if [ "$MODE" = "--apply" ]; then
  ssh -o BatchMode=yes "$HOST" "mkdir -p '$DEST'"
  "${RSYNC[@]}" -i "$SRC" "$HOST:$DEST"
  echo "Copied working tree ($REVISION) to $HOST:$DEST"
  echo "Card SHA-256: $CARD_SHA"
else
  "${RSYNC[@]}" -n -i "$SRC" "$HOST:$DEST" || true
  echo "Dry run. Re-run with --apply to copy."
fi
