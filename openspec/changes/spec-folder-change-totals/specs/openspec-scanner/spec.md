# Spec Delta

## ADDED Requirements

### Requirement: Spec list carries its related changes
Each `SpecInfo` returned by the scanner SHALL carry `historyChanges`: every change with a delta spec for exactly that topic, identified by its directory's path relative to `openspec/changes/`, in code-unit order. `historyCount` SHALL remain and SHALL equal its length. The identities SHALL be comparable across specs, so a consumer can count the distinct changes of several specs without reading any change.

#### Scenario: Active and archived changes of one spec
- **WHEN** active change `add-oauth` and archived change `2026-01-02-init-auth` both have a delta for `auth/oauth`
- **THEN** that spec's `historyChanges` is `["add-oauth", "archive/2026-01-02-init-auth"]` and its `historyCount` is 2

#### Scenario: One change across two specs
- **WHEN** change `rework-auth` has deltas for both `auth/oauth` and `auth/session`
- **THEN** both specs list `rework-auth` in `historyChanges`
