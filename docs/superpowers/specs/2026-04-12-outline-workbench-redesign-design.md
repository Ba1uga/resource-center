# Outline Workbench Redesign

**Date:** 2026-04-12
**Project:** `resource-center`
**Status:** Approved in conversation, pending file review

---

## Goal

Redesign the outline management workbench so it better supports the real teacher workflow:

- quickly find the right course and version
- continue editing without mode switching friction
- create new versions from existing outlines
- archive old versions safely without data loss

The selected direction is a teacher-first hybrid workbench that combines lightweight conditional filtering, course-grouped version navigation, and continuous in-place editing.

## Current State

The current outline workbench in [OutlineWorkbenchSection.vue](d:/AAA_Mine/Vue3/resource-center/src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue) is already functional, but it is optimized more like a document completion surface than a teacher editing desk.

Current strengths:

- left-side course and version navigation already exists
- document section validation and completion summaries already exist
- version duplication and export flows already exist

Current friction:

- the main content area is centered on overview cards rather than day-to-day version maintenance
- editing depends on a secondary right-side drawer, which interrupts continuous work
- the current information hierarchy does not foreground fast version finding and switching
- version lifecycle actions are present, but the UX is not yet shaped around "find, switch, edit, save, archive"
- visual treatment is slightly heavier and more card-like than the desired aligned workbench tone

Functionally, the current page works. Structurally, it should shift from "outline document overview + drawer editor" to "teacher query-and-edit workbench."

## Design Context

- Primary audience: course teachers
- Primary job: maintain and revise course outline versions
- Secondary job: quickly locate the current working version for a course
- Query emphasis: not batch operations, but lightweight conditional filtering to find the right version faster
- Desired tone: calm, professional, minimal, office-like, teacher-tool focused
- Visual alignment: the outline workbench should feel like part of the same resource-center workbench family as question, courseware, video, and the shared workbench shell

## Hard Constraints

The following constraints were explicitly approved in conversation and are mandatory:

- All outline-management interactions must remain inside the existing `OutlineWorkbenchSection` workbench area rendered by `WorkbenchSection`.
- This redesign must not require a new page-level route, separate standalone page, or cross-workbench navigation pattern.
- The visual theme must stay aligned with the existing resource-center workbench language rather than introducing an unrelated new style system.
- Dangerous deletion is out of scope. Version lifecycle uses archive/restore instead of hard delete.

Interpretation note:

- The experience must stay contained within the `OutlineWorkbenchSection` render subtree.
- Internal outline-specific child components may still be extracted later if implementation benefits from it, but the user experience remains wholly inside the outline workbench host area.

## Design Principles

- Prioritize teacher continuity over dashboard theatrics.
- Make locating the right version easy before asking the user to edit anything.
- Keep editing in one place; avoid repeated open-close editor flows.
- Prefer safe lifecycle actions such as archive and restore over destructive deletion.
- Use lightweight filtering, not back-office-grade search complexity.
- Stay visually consistent with the other workbenches by reusing the shared shell language: soft surfaces, restrained elevation, quiet borders, and low-friction controls.

## Evaluated Directions

Three directions were discussed:

### 1. Table-first admin layout

Pros:

- strongest filtering and scanning power
- dense version management

Cons:

- feels like a teaching-office backend rather than a teacher workbench
- weakens focused editing flow

### 2. Hybrid master-detail teacher workbench

Pros:

- balances lookup and continuous editing
- matches teacher mental model of "course -> version -> revise"
- keeps filtering and editing on one screen

Cons:

- requires more careful hierarchy than a simple table

### 3. Document studio layout

Pros:

- strong version/document identity
- good for immersive document completion

Cons:

- weaker for quick switching and conditional lookup

### Selected Direction

The selected direction is **hybrid master-detail teacher workbench**.

## Recommended Design

### Overall Page Model

The outline workbench becomes a three-layer surface inside the existing `OutlineWorkbenchSection` host:

1. header summary layer
2. lightweight conditional query bar
3. split main work area with course-grouped navigation on the left and continuous editing on the right

The workbench no longer centers the experience around overview cards that open a separate editing drawer. Instead, the selected version stays live in the right-side editing workspace.

### High-Level Layout

```text
+------------------------------------------------------------------+
| Title + light reminders                                          |
+------------------------------------------------------------------+
| Query bar                                                        |
| search | semester | status | completion | archive | reset | new  |
+------------------------------------------------------------------+
| Main work area                                                   |
| Left: course groups + version subrows | Right: current version   |
|                                        | summary + status + tabs  |
| Course A                               | + in-place section editor|
|   2026 Spring Draft 92%                |                          |
|   2025 Fall Final Archived             |                          |
| Course B                               |                          |
|   2026 Fall Draft 76%                  |                          |
+------------------------------------------------------------------+
```

