#!/usr/bin/env bash
# Start the local development Home Assistant (no Docker): http://localhost:8124
set -euo pipefail
cd "$(dirname "$0")/.."
exec dev/.venv-ha/bin/hass -c dev/config "$@"
