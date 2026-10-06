# Design

## Context

The behaviour already ships on `master`; see [proposal.md](proposal.md). This change only writes it down, so the decisions below are the reasons the fixes took the shape they did — recorded here because the archived `support-nested-spec-folders` design predates them.

## Decisions

- **Exact spelling, not case-folding.** A read compares each segment and `spec.md` against its directory's listing before `lstat`. Folding case instead would pick one winner among `Auth` and `auth` on a case-sensitive filesystem, where both can exist; discovery's listing is already the rule for what a topic is.
- **An iteration failure is caught by name in Kotlin.** `DirectoryStream` reports a mid-listing I/O error as `DirectoryIteratorException`, which is not an `IOException`. It joins the existing "omit the entry and keep scanning" divergence from OpenSpec rather than adding a new one.
- **The graph shortens the label it is given.** Core sets `GraphNode.label` to the full topic, so shortening it reads the same for spek, while a consumer's own label survives; identity still comes from the node id through `specNodeTopic`.
- **IntelliJ expands by path and reopens by topic.** Row indices shift as rows expand, and a refresh rebuilds every node, so neither row numbers nor node identity survive; the full topic does.
- **Toggles are disabled, not hidden, while filtering.** A filter forces kept folders open; a collapse recorded then would only appear once the filter is cleared. Disabling keeps the layout stable as the reader types.
