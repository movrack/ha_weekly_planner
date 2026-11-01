#!/usr/bin/env python3
"""Print the medians of the performance scenarios (not run in CI).

Usage: ``uv run --group test python scripts/bench.py``. It runs ``tests/test_performance.py`` and
shows its ``[perf]`` / ``[ops]`` lines: best and median time per scenario against its budget.
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
cmd = [sys.executable, "-m", "pytest", "tests/test_performance.py", "-s", "-q", "-p", "no:cacheprovider"]
out = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False)
for line in out.stdout.splitlines():
    if match := re.search(r"\[(?:perf|ops)\].*", line):
        print(match.group(0))
print(out.stdout.strip().splitlines()[-1] if out.stdout.strip() else out.stderr[-500:])
sys.exit(out.returncode)
