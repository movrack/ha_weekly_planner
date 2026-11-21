#!/usr/bin/env bash
# Start the local development Home Assistant (no Docker): http://localhost:8124
# The card bundle is not in the repository: it is built first (npm ci on the first run).
set -euo pipefail
cd "$(dirname "$0")/.."
(cd frontend && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npm run build)
exec dev/.venv-ha/bin/hass -c dev/config "$@"
