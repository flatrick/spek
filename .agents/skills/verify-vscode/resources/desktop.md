# Desktop host

An isolated Extension Development Host window, loading the extension straight from `packages/vscode`.
Uses `REPO`, `SKILL`, `RUN`, `PORT` and `cdp` from step 1 of `SKILL.md`.

## Launch

Run this in the background; it keeps running until the close step below.

```bash
code --new-window --disable-workspace-trust --skip-welcome --skip-release-notes \
  --disable-extensions \
  --user-data-dir="$RUN/profile" --extensions-dir="$RUN/ext" \
  --extensionDevelopmentPath="$REPO/packages/vscode" \
  --remote-debugging-port=$PORT "$RUN/ws"
```

- `--extensionDevelopmentPath` must be absolute. A relative one is silently ignored: the window opens with no spek icon in the activity bar and no `spek:` commands.
- The throwaway `--user-data-dir` keeps the operator's own VS Code untouched and makes this window an instance of its own. A launch sharing a running instance's profile starts no instance: its window opens inside the running one and its `--remote-debugging-port` is ignored, so nothing answers on `$PORT` (measured with two launches sharing a throwaway profile, standing in for the default one; VS Code 1.140, Linux, 2026-10-06).
- `--disable-extensions` disables installed extensions only; the development extension still loads. The "All installed extensions are temporarily disabled" toast is expected.
- The `code` launcher may exit while the window stays up; the window is what matters.
- A window opens on the operator's screen. Say so before launching.

Wait for the workbench, then list the targets:

```bash
until cdp workbench '"up"' 2>/dev/null; do sleep 1; done; sleep 4
cdp targets
```

## Close

```bash
cdp close
```

This sends the DevTools `Browser.close` command to the instance serving `$PORT`, which shuts down exactly that window, and waits until the port stops answering.
Do not kill it instead.
The `code` launcher exits once the window is up, and the window's main process is reparented (parent PID 1), so the PID a script started is not the window's.
A pattern kill (`pkill -f` on the profile path) also matches the window's GPU and utility processes, and in four runs the window survived the first SIGTERM three times; why was not established.
(Both measured on VS Code 1.140, Linux, 2026-10-06.)
A pattern kill can also match the shell running it, whose own command line holds the pattern: `pkill -f "serve-web --port 8123"` killed the shell that ran it (observed 2026-10-06).
