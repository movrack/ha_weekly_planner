"""Read-only production dead-code candidates. Findings require human verification."""

import argparse
import fnmatch
import json
import re
import shutil
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATEGORIES = (
    "unused",
    "test-only",
    "unused-export",
    "param-or-import",
    "translation",
    "commented-code",
)


def run(command, cwd=ROOT, codes=(0, 1)):
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True, check=False)
    if result.returncode not in codes:
        raise RuntimeError(f"{' '.join(map(str, command))}: {result.stderr or result.stdout}")
    return result.stdout


def executable(name):
    local = ROOT / ".venv" / "bin" / name
    if local.exists():
        return str(local)
    found = shutil.which(name)
    if found:
        return found
    raise RuntimeError(
        f"{name} is unavailable; install the project tooling before running detection"
    )


def detect():
    findings = set()
    tests = "\n".join(
        p.read_text()
        for base, glob in [("tests", "*.py"), ("frontend/src/__tests__", "*.ts")]
        for p in (ROOT / base).rglob(glob)
    )

    def tested(name):
        return re.search(r"\b" + re.escape(name) + r"\b", tests) is not None

    whitelist = ROOT / "scripts/deadcode_whitelist.py"
    rules = whitelist.read_text()
    # Reviewed findings kept on purpose: "# keep: <file> <symbol> <category> <reason>".
    kept = set(re.findall(r"^# keep: (\S+) (\S+) (\S+) \S", rules, re.MULTILINE))

    def add(file, line, symbol, category):
        if (str(file), symbol, category) in kept:
            return
        findings.add((str(file), int(line), symbol, category))

    # TypeScript itself detects private members that export analysis cannot see.
    output = run(
        [
            str(ROOT / "frontend/node_modules/.bin/tsc"),
            "--noEmit",
            "--noUnusedLocals",
            "--noUnusedParameters",
            "--incremental",
            "false",
        ],
        ROOT / "frontend",
        (0, 1, 2),
    )
    diagnostics = re.findall(r"^(.*?)\((\d+),\d+\): error TS(\d+): (.*)$", output, re.MULTILINE)
    type_errors = []
    for file, line, code, message in diagnostics:
        if code not in ("6133", "6192", "6196", "6198"):
            # A work-in-progress type error must not stop the other detectors: report it and go on.
            type_errors.append(f"{file}:{line} {message[:90]}")
            continue
        if "__tests__" in Path(file).parts:
            continue
        quoted = re.search(r"'([^']+)'", message)
        symbol = quoted[1] if quoted else "imports"
        category = (
            ("test-only" if tested(symbol) else "unused")
            if symbol.startswith("_")
            else "param-or-import"
        )
        add("frontend/" + file, line, symbol, category)
    if type_errors:
        print(
            f"WARNING: tsc reports {len(type_errors)} type error(s), the unused findings of tsc may "
            f"be incomplete; first: {type_errors[0]}",
            file=sys.stderr,
        )

    output = run(
        [
            str(ROOT / "frontend/node_modules/.bin/knip"),
            "--production",
            "--reporter",
            "json",
            "--no-progress",
        ],
        ROOT / "frontend",
    )
    report = json.loads(output)
    # Knip's TypeScript parser skips comments and string contents, retaining actual
    # identifiers (including type references and template expressions).
    references = json.loads(
        run(
            [
                "node",
                "-e",
                r"""
const { parseSync, visitorKeys } = require("oxc-parser");
const fs = require("node:fs");
const files = JSON.parse(process.argv[1]);
const references = {};
for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const parsed = parseSync(file, source);
    if (parsed.errors.length) throw new Error(`Cannot parse ${file}`);
    const names = Object.create(null);
    function visit(node) {
        if (node.type === "Identifier") {
            const line = source.slice(0, node.start).split("\n").length;
            (names[node.name] ??= []).push(line);
        }
        for (const key of visitorKeys[node.type] ?? []) {
            const child = node[key];
            if (Array.isArray(child)) child.filter(Boolean).forEach(visit);
            else if (child) visit(child);
        }
    }
    visit(parsed.program);
    references[file] = names;
}
process.stdout.write(JSON.stringify(references));
""",
                json.dumps(
                    [
                        issue["file"]
                        for issue in report["issues"]
                        if issue.get("exports") or issue.get("types")
                    ]
                ),
            ],
            cwd=ROOT / "frontend",
            codes=(0,),
        )
    )
    for issue in report["issues"]:
        for kind in (
            "exports",
            "types",
            "files",
            "dependencies",
            "unlisted",
            "unresolved",
            "enumMembers",
            "namespaceMembers",
            "duplicates",
            "binaries",
            "optionalPeerDependencies",
        ):
            for item in issue.get(kind, []):
                symbol = item["name"]
                line = item.get("line", 1)
                category = "unused"
                if kind in ("exports", "types"):
                    internal = references[issue["file"]].get(symbol, [])
                    category = (
                        "unused-export"
                        if any(n != line for n in internal)
                        else "test-only"
                        if tested(symbol)
                        else "unused"
                    )
                add("frontend/" + issue["file"], line, symbol, category)

    ignored_variables = re.findall(r"^# ignore-name: (\S+) ", rules, re.MULTILINE)
    output = run(
        [
            executable("vulture"),
            "custom_components",
            str(whitelist),
            "--ignore-names",
            ",".join(ignored_variables),
        ],
        codes=(0, 3),
    )
    for file, line, kind, symbol in re.findall(
        r"^(.*?):(\d+): unused (\w+) '([^']+)'", output, re.MULTILINE
    ):
        if file.startswith("scripts/"):
            continue
        if any(
            file == f and int(line) == int(n) and symbol == s
            for f, n, s in re.findall(
                r"^# ignore-location: (.*?):(\d+) (\w+) ", rules, re.MULTILINE
            )
        ):
            continue
        add(
            file,
            line,
            symbol,
            "param-or-import" if kind == "import" else "test-only" if tested(symbol) else "unused",
        )

    output = run(
        [
            executable("ruff"),
            "check",
            "custom_components",
            "--select",
            "ERA001",
            "--output-format",
            "json",
            "--no-cache",
        ]
    )
    for issue in json.loads(output):
        line = issue["location"]["row"]
        text = Path(issue["filename"]).read_text().splitlines()[line - 1]
        if re.match(r"\s*# -{10,}", text):
            continue  # a section divider ("# ---- history"), not commented-out code
        add(Path(issue["filename"]).relative_to(ROOT), line, f"comment@{line}", "commented-code")

    source_files = [p for p in (ROOT / "frontend/src").rglob("*.ts") if "__tests__" not in p.parts]
    i18n = ROOT / "frontend/src/i18n.ts"
    text = i18n.read_text()
    # Exclude dictionary declarations, but retain helper calls within i18n itself.
    blocks = list(
        re.finditer(
            r"const (?:en|fr)(?:\s*:\s*typeof en)?\s*=\s*\{(.*?)^\};",
            text,
            re.DOTALL | re.MULTILINE,
        )
    )
    helpers = text
    for block in reversed(blocks):
        helpers = helpers[: block.start()] + helpers[block.end() :]
    source = "\n".join([p.read_text() for p in source_files if p != i18n] + [helpers])
    # Also retain property access: strings(lang).key and the common s.key form.
    literals = set(re.findall(r"""["'`]([A-Za-z_]\w*)["'`]""", source))
    properties = set(re.findall(r"\.\s*([A-Za-z_]\w*)", source))
    prefixes = set(re.findall(r"`([A-Za-z_]\w*)\$\{", source))
    prefixes.update(re.findall(r"""["']([A-Za-z_]\w*)["']\s*\+""", source))
    # Report one finding per key, at its first dictionary declaration.
    seen = set()
    for block in blocks:
        for match in re.finditer(r"^\s*(\w+):", block[1], re.MULTILINE):
            key = match[1]
            if key in seen:
                continue
            seen.add(key)
            if key not in literals | properties and not any(
                key.startswith(prefix) for prefix in prefixes
            ):
                line = text.count("\n", 0, block.start(1) + match.start()) + 1
                add(i18n.relative_to(ROOT), line, key, "translation")
    if not seen:
        raise RuntimeError("No translation keys parsed; i18n format may have changed")
    return sorted(findings)


