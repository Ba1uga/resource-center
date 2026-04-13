# Workbench Tables Sticky Header and Pagination Design

**Date:** 2026-04-12

**Context**

Resource Center workbench currently has four active management tables that need consistent scrolling and pagination behavior:

- `textbook` workbench: already has pagination, but sticky header behavior is not fixed.
- `courseware` workbench: already has pagination, but sticky header behavior is not fixed.
- `video` workbench: has filtering and table layout, but lacks pagination.
- `question` workbench: already separates filters, table, and pagination, but the table header still scrolls away with the body.

This design intentionally excludes:

- `outline` workbench schedule table
- `mapping` workbench placeholder area
- Any new shared generic table component

The user explicitly chose to fix each workbench independently in the current repository rather than introducing a shared abstraction or working from an isolated worktree.

## Goal

Make every active workbench table keep its header fixed while the table body scrolls, and ensure every active workbench table has pagination that adapts correctly to that workbench's own query conditions.

## Non-Goals

- Do not redesign the overall page shell or workbench layout.
- Do not refactor the four workbenches into a generic table framework.
- Do not change the existing mobile fallback pattern for question management.
- Do not modify outline schedule editing or add a new table to the mapping workbench.

## User Experience Requirements

### Sticky Header

- Each table header must remain visible while the corresponding table body scrolls vertically.
- Sticky behavior must be scoped to the table's own scroll container rather than the outer page scroll area.
- Sticky headers must preserve the existing look and feel of each workbench.
- Sticky headers must continue to work when the table overflows horizontally.

### Pagination

- Textbook, courseware, video, and question management tables must all show paginated results.
- Pagination must reflect filtered results, not the unfiltered data source.
- Changing any query condition for a workbench must return the current page to page `1`.
- If the current page becomes invalid after filtering or deletion, it must clamp to the last available page.
- Empty filtered results must show a valid empty state and disabled unavailable pagination actions.

## Design Decisions

### 1. Workbench-by-Workbench Changes

No new shared table or shared pagination component will be introduced across workbenches. Each workbench keeps its current local structure and styling conventions.

Reasoning:

- The codebase is already mid-refactor with substantial local changes.
- The user explicitly chose direct per-workbench changes.
- This approach minimizes collision risk with existing uncommitted work.

### 2. Keep Existing Pagination Styles

Each workbench retains its current pagination presentation:

- `textbook`: page size selector, page buttons, jump-to-page input
- `courseware`: compact footer pager
- `video`: new pager styled to match current video workbench visual system
- `question`: existing dedicated pagination component

Only behavior is normalized; visuals remain workbench-specific.

### 3. Sticky Header Implemented in Local Scroll Containers

Sticky headers will be implemented by:

- keeping the current `table-shell -> table-scroll -> table` structure where it already exists
- making the `thead th` cells sticky inside the local scroll container
- assigning background and stacking order so body rows do not bleed through the header

This avoids relying on page-level sticky behavior, which would be unstable inside the current nested grid and scroll layout.

## Per-Workbench Design

### Textbook Workbench

Files expected to change:

- `src/features/resource-center/workbench/textbook/ui/TextbookWorkbenchSection.vue`
- `src/features/resource-center/workbench/textbook/styles/textbook-workbench.css`
- `tests/resource-center/workbench/textbook/textbook-workbench-section.test.ts`

Behavior:

- Preserve existing keyword debounce, filter reset, page size selector, page list, and jump page flow.
- Make table header cells sticky inside `.textbook-management__table-scroll`.
- Ensure page clamping still works after filtering and after deleting rows.
- Keep pagination summary based on `filteredRows`.

### Courseware Workbench

Files expected to change:

- `src/features/resource-center/workbench/courseware/ui/CoursewareWorkbenchSection.vue`
- `src/features/resource-center/workbench/courseware/styles/courseware-workbench.css`
- `src/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts`
- `tests/resource-center/workbench/courseware/courseware-workbench-section.test.ts`
- `tests/resource-center/workbench/courseware/courseware-workbench-view-model.test.ts`

