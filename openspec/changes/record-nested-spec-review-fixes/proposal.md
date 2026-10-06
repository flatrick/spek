# Proposal

## Why

`support-nested-spec-folders` was archived before six fixes from the PR #61 review landed, so `openspec/specs/` describes behaviour that `master` no longer has. The code and its tests are already on `master`; only the specs lag.

## What Changes

State the six behaviours in the specs, without changing any code:

- The Specs page disables its folder toggles while a filter is active (`01e7f79`).
- A spec URL's trailing slash is dropped before the topic is read (`92be427`).
- A directory whose listing fails partway through is omitted, on every host, rather than failing the scan (`1172d77`).
- A spec is readable only under the spelling its directory lists, so `AUTH` and `auth.` no longer open `auth` on case-insensitive filesystems (`9a748ab`).
- A graph spec node shortens its own label rather than one rebuilt from its id, so a `@spekjs/ui` consumer's label still shows (`d2eb8f7`).
- The IntelliJ tree opens both roots, and keeps open spec folders open across a refresh (`7cce4ed`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `spec-browsing`: folder toggles are inert while filtering.
- `spa-routing`: a trailing slash on a spec URL is dropped.
- `openspec-scanner`: an unreadable directory is omitted; a read requires the listed spelling.
- `graph-view`: a spec node shows its own label's final segment.
- `intellij-tree-view`: root expansion and folders kept open across a refresh.

## Impact

Specs only. No code, API, or package change, so nothing for release notes beyond what `support-nested-spec-folders` already carries.
