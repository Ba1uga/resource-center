# Workbench Shell Structure Alignment Design

**Date:** 2026-04-12

## Context

The user observed that the bottom spacing between the table area and the overall workbench content container is not truly identical across active workbenches, even after table-spacing alignment.

Root cause analysis showed that:

- `textbook` renders directly as `section.textbook-management.workbench-surface`
- `courseware` and `question` render inside `ModuleWorkbenchShell`
- `video` already renders directly on `workbench-surface`, but its internal section composition still differs from `textbook`

This means the visible bottom spacing difference is structural rather than just a table-padding issue.

## Goal

Make `courseware`, `question`, and `video` use the same root content-shell structure as `textbook`, so the relationship between the table area and the overall workbench container becomes visually identical.

## Non-Goals

- Do not redesign table contents, pagination behavior, or business logic.
- Do not remove `ModuleWorkbenchShell` from the codebase entirely.
- Do not change `textbook` into the shell-based structure.
- Do not modify unrelated workbenches such as `outline` or `mapping`.

## Design Decision

Use **Option 1**: align the other active table workbenches to the `textbook` structure.

That means:

- `courseware`, `question`, and `video` should no longer render inside `ModuleWorkbenchShell`
- each of those workbenches should use `workbench-surface` directly on its own root section
- the internal layout should be organized as textbook-style direct content blocks under the root workbench section

This is the only approach that makes the resulting spacing truly identical rather than visually approximate.

## Structural Target

### Textbook Reference

Current textbook structure:

```vue
<section class="textbook-management workbench-surface">
  <div class="textbook-management__controls">...</div>
  <section class="textbook-management__table-shell">...</section>
</section>
```

This is the reference shape.

### Courseware Target

Current shape:

```vue
<ModuleWorkbenchShell :title="props.section.title">
  <section class="courseware-management">...</section>
</ModuleWorkbenchShell>
```

Target shape:

```vue
<section class="courseware-management workbench-surface" :data-section="props.section.key">
  <div class="courseware-management__controls">...</div>
  <div class="courseware-management__table-shell">...</div>
</section>
```

Notes:

- add a dedicated controls wrapper so top content and table shell follow textbook composition
- preserve existing summary cards, feedback area, toolbar, drawer, table, and pager

### Question Target

Current shape:

```vue
<ModuleWorkbenchShell :title="props.section.title">
  <section class="question-management">...</section>
</ModuleWorkbenchShell>
```

Target shape:

```vue
<section class="question-management workbench-surface" :data-section="props.section.key">
  <div class="question-management__controls">...</div>
  <div class="question-management__table-shell">...</div>
</section>
```

Notes:

- move title handling into the section itself instead of relying on `ModuleWorkbenchShell`
- preserve summary cards, feedback, filters, table, pagination, and editor overlay

### Video Target

Current shape already uses a direct root:

```vue
<section class="video-management workbench-surface">...</section>
```

But its internal composition differs from textbook because heading, feedback, toolbar, and table shell are all siblings without a textbook-style controls wrapper.

Target shape:

```vue
<section class="video-management workbench-surface" :data-section="props.section.key">
  <div class="video-management__controls">...</div>
  <section class="video-management__table-shell">...</section>
</section>
```

Notes:

- preserve current direct-root approach
- add textbook-style controls grouping so table-shell placement matches the textbook workbench

## File Changes

### Vue Files

- `src/features/resource-center/workbench/courseware/ui/CoursewareWorkbenchSection.vue`
- `src/features/resource-center/workbench/question/ui/QuestionWorkbenchSection.vue`
- `src/features/resource-center/workbench/video/ui/VideoWorkbenchSection.vue`

### Stylesheets

- `src/features/resource-center/workbench/courseware/styles/courseware-workbench.css`
- `src/features/resource-center/workbench/question/styles/question-workbench.css`
- `src/features/resource-center/workbench/video/styles/video-workbench.css`

### Tests

- `tests/resource-center/workbench/courseware/courseware-workbench-section.test.ts`
- `tests/resource-center/workbench/question/question-workbench-section.test.ts`
- `tests/resource-center/workbench/video/video-workbench-section.test.ts`

## Styling Implications

The structure change requires local style updates:

- add `__controls` wrapper rules for `courseware`, `question`, and `video`
- change root grid rows so the root behaves like textbook
- ensure the table shell remains the bottom growable area
- keep sticky header and pager behavior intact

The structural alignment should preserve the already-aligned spacing baseline:

- root gap remains `16px`
- table shell radius remains `18px`
- table cell padding remains `18px 16px`
- pager padding remains `14px 16px`

## ModuleWorkbenchShell Handling

`ModuleWorkbenchShell` remains in the codebase for other consumers.

This task does **not** remove or refactor it globally.

It only stops using it in:

- `CoursewareWorkbenchSection`
- `QuestionWorkbenchSection`

`VideoWorkbenchSection` already does not use it.

## Testing Strategy

### Structural Assertions

Update section tests to verify:

- `courseware` no longer imports or renders `ModuleWorkbenchShell`
- `question` no longer imports or renders `ModuleWorkbenchShell`
- `courseware`, `question`, and `video` each render their root section with `workbench-surface`
- each workbench introduces a `__controls` wrapper where required
- table shell remains present as the final main content block

### Regression Verification

Run:

- `npm test`
- `npm run type-check`
- `npm run build-only -- --emptyOutDir false`

## Risks

- `question` has the most layered structure, so moving title ownership from the shell into the section must not break existing tests or editor overlay behavior.
- `courseware` and `question` currently inherit height behavior through `ModuleWorkbenchShell`; removing it means the section root must explicitly preserve full-height layout.
- `video` already has direct-root rendering, so its risk is lower; the main risk there is accidentally changing the toolbar-to-table spacing too aggressively.

## Success Criteria

This task is successful when:

- `courseware`, `question`, and `video` follow the same root-shell pattern as `textbook`
- the perceived bottom spacing between the table area and the workbench container matches textbook
- sticky headers and pagination still behave correctly
- `ModuleWorkbenchShell` remains available for unrelated workbenches
