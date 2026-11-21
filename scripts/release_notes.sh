#!/usr/bin/env bash
# Print the release notes of VERSION from a CHANGELOG (Keep a Changelog), default CHANGELOG.md.
# A final version needs its own section. A pre-release (version with "-", e.g. 0.30.0-beta.1) uses its own
# section when it exists, otherwise the [Unreleased] section, introduced by a line that says so.
# Usage: scripts/release_notes.sh VERSION [CHANGELOG]   (exit 1 when a final version has no section)
set -euo pipefail
V=${1:?usage: release_notes.sh VERSION [CHANGELOG]}
LOG=${2:-CHANGELOG.md}
[ -f "$LOG" ] || { echo "$LOG not found" >&2; exit 1; }

section() {  # lines under the exact heading "## [NAME]", up to the next "## [" heading
  awk -v name="$1" 'index($0, "## [" name "]") == 1 {f=1; next} /^## \[/ {f=0} f' "$LOG"
}
has_text() { [ -n "$(section "$1" | tr -d '[:space:]')" ]; }  # tr reads all: no SIGPIPE

if has_text "$V"; then
  section "$V"
  exit 0
fi
case "$V" in
  *-*)
    echo "Pre-release for testing. It contains the changes not released yet:"
    if has_text "Unreleased"; then
      section "Unreleased"
    else
      echo
      echo "See CHANGELOG.md."
    fi
    ;;
  *)
    echo "No CHANGELOG section for $V" >&2
    exit 1
    ;;
esac
