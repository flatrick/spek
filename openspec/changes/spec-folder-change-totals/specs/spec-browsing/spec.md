# Spec Delta

## MODIFIED Requirements

### Requirement: Spec list with filtering
The system SHALL display all specs in a folder tree with history count metadata, with siblings ordered by comparing one path segment at a time by UTF-16 code unit, matching the VS Code and IntelliJ trees. A filter input SHALL allow instant client-side filtering by any part of the full topic path, retaining ancestor folders needed to reach matching specs. Each spec item SHALL show its topic's final path segment and the number of related changes as secondary information; its full topic path SHALL remain available to distinguish duplicate names. Every item with child topics SHALL also show a cumulative total: the number of distinct changes related to its own spec or to any spec below it, so a change affecting several of those specs counts once. The total SHALL describe the whole folder, not the specs a filter currently shows.

#### Scenario: Display all specs
- **WHEN** user navigates to the SpecList page
- **THEN** all spec topics appear in a folder tree, ordered per segment by code unit within each folder, with each spec's history count

#### Scenario: Filter specs
- **WHEN** user types in the filter input
- **THEN** the tree shows only specs whose full topic path contains the text (case-insensitive), together with their ancestor folders

#### Scenario: Folders cannot be collapsed while filtering
- **WHEN** a filter is active
- **THEN** every folder it kept is shown open and its expand control is disabled
- **AND** clearing the filter restores each folder to the open or closed state it had before filtering

#### Scenario: Spec with no history
- **WHEN** a spec has zero related changes
- **THEN** the history count is not displayed (or shows "No changes")

#### Scenario: Parent spec with child specs
- **WHEN** a folder has its own `spec.md` and contains child spec folders
- **THEN** its spec remains openable and its child topics can be expanded

#### Scenario: Spec-bearing parent shows its own count and the folder total
- **WHEN** `auth` has 3 related changes, and its children `auth/oauth` and `auth/session` have 5 and 4, with no change shared between them
- **THEN** the `auth` item shows 3 changes and a total of 12

#### Scenario: Grouping-only folder shows a total
- **WHEN** `contracts` has no `spec.md` of its own and its only spec, `contracts/pagination`, has 7 related changes
- **THEN** the `contracts` item shows no count of its own and a total of 7

#### Scenario: A change affecting several specs in a folder counts once
- **WHEN** one change has delta specs for both `auth/oauth` and `auth/session`
- **THEN** each child counts that change once, and the `auth` total counts it once

#### Scenario: A leaf spec shows no total
- **WHEN** a spec has no child topics
- **THEN** it shows only its own related-change count

#### Scenario: Filtering does not shrink a total
- **WHEN** a filter hides some specs below a folder
- **THEN** the folder's total still counts the changes of every spec below it