def check(findings):
    reference = json.loads((ROOT / "scripts/deadcode_reference.json").read_text())
    actual = {(f, s, c) for f, _, s, c in findings}
    expected = {(i["file"], i["symbol"], i["category"]) for i in reference["expected"]}
    identities = Counter((f, s) for f, s, _ in actual)
    duplicates = {key for key, count in identities.items() if count > 1}
    for f, s in sorted(duplicates):
        print(f"MULTIPLE CATEGORIES {f} {s}")
    for category in CATEGORIES:
        target = {i for i in expected if i[2] == category}
        total = sum(c == category for _, _, c in actual)
        print(f"check {category}: {len(target & actual)}/{len(target)}; total {total}")
    missing = expected - actual
    for f, s, c in sorted(missing):
        print(f"MISSING {f} {s} {c}")
    false = []
    new = []
    for finding in findings:
        f, line, s, c = finding
        matches = [
            i
            for i in reference["false_positives"]
            if fnmatch.fnmatchcase(s, i["symbol"])
            and i.get("file", f) == f
            and i.get("line", line) == line
            and i.get("category", c) == c
        ]
        if matches:
            false.append(finding)
            print(f"FALSE POSITIVE {f}:{line} {s} {c}: {matches[0]['reason']}")
        elif (f, s, c) not in expected:
            new.append(finding)
            print(f"NEW {f}:{line} {s} {c}")
    print(f"False positives: {len(false)}; NEW unclassified: {len(new)}")
    return bool(missing or false or duplicates)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare against issue #64 reference")
    args = parser.parse_args()
    started = time.monotonic()
    try:
        findings = detect()
    except (RuntimeError, OSError, ValueError, KeyError) as error:
        print(f"Detection failed: {error}", file=sys.stderr)
        return 2
    for file, line, symbol, category in findings:
        print(f"{file}:{line} {symbol} {category}")
    counts = Counter(item[3] for item in findings)
    for category in CATEGORIES:
        print(f"{category}: {counts[category]}")
    failed = check(findings) if args.check else False
    print(f"Runtime: {time.monotonic() - started:.2f}s")
    return int(failed)


if __name__ == "__main__":
    sys.exit(main())
