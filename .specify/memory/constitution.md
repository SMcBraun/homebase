<!--
Sync Impact Report
- Version change: unversioned template → 1.0.0 (initial adoption; establishes the
  project’s first complete governing baseline).
- Modified principles: none previously defined; populated five principles:
  Homeowner Outcomes, Required Stack and App Router Architecture, Strict
  TypeScript and Utility-First Styling, Tested and Verifiable Changes, and
  Consistent Code and Naming.
- Added sections: Product and Technical Constraints; Team Workflow.
- Removed sections: none.
- Templates: ✅ `.specify/templates/plan-template.md` updated;
  ✅ `.specify/templates/tasks-template.md` updated;
  ✅ `.specify/templates/spec-template.md` reviewed; no changes needed because
  its requirements remain technology-agnostic;
  ✅ `.github/agents/speckit.constitution.agent.md` reviewed; no stale guidance;
  ⚠ `.specify/templates/commands/*.md` unavailable (directory does not exist).
- Runtime guidance: ✅ `README.md` aligned with code-quality and naming rules;
  `AGENTS.md` reviewed and already requires consulting installed Next.js docs.
- Deferred: original ratification date is unknown and requires team confirmation.
  The repository has no test runner or test script; the team must select and
  configure one before automated feature tests can run. Repository-wide
  Prettier currently reports 15 other files; this update intentionally formats
  only changed documentation.
-->

# HomeBase Constitution

## Core Principles

### I. Homeowner Outcomes

HomeBase MUST help homeowners record completed property maintenance and
understand what maintenance is due or upcoming. Features MUST make one or both
of these outcomes clearer or easier; plans MUST identify the homeowner task
they support. This keeps the student team's scope centered on the product's
stated purpose.

### II. Required Stack and App Router Architecture

The application MUST use Next.js App Router, TypeScript, and Tailwind CSS.
Routes MUST follow Next.js file-based conventions under `app/`. Components
MUST be Server Components by default; a component MUST use the client boundary
only when browser APIs, local interaction state, or event handlers require it.
Contributors MUST consult the installed Next.js documentation for version-
sensitive APIs and conventions before changing application code.

### III. Strict TypeScript and Utility-First Styling

TypeScript strict mode MUST remain enabled, and application code MUST NOT use
the explicit `any` type. Untrusted or uncertain values MUST use `unknown` and
be narrowed before use. Styling MUST use Tailwind utility classes by default;
custom CSS MUST be limited to cases that utilities cannot express clearly or
appropriately. This preserves type safety and keeps styling consistent.

### IV. Tested and Verifiable Changes

Behavior changes MUST include automated tests at the appropriate unit,
integration, or end-to-end level. Feature plans and task lists MUST name the
test approach and include tests for changed behavior. Tests SHOULD be written
before implementation or alongside it, and all relevant tests MUST pass before
merge. Contributors MUST also run ESLint, TypeScript checking, and Prettier
validation on changed files before merge. If a change cannot reasonably be tested
automatically, its plan and pull request MUST document the reason and the
manual verification performed.

### V. Consistent Code and Naming

Code MUST follow the existing project conventions and pass ESLint. Changed
files MUST pass Prettier. React components and component files MUST use
PascalCase; hooks MUST use the `use` prefix and camelCase; functions,
variables, and ordinary files MUST use camelCase where the framework permits;
route segments MUST use lowercase kebab-case. Constants whose values are fixed
by design MUST use UPPER_SNAKE_CASE. Names MUST describe their purpose, and
deviations required by framework conventions MUST follow those conventions.

## Product and Technical Constraints

HomeBase is a property maintenance tracker for homeowners. Its core record is
completed maintenance, and its core planning view is maintenance that is due
or upcoming. The required implementation stack is Next.js App Router,
TypeScript, and Tailwind CSS. Data, interaction, and presentation decisions
MUST support these product outcomes and remain compatible with the required
stack. Custom CSS is permitted only under Principle III.

## Team Workflow

HomeBase is maintained by a three-person student team. Work MUST be done on a
task-specific branch named `feature/task-name`; contributors MUST NOT push
directly to `main`. Every change MUST be proposed through a pull request to
`main`, and at least one teammate MUST review and approve the pull request
before merge. Before merge, the contributor MUST report relevant test results
and confirm ESLint, TypeScript checking, and Prettier validation. Team members
MUST coordinate ownership of shared files and resolve review feedback before
merging so parallel work does not silently conflict.

## Governance

This constitution governs feature specifications, plans, tasks, implementation,
and review. A proposed amendment MUST be made in a pull request that explains
the rationale, compatibility impact, and required template or runtime-guidance
updates. At least one teammate MUST review and approve the amendment before it
is merged to `main`.

The constitution version follows semantic versioning: MAJOR for backward-
incompatible principle or governance changes, MINOR for new principles or
materially expanded requirements, and PATCH for clarifications and
non-semantic edits. Every amendment MUST update the version, last-amended date,
and Sync Impact Report together.

Contributors MUST check plans and pull requests against the principles and
workflow above. Plans MUST document any proposed exception and its rationale;
an exception is not approved unless the pull request review explicitly accepts
it. Reviewers MUST request changes when work conflicts with a MUST requirement
or when required evidence is missing.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date is unknown; confirm with the team. | **Last Amended**: 2026-11-05
