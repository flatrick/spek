# Tasks

## 1. Confirm each recorded behaviour is held by a test on master

- [x] 1.1 Filtering disables folder toggles: `packages/web/src/components/SpecTree.test.ts`.
- [x] 1.2 A trailing slash is dropped from a spec URL: `packages/web/src/pages/SpecDetail.test.ts`.
- [x] 1.3 A directory whose iteration fails is omitted (Kotlin): `SpecFilesFsTest.kt`.
- [x] 1.4 A read requires the listed spelling, in TypeScript and Kotlin: `packages/core/src/nested-specs.test.ts`, `SpecFilesFsTest.kt`.
- [x] 1.5 A graph spec node keeps a consumer's label: `packages/ui/src/__tests__/spec-node-identity.test.ts`.
- [x] 1.6 IntelliJ root expansion and folders kept open across a refresh: `ExpandRootsTest.kt`, `ReplaceModelTest.kt`.

## 2. Validate

- [x] 2.1 Run `npm test`, the Gradle `test` task from `packages/intellij`, and `openspec validate record-nested-spec-review-fixes --strict`.