## Query Experience

The query area is intentionally lightweight. It helps teachers find a version faster without turning the top of the page into a complex admin filter panel.

### Required query controls

- keyword search
  - searches course name, version name, and teacher note fields
- semester filter
- version status filter
  - draft
  - final
- completion filter
  - all
  - needs completion
  - nearly complete
  - complete
- archive-state filter
  - all
  - active
  - archived
- sort control
  - recently updated
  - semester
  - course name
- reset filters
- create new version action

### Query behavior

- Filtering updates the left navigation list directly.
- If a course contains at least one matching version, the course group remains visible.
- If only some versions match, the course group stays, but only matching version subrows are shown.
- The page shows a small result summary such as `Found 6 courses, 9 versions`.
- If the currently open version no longer matches the active filter, the right panel stays visible and shows a lightweight notice rather than collapsing the editor.

### Explicit non-goals for query

The first redesign phase does not add teacher-unfriendly filter density such as:

- department
- course category
- program ownership
- advanced metadata rules

Those controls are unnecessary for the approved teacher-primary scenario unless future requirements prove otherwise.

## Left Navigation: Course Groups With Version Subrows

The left side becomes the main locating surface.

### Course group row

Each course group should show:

- course title
- lightweight secondary identity such as teacher or department when useful
- version count
- subtle signal if any active draft still needs completion

### Version subrow

Each version subrow should show:

- version name or semester label
- status tag
  - draft
  - final
  - archived
- completion percentage
- missing-item count or completion issue count
- recent update timestamp

### Left-side interactions

- clicking a course group header expands or collapses its versions
- clicking a version subrow loads that version in the right editor
- hover or focus on a version row reveals secondary actions
  - duplicate
  - archive
  - more
- the active version row is clearly selected, but with restrained emphasis rather than a heavy card treatment

The visual goal is scanability, not stacked decorative cards.

## Right Editing Workspace

The right side becomes a continuous editing desk for the selected version.

### Workspace structure

The right panel should contain:

1. current version summary strip
2. completion and risk strip
3. section navigation
4. in-place editor for the active section

### Summary strip

The summary strip should show:

- course title
- version name
- current state
- recent update info
- origin note when the version was copied from another version
- primary actions such as save draft and duplicate to new version

### Completion and risk strip

This strip should summarize readiness without forcing the user back into overview cards.

It should show:

- completion percentage
- incomplete count
- key blocking issues such as invalid assessment totals or missing material references

### Section navigation

The approved sections remain:

- basic information
- course goals
- teaching schedule
- teaching methods
- assessment
- materials

The section navigation should stay visible near the top of the workspace and support fast switching without opening a secondary drawer.

## Section-Specific Editing Layouts

### 1. Basic information

Use a compact two-column form.

Fields:

- course name
- credits
- hours
- instructor
- applicable majors
- version note

Goal:

- quickest-edit section
- minimal friction
- low explanatory noise

### 2. Course goals

Use a two-column structure:

- knowledge goals
- ability goals

Each goal is a lightweight editable item with:

- text field or textarea
- remove action
- add goal action at group level

### 3. Teaching schedule

Use a scrollable editable table.

Columns:

- week label
- chapter or topic
- teaching content
- hours
- teaching method
- notes
- actions

Behavior:

- easy row creation
- easy row deletion
- stable table headers
- avoid modal-only editing for ordinary schedule work

### 4. Teaching methods

Use:

- quick-select method tags
- one supplemental notes field

This section should feel fast and lightweight rather than form-heavy.

### 5. Assessment

This section must make correctness highly visible.

Recommended structure:

- top breakdown area for usual, midterm, final
- immediate total percentage display
- emphasized warning state when total is not 100
- below that, editable usual-assessment detail items

Each usual item includes:

- item label
- percentage
- remove action

### 6. Materials

Use two grouped lists:

- primary materials
- reference materials

Each material item includes:

- title
- author
- source
- note
- remove action

The grouping should help teachers distinguish official teaching materials from supplements without navigating away from the current version.

## CRUD Interaction Model

The approved CRUD model is intentionally safe and teacher-oriented.

### Create

There are two main create paths:

- create a new version from the toolbar
- duplicate the current version into a new version

The default creation path should favor copying from an existing version rather than empty creation.

Required creation fields:

- target course
- version name
- semester
- creation mode
  - copy current version
  - blank version
- note

On success:

- the matching course group expands
- the new version appears near the top of that group
- the right workspace switches to the newly created version
- a lightweight success message confirms the source and destination version

### Update

Editing should happen directly in the right workspace.

Behavior:

- direct field edits mark the current version as unsaved
- list-based content supports in-place add and remove
- the user can save a draft without leaving context
- lightweight draft state feedback remains visible

