# Question Workbench Courseware-Style Alignment Design

**Date:** 2026-04-12

## Context

The resource center now has multiple active workbench modules with real table and drawer workflows. `courseware` already establishes the clearest list-management visual language in the current repository:

- three summary cards at the top
- one compact feedback strip
- one horizontal management toolbar
- one unified table shell with footer pagination
- one right-side drawer for create and edit actions

`question` is functionally richer than `courseware`, but its current layout reads as a different product area:

- the summary area is only text
- filters live in a separate large form block
- the table and pager are visually detached from the courseware pattern
- the editor uses a larger custom panel language than other active workbenches

The user explicitly wants question management to feel like courseware management while still preserving question-specific capabilities.

## Product Context

- Audience: teachers as the primary daily users
- Use pattern: a balanced mix of searching, creating, reusing, editing, and routine organization
- Design target: match the other active workbenches so moving between modules feels natural and low-friction

## Goal

Rework the `question` workbench so its page rhythm, visual hierarchy, and interaction styling align closely with `courseware`, without reducing the existing question editor depth or repository-backed query behavior.

## Non-Goals

- Do not replace the local question repository model or query flow
- Do not simplify question editing into the lighter courseware form
- Do not introduce a new generic shared list-page framework in this change
- Do not redesign unrelated workbenches

## Approved Direction

Use a high-fidelity alignment strategy:

- adopt the same top-to-bottom page rhythm as `courseware`
- keep question-specific filters, columns, and editor fields
- preserve current behavioral flows for search, pagination, create, copy, edit, and delete
- restyle and partially restructure the question workbench so it feels like the same management family as `courseware`

## Design Decisions

### 1. Page Skeleton Aligns to Courseware

`QuestionWorkbenchSection.vue` should be reorganized into the same major visual sequence as `CoursewareWorkbenchSection.vue`:

1. summary cards
2. feedback strip
3. unified toolbar
4. table shell with attached pagination footer
5. right-side editor drawer

Reasoning:

- teachers should not need to relearn scanning patterns when switching modules
- the courseware workbench already provides the clearest current reference for list-management tasks
- layout alignment gives the biggest visual win without rewriting the question domain model

### 2. Summary Changes from Text to Three Cards

The current question summary text block should become three cards using the courseware summary visual language.

The cards should summarize management state rather than analytics:

- matching question count for the current active query
- published question count inside the current matching result set
- most recent update timestamp inside the current matching result set, with a fallback when no rows are visible

These cards should read as operational status for teachers, not dashboard metrics.

### 3. Filters Move into a Courseware-Style Toolbar

The current separate filter panel should be visually reworked into a horizontal management toolbar aligned with courseware:

- keyword search first and visually dominant
- subject, chapter, type, and difficulty filters arranged inline
- the create button placed as the rightmost primary action

Behavior remains unchanged:

- query drafting still happens in `queryDraft`
- search is only applied when the user submits
- reset still clears draft query and active query together

This keeps the question workflow intact while making the shell feel unified with other workbenches.

### 4. Table and Pagination Become One Unified Surface

The question table and pager should visually merge into one courseware-style shell:

- one rounded table container
- sticky header retained for desktop
- empty state rendered inside the same shell
- pagination visually attached as the shell footer

The table remains question-specific:

- existing columns stay intact
- row click still opens edit
- copy and delete remain available
- mobile stacked-row fallback stays in place

### 5. Editor Keeps Depth but Adopts Courseware Drawer Language

The question editor remains a right-side editing surface, but its visual treatment should move closer to courseware:

- tighter drawer head hierarchy
- consistent surface, border, radius, and footer action language
- section cards inside the drawer should look like extensions of the same workbench design system

The editor should still preserve:

- question type switching in create mode
- question-type-specific editing sections
- validation errors near the affected fields
- copy mode and edit mode distinctions

This is a visual convergence, not a workflow simplification.

## Component-Level Shape

### `QuestionWorkbenchSection.vue`

Responsibilities after the change:

- compute new summary card content from the current view-model data
- render the aligned top-level layout in courseware order
- continue to own feedback, query submission, editor state, and mutation handling

### `QuestionManagementFilters.vue`

Responsibilities after the change:

- keep existing emitted events and query wiring
- change markup so filters can render as a courseware-like toolbar instead of a boxed form section
- support inline search plus compact select fields and action grouping

### `QuestionManagementTable.vue`

Responsibilities after the change:

- keep the same question row content and actions
- render inside the unified shell without breaking current row interactions
- preserve desktop sticky header and mobile stacked fallback

### `QuestionManagementPagination.vue`

Responsibilities after the change:

- keep the same page-change contract
- align footer structure and visual rhythm with courseware pagination
- stay safe for empty and single-page result states

### `QuestionManagementEditor.vue`

Responsibilities after the change:

- keep current form composition and type-specific sub-editors
- adopt revised drawer head, body, and footer styling aligned with courseware
- preserve accessibility and close/save flows

## Data Flow and Behavior

The underlying question-management behavior remains unchanged:

- `queryDraft` is edited locally through the toolbar
- `handleSearch` promotes `queryDraft` into `activeQuery`
- `activeQuery` continues driving repository-backed listing and pagination
- create, copy, edit, and delete still update repository state and feedback messages
- delete still recomputes a valid page
- validation still blocks save when the editor draft is invalid

Only the presentation layer and top-level composition change.

## Error Handling and Empty States

- Feedback messages remain inline near the top of the workbench, but styled like courseware feedback strips
- Empty filtered results stay inside the table shell and should keep explanatory copy
- Validation errors remain beside their fields inside the editor
- Editor close and save affordances should remain obvious and stable even when the form is long

## Testing Strategy

Update tests to prove the new aligned structure without weakening current behavior:

- section-level tests should assert the question workbench now renders summary cards, toolbar shell, table shell, and attached pagination/footer regions
- structural tests should confirm the courseware-style class structure exists where required
- interaction tests should keep covering search, reset, pagination, edit, copy, delete, and save flows
- responsive tests should continue protecting the mobile table fallback
- no test should assume the question workbench still uses the old boxed filter section layout

## Expected File Scope

Primary files expected to change:

- `src/features/resource-center/workbench/question/ui/QuestionWorkbenchSection.vue`
- `src/features/resource-center/workbench/question/ui/management/QuestionManagementFilters.vue`
- `src/features/resource-center/workbench/question/ui/management/QuestionManagementTable.vue`
- `src/features/resource-center/workbench/question/ui/management/QuestionManagementPagination.vue`
- `src/features/resource-center/workbench/question/ui/management/QuestionManagementEditor.vue`
- `src/features/resource-center/workbench/question/styles/question-workbench.css`

Possible supporting change:

- `src/features/resource-center/workbench/question/model/question-workbench.view-model.ts`

This supporting model file should only change if summary-card data is easiest to compute there.

## Acceptance Criteria

- The question workbench reads as part of the same visual family as courseware management
- The top of the page shows three operational summary cards instead of a plain summary line
- Filters and primary creation action appear in one courseware-style toolbar
- The question table and pagination render as one unified shell
- The editor keeps all existing question-specific capabilities while adopting the updated drawer language
- Existing repository-backed behaviors for search, pagination, copy, edit, delete, and validation continue to work
- Mobile stacked-row behavior remains intact

## Assumptions

- `courseware` is the visual reference, not a source for behavior or data-model reuse
- The current question repository and editor subcomponents are already valid and do not need functional redesign
- Alignment with other workbenches matters more than preserving the exact current question-management layout
