# Vue3 Project Structure Design

**Date:** 2026-04-08
**Project:** `resource-center`
**Status:** Approved in conversation, pending file review

---

## Goal

Refactor the current Vue 3 + Vite project into a lightweight enterprise-style structure that is appropriate for the existing scope. The restructuring should improve maintainability, module boundaries, and future extensibility without introducing empty framework layers or changing the current UI behavior.

## Current State

The current project is functional but structurally flat:

- `src/main.ts` mounts the application and imports global styles.
- `src/App.vue` contains root composition logic and the full page view.
- `src/dashboard-content.js` mixes static business data, view-model assembly, and helper functions.
- `src/dashboard-content.d.ts` provides types separately from the implementation.
- `src/styles.css` contains the global page and component styling.
- `tests/dashboard-content.test.mjs` validates the current data model and part of the page structure.

This is acceptable for a demo-scale project, but it is not a good long-term structure for ongoing feature growth.

## Design Principles

- Restructure only for the code that exists today.
- Do not create placeholder directories for capabilities the project does not use.
- Keep application bootstrap, page view, feature model, constants, and types in clearly separated locations.
- Prefer TypeScript source modules over JavaScript implementations with detached declaration files.
- Preserve runtime behavior and current page output while improving code organization.
- Use path aliases consistently for internal imports.

## Recommended Structure

The project will adopt the following structure:

```text
src/
  app/
    App.vue
    main.ts
    styles/
      index.css
  views/
    resource-center/
      ResourceCenterView.vue
  features/
    resource-center/
      constants/
        icons.ts
      model/
        dashboard.ts
      types/
        dashboard.ts
tests/
  resource-center/
    dashboard-content.test.mjs
```

## Responsibility Boundaries

### `src/app`

Application shell and bootstrap only.

- `src/app/main.ts`: create and mount the Vue application.
- `src/app/App.vue`: root application wrapper that renders the current page-level view.
- `src/app/styles/index.css`: global style entry and shared page styling currently held in `src/styles.css`.

This layer must not hold feature data or page-specific business assembly logic.

### `src/views/resource-center`

Page-level composition only.

- `ResourceCenterView.vue` becomes the page component for the current resource center screen.
- It owns local UI state such as the active section.
- It consumes feature-level model builders and constants instead of defining them inline.

This layer may coordinate view rendering, but it should not store raw dashboard datasets or reusable domain logic.

### `src/features/resource-center/model`

Feature-owned business model and view-model assembly.

- `dashboard.ts` replaces `src/dashboard-content.js`.
- It contains navigation definitions, dashboard data, summary helpers, and `createDashboardViewModel`.
- This file remains feature-local because the logic is specific to the resource center dashboard.

The model layer should be the single source of truth for resource center dashboard data and derived values.

### `src/features/resource-center/constants`

Stable feature constants.

- `icons.ts` extracts the `iconPaths` object from the current page component.
- This keeps SVG path constants outside the page template and supports future reuse inside the same feature.

### `src/features/resource-center/types`

Feature-specific TypeScript contracts.

- `dashboard.ts` converts the detached declaration file into real TypeScript interfaces.
- The old `src/dashboard-content.d.ts` will be removed after the implementation is migrated.

Types stay inside the feature because they currently serve only this page.

## Data Flow

The page will follow this flow after restructuring:

1. `src/app/main.ts` mounts `src/app/App.vue`
2. `src/app/App.vue` renders `src/views/resource-center/ResourceCenterView.vue`
3. `ResourceCenterView.vue` tracks `activeSection`
4. `ResourceCenterView.vue` calls `createDashboardViewModel(activeSection)` from the feature model
5. The feature model returns the structured data needed by the page template
6. The page template renders icons from `icons.ts` and dashboard content from the model

This keeps the root app thin and makes the page responsible only for rendering and page-local interaction.

## Import Strategy

Internal imports will be normalized to the `@/` alias already supported by Vite and TypeScript.

Examples:

- `@/views/resource-center/ResourceCenterView.vue`
- `@/features/resource-center/model/dashboard`
- `@/features/resource-center/constants/icons`
- `@/features/resource-center/types/dashboard`

Relative imports should be avoided for cross-layer references inside `src`.

## Testing Strategy

Current tests are simple but valuable, so they should move with the new structure rather than be dropped.

- The dashboard model test file will move under `tests/resource-center/`.
- The test will update its imports to the new model location.
- The test will continue verifying navigation generation, summary calculations, and key template invariants.

No new testing framework is required for this restructuring. The current Node-based test entry remains sufficient for the existing scope.

## Migration Scope

This restructuring includes:

- Moving bootstrap files into `src/app`
- Moving the page component into `src/views/resource-center`
- Migrating `dashboard-content.js` into TypeScript under `src/features/resource-center/model`
- Migrating the related type declarations into `src/features/resource-center/types`
- Extracting SVG icon constants into `src/features/resource-center/constants`
- Moving the CSS entry into `src/app/styles`
- Updating tests and imports to match the new structure

## Explicit Non-Goals

This restructuring does not include:

- Adding Vue Router
- Adding Pinia
- Adding API service layers
- Adding empty `stores`, `router`, `composables`, `utils`, or `shared` directories without usage
- Redesigning the page UI
- Changing dashboard business behavior beyond what is required for the structural move

## Trade-Offs Considered

### Option A: Minimal split into `views + data + types`

Pros:

- Lowest migration cost
- Easy to understand quickly

Cons:

- Business logic and feature ownership stay too generic
- The project will likely need another restructure once the second page or module appears

### Option B: Hybrid `app + views + features` structure

Pros:

- Stronger boundaries without overengineering
- Scales naturally as resource-center grows into multiple modules
- Keeps current project size and future expansion in balance

Cons:

- Slightly more files than a minimal split
- Requires touching imports and test paths in multiple places

### Option C: Full domain-first feature tree everywhere

Pros:

- Strong long-term modularity
- Useful for large teams and large product surfaces

Cons:

- Too heavy for the current project
- Would create unnecessary abstraction at the current stage

Option B is the recommended design because it matches the current scope while leaving a clean path for future growth.

## Risks And Mitigations

- Risk: Broken imports after file moves
  Mitigation: Use the existing `@/` alias consistently and verify with type-check and build.

- Risk: Behavior drift while converting JavaScript model code to TypeScript
  Mitigation: Keep the exported API shape stable and update tests before or during migration.

- Risk: Template breakage during page extraction
  Mitigation: Move template content intact first, then only adjust imports and state wiring.

- Risk: Existing text encoding issues becoming harder to track during refactor
  Mitigation: Avoid content rewrites during structural migration and validate file contents after moves.

## Acceptance Criteria

The restructuring is complete when all of the following are true:

- The project builds successfully.
- Type-check passes successfully.
- Existing dashboard-related tests pass successfully.
- The page behavior remains consistent with the current implementation.
- All runtime code under `src` follows the approved layered structure.
- No unused placeholder enterprise directories are introduced.

## Implementation Summary

The approved direction is a lightweight enterprise-style Vue 3 structure with:

- `app` for bootstrap and global styling
- `views` for page-level composition
- `features/resource-center` for dashboard model, types, and constants

This preserves the current single-page scope while replacing the flat `src` layout with clear ownership boundaries that can support future growth.
