# Spec Delta

## MODIFIED Requirements

### Requirement: Specs tree listing
The IntelliJ plugin SHALL display a folder tree of all specs from the OpenSpec repository. Folder and spec items SHALL be sorted within each folder by comparing one path segment at a time by UTF-16 code unit, matching the web and VS Code trees; each spec item SHALL show its final topic path segment, carry its full topic path as its tooltip, and retain its full topic path for navigation. A folder with its own spec SHALL remain openable while also expanding to child topics. The Specs and Changes roots SHALL open expanded with every node below them collapsed, and a refresh SHALL keep open every spec folder the user had opened, matched by full topic path.

#### Scenario: Display specs list
- **WHEN** the user opens the spek Tool Window
- **THEN** a "Specs" root node displays all spec topics grouped by their path segments

#### Scenario: Parent spec with child topic
- **WHEN** `contracts/pagination` has its own spec and child topic `contracts/pagination/streaming-search`
- **THEN** both specs appear in the tree and the parent remains openable and expandable
- **AND** hovering the child item, labelled `streaming-search`, shows `contracts/pagination/streaming-search`

#### Scenario: Both roots open initially
- **WHEN** the tree is first shown or rebuilt
- **THEN** the Specs and Changes roots are both expanded and no spec folder is

#### Scenario: Open folders survive a refresh
- **WHEN** the user has expanded the `contracts/pagination` folder and a file under `openspec/` changes
- **THEN** after the refresh `contracts/pagination` is still expanded

#### Scenario: Empty specs
- **WHEN** the project has an openspec directory with no specs
- **THEN** the Specs root node has no children