Behavior:

- Preserve existing local page state and compact footer pager.
- Make table header sticky inside `.courseware-management__table-scroll`.
- Keep current filter changes resetting page `1`.
- Ensure deletion still resolves the next valid page using filtered totals.

### Video Workbench

Files expected to change:

- `src/features/resource-center/workbench/video/ui/VideoWorkbenchSection.vue`
- `src/features/resource-center/workbench/video/styles/video-workbench.css`
- `src/features/resource-center/workbench/video/model/video-workbench.types.ts`
- `src/features/resource-center/workbench/video/model/video-workbench.view-model.ts`
- `tests/resource-center/workbench/video/video-workbench-section.test.ts`
- `tests/resource-center/workbench/video/video-workbench-view-model.test.ts`

Behavior:

- Add local page state and page-change handling in the section.
- Extend the video view-model to return paginated rows plus pagination metadata.
- Reset to page `1` when keyword or course filter changes.
- Clamp page after deletion.
- Add a video-specific footer pager showing current visible range and total count.
- Make table header sticky inside `.video-management__table-scroll`.

### Question Workbench

Files expected to change:

- `src/features/resource-center/workbench/question/ui/management/QuestionManagementTable.vue`
- `src/features/resource-center/workbench/question/styles/question-workbench.css`
- `tests/resource-center/workbench/question/question-workbench-section.test.ts`

Possible behavioral touchpoints if needed:

- `src/features/resource-center/workbench/question/ui/QuestionWorkbenchSection.vue`
- `src/features/resource-center/workbench/question/ui/management/QuestionManagementPagination.vue`

Behavior:

- Preserve existing `queryDraft` versus `activeQuery` search flow.
- Keep existing pagination component and repository-backed filtering logic.
- Make the table shell itself scrollable enough for sticky headers to function correctly.
- Ensure desktop header stays fixed while the table body scrolls.
- Preserve existing mobile responsive transformation that hides the table header and renders rows as stacked blocks.

## Pagination Rules

These rules apply independently inside each workbench implementation:

- `pageCount = max(1, ceil(total / pageSize))`
- `page` must be clamped into `[1, pageCount]`
- `from = 0` and `to = 0` when `total = 0`
- filter changes reset `page` to `1`
- deletion recomputes the valid page after the new filtered total is known

## Error Handling and Empty States

- Existing empty-state copy for each workbench should remain intact.
- Pagination controls must not emit invalid page changes.
- Empty filtered results must not cause sticky headers or pagers to visually collapse.
- Deleting the last row on a page must never leave the UI pointing at a non-existent page.

## Testing Strategy

### Structural Tests

- Assert that each updated table still renders its expected shell classes.
- Assert that stylesheet rules include sticky table header behavior for textbook, courseware, video, and question tables.

### View-Model Tests

- Keep current textbook and courseware pagination tests green.
- Extend courseware tests only if pagination metadata behavior changes.
- Add video pagination tests covering:
  - default totals
  - page count
  - filtered totals
  - second page slicing
  - safe empty-state pagination

### Behavioral Coverage

- Verify question workbench still references its table and pagination components.
- Verify video workbench includes pager rendering and page-change handling.
- Verify sticky header CSS exists without breaking current responsive rules.

## Risks

- Sticky headers can fail if a parent container accidentally hides overflow in the wrong place.
- Question workbench mobile layout can regress if desktop sticky rules leak into the mobile block layout.
- Video workbench currently has the thinnest state model, so pagination additions must stay minimal to avoid scope creep.

## Implementation Summary

Implementation should be a focused UI behavior update:

- fix sticky header behavior in `textbook`, `courseware`, `video`, and `question`
- add pagination to `video`
- preserve existing look and local module boundaries
- update tests only where necessary to prove the new behavior
