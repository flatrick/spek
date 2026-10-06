# Tasks

## 1. Core

- [x] 1.1 Add `historyChanges` to `SpecInfo`, filled by `scanOpenSpec` from the walk that already counts `historyCount` (relative change directory, code-unit order); verify scanner tests over `test-fixtures/nested-specs/` (extended with `rework-guides`, one change across two sibling specs) cover active and archived identities and a change shared by two specs, and that `historyCount` equals its length. Run `npm run build:core` before any web test.
- [x] 1.2 Add a pure `specChangeTotals` on the `@spekjs/core/spec-topic` subpath; verify tests for a spec-bearing parent, a grouping-only folder, a change shared across siblings counting once, and a leaf.

## 2. Hosts

- [x] 2.1 Show `N changes · M total` on every Specs-page item with children (`—` for grouping-only folders), computing totals from the unfiltered tree; verify `SpecTree` tests for both item kinds, an unchanged leaf, and a filter that leaves the total unchanged.
- [x] 2.2 Mirror `historyChanges` in the Kotlin scanner and specs list response; verify a Kotlin test against the shared fixture asserts the same values and order as the TypeScript scanner.

## 3. Verification

- [x] 3.1 Use the `verify-vscode` skill to check the Specs page and the spek sidebar in a VS Code Extension Development Host against the shared fixture.
- [x] 3.2 Run `npm run build`, `build:intellij`, `type-check`, `lint`, `npm test`, the Gradle `test` task from `packages/intellij`, and `openspec validate spec-folder-change-totals --strict`.
