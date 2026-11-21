#!/usr/bin/env python3
"""Pack and check `weekly_planner.zip`, the file HACS installs (`zip_release` in `hacs.json`).

HACS extracts the archive into `custom_components/weekly_planner/`, so the files of that folder sit at the
root of the archive. The card bundle must be built first (`cd frontend && npm ci && npm run build`).

Usage: python3 scripts/release_zip.py VERSION [OUTPUT]      pack, then check the written file
       python3 scripts/release_zip.py --check VERSION FILE  check an existing file only
"""

from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "custom_components" / "weekly_planner"
CARD = "frontend/weekly-planner-card.js"
DEFAULT_OUTPUT = "weekly_planner.zip"


def _skipped(path: Path) -> bool:
    return "__pycache__" in path.parts or path.suffix in {".pyc", ".pyo"} or path.name == ".DS_Store"


def pack(output: Path) -> None:
    """Write the files of the integration folder at the root of the archive (sorted, no directories)."""
    files = sorted(p for p in SOURCE.rglob("*") if p.is_file() and not _skipped(p.relative_to(SOURCE)))
    output.unlink(missing_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, path.relative_to(SOURCE).as_posix())


def problems(file: Path, version: str) -> list[str]:
    """What makes the archive unfit for HACS (empty list when it is fit)."""
    with zipfile.ZipFile(file) as archive:
        if (bad := archive.testzip()) is not None:
            return [f"corrupt entry: {bad}"]
        infos = {info.filename: info for info in archive.infolist()}
        found: list[str] = []
        if "manifest.json" not in infos:
            found.append("manifest.json is not at the root of the archive")
        elif (manifest := json.loads(archive.read("manifest.json")))["version"] != version:
            found.append(f"manifest.json version {manifest['version']} is not {version}")
        if CARD not in infos:
            found.append(f"{CARD} is missing (card not built)")
        elif infos[CARD].file_size == 0:
            found.append(f"{CARD} is empty")
        found += [f"unexpected entry: {name}" for name in infos
                  if name.startswith(("custom_components/", "/")) or ".." in name.split("/")
                  or _skipped(Path(name))]
        return found


def main(argv: list[str]) -> int:
    if argv[:1] == ["--check"] and len(argv) == 3:
        version, file = argv[1], Path(argv[2])
    elif 1 <= len(argv) <= 2 and not argv[0].startswith("-"):
        version, file = argv[0], Path(argv[1] if len(argv) == 2 else DEFAULT_OUTPUT)
        pack(file)
    else:
        print(__doc__, file=sys.stderr)
        return 2
    if found := problems(file, version):
        print(f"{file} is not fit for HACS:", *found, sep="\n- ", file=sys.stderr)
        return 1
    with zipfile.ZipFile(file) as archive:
        print(f"{file}: {len(archive.namelist())} files, {CARD} {archive.getinfo(CARD).file_size} bytes, ok")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
