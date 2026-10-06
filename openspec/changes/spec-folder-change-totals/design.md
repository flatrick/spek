# Design

## Context

See [proposal.md](proposal.md). The Specs page builds its folder tree on the client from the flat `SpecInfo[]` (`buildSpecTree` on `@spekjs/core/spec-topic`), and `SpecInfo` carries only `historyCount`.

## Decisions

### 1. Count distinct changes, from per-spec change identities

Summing the children's `historyCount` was rejected: a change touching two specs in one folder would count twice, and a reader comparing a folder's total against the Changes page would find it wrong. A distinct count needs to know *which* changes each spec has, so `SpecInfo` gains `historyChanges` — each change's directory relative to `openspec/changes/` (`<slug>` or `archive/<slug>`), the same set `historyCount` already counts, now named. The relative directory rather than the bare slug, because it is the identity the filesystem guarantees unique. `historyCount` stays, equal to its length, for existing consumers.

### 2. Compute totals on the client, from the unfiltered tree

The total is computed by a pure `specChangeTotals` beside `buildSpecTree`, rather than shipped as a server-side map from folder path to total: grouping-only folders have no `SpecInfo` to carry a number, and a second payload keyed by folder would repeat the tree the client already builds. It stays on the browser-safe subpath, not the package index, as the other tree functions do.

It is taken from the **unfiltered** tree: a folder's total is a fact about the folder, and a number that shrinks while typing in the filter reads as the data changing.

### 3. Display

`N changes · M total` on an item with children, `— · M total` on a grouping-only folder, the existing single count on a leaf. A spec-bearing parent with no changes of its own shows `0 changes` rather than hiding it, so the two numbers stay in fixed positions. The VS Code and IntelliJ native trees are out of scope: neither shows a count today.

## Risks / Trade-offs

- [The spec list payload grows by one string per spec-change pair] → The same pairs the scanner already walks to count; for a 93-spec repository this is a few kilobytes.
