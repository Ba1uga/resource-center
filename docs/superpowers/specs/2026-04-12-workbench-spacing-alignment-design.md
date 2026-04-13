# Workbench Table Spacing Alignment Design

**Date:** 2026-04-12

## Context

Resource Center now has multiple active workbenches with working table layouts, sticky headers, and pagination, but their spacing rhythm is inconsistent.

The user asked to make all workbench tables and their immediate outer content containers use the same spacing baseline as the `textbook` workbench.

The user explicitly limited the scope to spacing around:

- workbench content area gaps
- table shell geometry
- table header and cell padding
- pagination footer padding

The user explicitly excluded broader visual convergence such as toolbar controls, buttons, and top summary cards.

## Goal

Align the table-area spacing of all active workbenches to the `textbook` workbench so the page feels consistent while preserving each workbench's existing visual identity and behavior.

## Non-Goals

- Do not change workbench-specific colors, typography, or shadows.
- Do not unify toolbar input heights or button heights.
- Do not change summary-card layout or sizing.
- Do not touch pagination logic or table behavior.
- Do not introduce a shared generic table component.

## Reference Baseline

The `textbook` workbench is the spacing reference.

The alignment baseline is:

- content-area `gap`: `16px`
- table shell border radius: `18px`
- table header and data cell padding: `18px 16px`
- pagination/footer padding: `14px 16px`

These values should be treated as the canonical spacing rhythm for table-centric workbenches in this pass.

## Scope

### In Scope

- `textbook` workbench as spacing reference
- `courseware` workbench spacing alignment
- `video` workbench spacing alignment
- `question` workbench spacing alignment

### Out of Scope

- `outline` workbench
- `mapping` placeholder workbench
- any new shared spacing token layer
- toolbar control dimensions
- summary metrics layout
- mobile card conversion behavior beyond preserving existing responsive compatibility

## Design Decisions

### 1. Keep Each Workbench Structurally Independent

Spacing will be aligned inside each workbench stylesheet rather than moved into a shared abstraction.

Reasoning:

- the user asked for direct alignment rather than refactoring
- current repository state already contains broad ongoing structural changes
- spacing-only edits are safer when made locally

### 2. Align Only the Table Zone and Its Immediate Parent Rhythm

The term "外部容器的边距" is interpreted as the spacing around the table area inside each workbench content region, not the entire workbench UI.

That means this pass aligns:

- root content `gap`
- table shell radius and containment
- cell padding
- pager/footer padding

This pass does not align:

- toolbar height
- top controls density
- summary-card geometry

### 3. Preserve Existing Visual Language

Each workbench keeps its current:

- color palette
- border tones
- button treatment
- shadow treatment
- responsive behavior

Only spacing is normalized.

## Per-Workbench Design

### Textbook Workbench

Files expected to change:

- `src/features/resource-center/workbench/textbook/styles/textbook-workbench.css`

Role in this task:

- serve as the baseline reference
- receive at most tiny cleanup adjustments if another active rule slightly diverges from the intended baseline

Expected result:

- effectively unchanged in look and feel

### Courseware Workbench

Files expected to change:

- `src/features/resource-center/workbench/courseware/styles/courseware-workbench.css`
- `tests/resource-center/workbench/courseware/courseware-workbench-section.test.ts`

Adjustments:

- change root content `gap` from its current looser value to `16px`
- reduce table shell radius to `18px`
- align table `th` / `td` padding to `18px 16px`
- align pagination footer padding to `14px 16px`

No changes to:

- summary cards
- toolbar heights
- drawer spacing

### Video Workbench

Files expected to change:

- `src/features/resource-center/workbench/video/styles/video-workbench.css`
- `tests/resource-center/workbench/video/video-workbench-section.test.ts`

Adjustments:

- change root content `gap` to `16px`
- reduce table shell radius to `18px`
- align table `th` / `td` padding to `18px 16px`
- align pagination footer padding to `14px 16px`

No changes to:

- upload button height
- toolbar density
- current sticky header behavior
- current pagination logic

### Question Workbench

Files expected to change:

- `src/features/resource-center/workbench/question/styles/question-workbench.css`
- `tests/resource-center/workbench/question/question-workbench-section.test.ts`

Adjustments:

- align root content `gap` to `16px`
- reduce table shell radius to `18px`
- align desktop table `thead th` / `tbody td` padding to `18px 16px`
- align pager padding to `14px 16px`

Responsive guardrail:

- preserve current mobile stacked/tableless presentation
- do not force desktop spacing rules into small-screen layout where it harms readability

## Implementation Notes

The safest implementation strategy is direct numeric alignment in each stylesheet.

Suggested rule targets:

- `.courseware-management`
- `.courseware-management__table-shell`
- `.courseware-management__table th, .courseware-management__table td`
- `.courseware-management__pagination`

- `.video-management`
- `.video-management__table-shell`
- `.video-management__table th, .video-management__table td`
- `.video-management__pagination`

- `.question-management`
- `.question-management__table-shell`
- `.question-management-table thead th`
- `.question-management-table tbody td`
- `.question-management-pager`

## Testing Strategy

### Structural CSS Assertions

Update existing section tests to confirm aligned spacing values where appropriate:

- root `gap: 16px`
- table shell radius `18px`
- table cell padding `18px 16px`
- pagination padding `14px 16px`

### Regression Verification

Run:

- `npm test`
- `npm run type-check`
- `npm run build-only -- --emptyOutDir false`

Because this is styling-only scope, passing existing tests plus build validation is sufficient.

## Risks

- Over-aligning too aggressively could accidentally flatten useful visual differences between workbenches.
- Question workbench has the most custom structure, so spacing alignment must avoid breaking its responsive table-to-card transformation.
- If summary-card spacing is touched accidentally, the user-facing scope will be exceeded.

## Success Criteria

This task is successful when:

- `courseware`, `video`, and `question` table zones visually match the `textbook` workbench spacing rhythm
- toolbar sizing remains workbench-specific
- summary-card sizing remains workbench-specific
- no pagination or sticky-header behavior regresses
