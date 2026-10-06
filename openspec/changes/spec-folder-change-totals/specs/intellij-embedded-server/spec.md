# Spec Delta

## MODIFIED Requirements

### Requirement: Kotlin scanner discovers nested specs
The IntelliJ scanner SHALL include every main and change delta `spec.md` at any depth under its respective specs tree, by the same discovery rule and in the same order as the TypeScript scanner (see `openspec-scanner`), with the slash-separated relative directory path as topic. Nested specs SHALL participate in list, detail, history, search, graph, and change artifact responses with the same identity as the TypeScript host.

#### Scenario: Nested list and change response
- **WHEN** a project has main and delta specs for `contracts/pagination/streaming-search`
- **THEN** the IntelliJ specs list and change detail return that full topic path

#### Scenario: Exact nested history
- **WHEN** separate changes affect `contracts/pagination` and `contracts/pagination/streaming-search`
- **THEN** IntelliJ history for the child includes only its own change

#### Scenario: Spec list carries related change identities
- **WHEN** the IntelliJ specs list is requested
- **THEN** each spec carries `historyChanges` with the same values, in the same order, as the TypeScript scanner returns for that project
