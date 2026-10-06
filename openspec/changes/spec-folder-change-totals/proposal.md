# Proposal

## Why

On the Specs page, a folder shows a number only when it holds a spec of its own, and that number never covers the specs below it. In a repository organised into nested folders, a reader cannot see a folder's activity without expanding every level.

## What Changes

- On the Specs page (web, VS Code webview, IntelliJ webview), every item with child topics shows its own related-change count and a cumulative total of the distinct changes of its whole subtree: `N changes · M total`, or `— · M total` for a folder without its own spec. A leaf keeps its single count.
- Each `SpecInfo` carries `historyChanges`, the changes behind `historyCount`, so a total can count a change touching several specs once.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `spec-browsing`: folder items show their own count and a distinct cumulative total.
- `openspec-scanner`: each spec lists its related changes.
- `intellij-embedded-server`: the IntelliJ specs list carries the same `historyChanges`.

## Impact

`@spekjs/core`, the Kotlin scanner, and the web Specs page. The VS Code and IntelliJ native trees are unchanged.

Verification uses the `verify-vscode` project skill, which lands in its own PR (branch `verify-vscode-skill`); this branch is stacked on it.

### For whoever cuts the release

- **`@spekjs/core` is a minor bump.** `SpecInfo` gains a required `historyChanges: string[]`, so a consumer that constructs a `SpecInfo` itself must now supply it, and `specChangeTotals` is a new export on the `@spekjs/core/spec-topic` subpath (not the package index).
- **The product CHANGELOG** should mention folder totals on the Specs page for web, VS Code, and IntelliJ.
