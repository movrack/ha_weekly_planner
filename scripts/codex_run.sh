#!/usr/bin/env bash
# Run Codex (OpenAI CLI) non-interactively and stream everything into a log file you can follow live:
#
#   tail -f /tmp/codex-latest.log        # always the most recent run
#   cat /tmp/codex-<name>-<date>.log     # a specific run
#
# Usage: scripts/codex_run.sh <name> "<prompt>" [sandbox_mode]
#   sandbox_mode: workspace-write (default) | read-only
# Notes: standard input is closed (otherwise a background Codex waits for it forever); nothing here saves to Git,
# pushes or deploys; the prompt itself must say so.
set -uo pipefail
name="${1:?usage: codex_run.sh <name> \"<prompt>\" [sandbox_mode]}"
prompt="${2:?missing prompt}"
mode="${3:-workspace-write}"
cd "$(dirname "$0")/.."
log="/tmp/codex-${name}-$(date +%Y%m%d-%H%M%S).log"
ln -sf "$log" /tmp/codex-latest.log
{
  echo "# codex run '$name' started $(date '+%H:%M:%S') mode=$mode cwd=$(pwd)"
  echo "# follow with: tail -f /tmp/codex-latest.log"
  echo
} > "$log"
codex exec -c "sandbox_mode=\"$mode\"" -c 'approval_policy="never"' "$prompt" < /dev/null >> "$log" 2>&1
rc=$?
{ echo; echo "# finished $(date '+%H:%M:%S') exit=$rc"; } >> "$log"
exit "$rc"
