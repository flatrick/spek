#!/usr/bin/env python3
"""Check the Specs page's folder totals in a real VS Code window and leave the evidence on disk.

Runs the steps of SKILL.md unattended against test-fixtures/nested-specs: build, launch an isolated
Extension Development Host, open the spek panel, read every Specs row (unfiltered and filtered by
"streaming"), compare each against the labels below, screenshot both states, close the window.

    python3 check-spec-folder-totals.py [--out DIR] [--skip-build] [--port 9333]

Writes build.log, code.log, specs.png, specs-filtered.png, rows.json and report.json into DIR
(a new temp dir by default) and exits non-zero when any row differs. Needs a display and `code`.
"""

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

SKILL = Path(__file__).resolve().parent
REPO = SKILL.parents[2]
CDP = SKILL / "cdp.mjs"

# Authored from test-fixtures/nested-specs/expected.json and spec-browsing's labelling rule, not captured
# from a run: a folder shows "<own> · <distinct total>", a leaf only its own non-zero count.
UNFILTERED = [
    ("auth", None),
    ("contracts", "— · 2 total"),
    ("contracts/pagination", "1 change · 2 total"),
    ("contracts/pagination/streaming-search", "1 change"),
    ("contracts/streaming-search", None),
    ("guides", "— · 2 total"),  # rework-guides touches both children and counts once
    ("guides/pagination", "2 changes"),
    ("guides/streaming-search", "1 change"),
]
FILTER = "streaming"
# The filter hides guides/pagination; its folder still totals 2, not the 1 the visible child would give.
FILTERED = [
    ("contracts", "— · 2 total"),
    ("contracts/pagination", "1 change · 2 total"),
    ("contracts/pagination/streaming-search", "1 change"),
    ("contracts/streaming-search", None),
    ("guides", "— · 2 total"),
    ("guides/streaming-search", "1 change"),
]

READ_ROWS = (
    '[...d.querySelectorAll("li > div:first-child")].map(r => ({'
    ' path: r.querySelector("[title]")?.getAttribute("title") ?? null,'
    ' count: r.querySelector("span.text-xs")?.textContent ?? null }))'
)
GO_TO_SPECS = (
    '(a => a ? (a.click(), "ok") : undefined)'
    '([...d.querySelectorAll("a")].find(a => a.getAttribute("href") === "/specs"))'
)
TYPE_FILTER = (
    '(i => { if (!i) return undefined;'
    ' Object.getOwnPropertyDescriptor(d.defaultView.HTMLInputElement.prototype, "value").set.call(i, %s);'
    ' i.dispatchEvent(new d.defaultView.Event("input", { bubbles: true })); return "ok"; })'
    '(d.querySelector("input[placeholder=\\"Filter specs...\\"]"))'
) % json.dumps(FILTER)


def cdp(port, step, arg=None):
    args = ["node", str(CDP), str(port), step] + ([arg] if arg is not None else [])
    return subprocess.run(args, capture_output=True, text=True)


def wait_for(what, probe, timeout=60):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result = probe()
        if result is not None:
            return result
        time.sleep(1)
    raise TimeoutError(f"timed out after {timeout}s waiting for {what}")


def app(port, expression):
    r = cdp(port, "app", expression)
    out = r.stdout.strip()
    # cdp.mjs exits 0 and prints the value even when the expression found nothing; that is not an answer yet.
    return out if r.returncode == 0 and out not in ("undefined", "null") else None


def workbench_up(port):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=1) as resp:
            return True if b"workbench" in resp.read() else None
    except OSError:
        return None


def port_answers(port):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/version", timeout=1):
            return True
    except urllib.error.HTTPError:
        return True
    except OSError:
        return False


def read_rows(port, expected_len):
    def probe():
        out = app(port, READ_ROWS)
        rows = json.loads(out) if out else []
        return rows if len(rows) == expected_len else None

    try:
        return wait_for(f"{expected_len} Specs rows", probe, timeout=20)
    except TimeoutError:
        out = app(port, READ_ROWS)
        return json.loads(out) if out else []


def compare(name, expected, actual):
    want = [{"path": p, "count": c} for p, c in expected]
    return {"check": name, "ok": want == actual, "expected": want, "actual": actual}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, help="evidence directory (default: a new temp dir)")
    parser.add_argument("--skip-build", action="store_true", help="reuse the current core/webview/extension builds")
    parser.add_argument("--port", type=int, default=9333)
    opts = parser.parse_args()

    out = (opts.out or Path(tempfile.mkdtemp(prefix="spek-folder-totals-"))).resolve()
    out.mkdir(parents=True, exist_ok=True)
    print(f"evidence: {out}")

    if not opts.skip_build:
        with open(out / "build.log", "w") as log:
            build = "npm run build:webview && npm run build:vscode"  # SKILL.md step 2: core, ui, webview, extension
            if subprocess.run(build, shell=True, cwd=REPO, stdout=log, stderr=subprocess.STDOUT).returncode != 0:
                print(f"build failed, see {out / 'build.log'}", file=sys.stderr)
                return 2

    run = Path(tempfile.mkdtemp(prefix="spek-vscode-run-"))
    shutil.copytree(REPO / "test-fixtures" / "nested-specs", run / "ws")
    profile = run / "profile"
    if port_answers(opts.port):
        print(f"port {opts.port} is already in use; pass --port, or the run would drive that process's window", file=sys.stderr)
        return 2
    code_log = open(out / "code.log", "w")
    subprocess.Popen(
        ["code", "--new-window", "--disable-workspace-trust", "--skip-welcome", "--skip-release-notes",
         "--disable-extensions", f"--user-data-dir={profile}", f"--extensions-dir={run / 'ext'}",
         f"--extensionDevelopmentPath={REPO / 'packages' / 'vscode'}",
         f"--remote-debugging-port={opts.port}", str(run / "ws")],
        stdout=code_log, stderr=subprocess.STDOUT,
    )
    try:
        wait_for("the VS Code workbench", lambda: workbench_up(opts.port))
        time.sleep(4)
        cdp(opts.port, "palette", "spek: Open spek")
        wait_for("the spek app", lambda: app(opts.port, GO_TO_SPECS))

        rows = read_rows(opts.port, len(UNFILTERED))
        cdp(opts.port, "shot", str(out / "specs.png"))
        wait_for("the filter input", lambda: app(opts.port, TYPE_FILTER), timeout=10)
        filtered = read_rows(opts.port, len(FILTERED))
        cdp(opts.port, "shot", str(out / "specs-filtered.png"))
    finally:
        # Browser.close shuts down exactly the instance on this port (SKILL.md step 8); nothing is killed.
        closed = cdp(opts.port, "close")
        if closed.returncode != 0:
            print(f"warning: the VS Code window did not close: {closed.stderr.strip()}", file=sys.stderr)
        code_log.close()
        shutil.rmtree(run, ignore_errors=True)

    (out / "rows.json").write_text(json.dumps({"unfiltered": rows, "filtered": filtered}, indent=2, ensure_ascii=False) + "\n")
    checks = [compare("unfiltered", UNFILTERED, rows), compare(f'filter "{FILTER}"', FILTERED, filtered)]
    passed = all(c["ok"] for c in checks)
    (out / "report.json").write_text(json.dumps({"passed": passed, "checks": checks}, indent=2, ensure_ascii=False) + "\n")
    for c in checks:
        print(f"{'PASS' if c['ok'] else 'FAIL'}  {c['check']}")
    print(f"report: {out / 'report.json'}")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