Recommended user-facing states:

- no unsaved changes
- editing, not yet saved
- draft saved

### Delete

Hard delete is explicitly out of scope.

### Archive / Restore

Version lifecycle is managed through archive and restore.

Rules:

- archive applies to versions, not whole courses
- archived versions are hidden from active-focused filters by default
- archived versions remain viewable
- archived versions can be restored

Archive confirmation copy should clearly state that content is not deleted, only hidden from the default active workspace view.

## Save, Feedback, And Safety

Feedback should stay quiet and contextual.

Approved feedback layers:

- top-level slim status feedback for actions like draft saved
- section-local validation hints
- left-side row-level signals such as missing-item counts

Safety behavior:

- when switching away from a version with unsaved edits, prompt the user to save draft first
- surface validation issues immediately when they are local and actionable
- do not defer important issues until export time only

## Visual Direction

The visual direction must align with the rest of the resource-center workbench family.

### Alignment goals

- continue the current workbench shell tone from [workbench-surface.css](d:/AAA_Mine/Vue3/resource-center/src/features/resource-center/workbench/shared/styles/workbench-surface.css)
- stay compatible with the calm, soft, professional module styling seen in other workbenches
- feel like an extension of the existing resource-center workspace rather than a special-purpose app inside it

### Visual traits

- soft workbench background
- restrained elevation
- quiet borders
- moderate radii consistent with existing workbench primitives
- stronger information hierarchy through spacing and typography rather than bold decorative contrast

### What should change from the current outline page

- reduce the feeling that every internal block is its own hero card
- reduce overly decorative card stacking
- keep the surface polished, but shift from showcase styling toward teacher utility
- maintain clear selection and state cues without turning the page into a data dashboard

### Typography and tone

- preserve a subtle document/workbench blend
- keep headings refined
- keep form and table content practical and readable
- avoid a more aggressive or more decorative visual language than the other workbenches

## Responsive Behavior

- Desktop keeps the full split layout.
- On narrower widths, the left course list can collapse into a panel, but the editing workspace remains primary.
- Core editing functions must not disappear on mobile or narrow layouts.
- The responsive model adapts layout density and ordering, not product capability.

## Implementation Boundaries

This redesign should be implemented without moving the outline experience outside the existing workbench section host.

Allowed:

- refactor `OutlineWorkbenchSection.vue`
- add outline-specific internal UI components under the outline feature if implementation clarity benefits
- extend outline view-model and repository helpers
- adjust `outline-workbench.css`

Not required:

- shared page-shell redesign
- cross-module workbench-shell redesign
- new route architecture

## Explicit Non-Goals

This redesign does not include:

- hard delete
- batch archive operations
- multi-version side-by-side compare
- approval workflow
- real-time collaboration
- automatic outline generation
- major visual divergence from the other resource-center workbenches

## Risks And Mitigations

- Risk: the page becomes too admin-like
  Mitigation: keep filters light, editing dominant, and actions teacher-centered

- Risk: removing the drawer makes the page feel denser
  Mitigation: use clear section structure, restrained spacing rhythm, and a stable right-side hierarchy

- Risk: visual redesign drifts away from the shared workbench family
  Mitigation: anchor the outline page to the existing workbench shell language and align component treatments with other module workbenches

- Risk: archive is mistaken for delete
  Mitigation: use explicit archive copy and keep restore visible

- Risk: filter changes hide the current work unexpectedly
  Mitigation: preserve the current editor context and show a notice instead of forcing a collapse

## Acceptance Criteria

The redesign is complete when all of the following are true:

- The entire outline experience still lives inside the existing `OutlineWorkbenchSection` workbench area.
- The page defaults to a hybrid query-and-edit layout instead of overview cards plus drawer editing.
- The left side displays course groups with version subrows.
- Teachers can filter by keyword, semester, version status, completion, and archive state.
- Teachers can create a new version, preferably from an existing version, without leaving the workbench.
- Editing happens directly in the right workspace rather than through a secondary drawer for the main flow.
- Version lifecycle uses archive and restore, not hard delete.
- The page visually aligns with the other resource-center workbenches and the shared workbench shell.
- The overall tone feels like a teacher tool, not a dense administrative backend.

## Implementation Summary

The approved outline workbench redesign is a teacher-first hybrid master-detail workbench contained inside the current `OutlineWorkbenchSection` host.

It combines:

- lightweight conditional filtering
- course-grouped version navigation
- direct in-place editing
- safe version lifecycle through archive and restore
- visual alignment with the existing resource-center workbench family

The redesign intentionally shifts emphasis away from document overview cards and drawer-based editing, and toward a calmer, more continuous teacher maintenance workflow.
