# Resource Center Module Workbench Design

## Summary

This design replaces the current shared placeholder experience for non-overview navigation entries with six independent section entry components that all use one shared visual shell.

The selected direction is:

- Shared design shell
- Six independent section components
- Lightweight workbench skeletons only for this phase
- No detailed per-module workbench design yet

The affected module entries are:

- 大纲管理
- 教材管理
- 课件管理
- 视频管理
- 习题管理
- 资源和知识点挂载

## Product Context

- Audience: teachers and teaching teams using the resource center
- Primary use case: switch from the overview dashboard into a focused module workspace
- Brand tone: continue the current resource center language, with a soft professional dashboard feel and low visual friction

## Core Decisions

### Page structure

- `resourceOverview` keeps using the existing overview section and remains the only complex dashboard layout in this phase.
- The other six navigation keys no longer share one generic placeholder section.
- Each of the six keys gets its own dedicated section component under `src/views/resource-center/sections/`.
- `ResourceCenterPage.vue` becomes the page-level router for section rendering based on `activeSection`.

### Shared shell

All six new sections use one shared shell component that provides:

- module kicker
- module title
- module responsibility description
- one main placeholder area
- one consistent status pill

The shared shell visual language is fixed to:

- outer shell background: `#F7F7F7`
- inner placeholder card background: `#FFFFFF`
- same rounded, padded, lightly elevated workbench feel as the selected overview shell design
- responsive shrinking rules aligned with the current resource center page

### Scope of each section in this phase

Each module section is intentionally lightweight and only includes:

- section-specific title
- section-specific description
- one main placeholder card

This phase does not design or implement:

- full module workbench layouts
- secondary cards, tables, tabs, filters, or toolbars
- distinct workflows inside each module

Those details will be handled later in separate module-specific threads.

## Section Content Direction

Each section must feel like a real destination, not a relabeled generic placeholder.

### 大纲管理

- title focus: 章节树、知识骨架、节点说明
- placeholder intent: future outline editing and structure maintenance entry

### 教材管理

- title focus: 教材版本、章节切片、配套讲义
- placeholder intent: future textbook resource organization and version management entry

### 课件管理

- title focus: 课件模板、课堂脚本、讲授备注
- placeholder intent: future courseware accumulation and teaching material maintenance entry

### 视频管理

- title focus: 微课、示范课、实验视频
- placeholder intent: future video archiving, tagging, and completion entry

### 习题管理

- title focus: 题型分类、难度标签、讲评素材
- placeholder intent: future exercise organization and knowledge-point tagging entry

### 资源和知识点挂载

- title focus: 挂载核对、批量修正、缺失关联
- placeholder intent: future resource-to-knowledge-point mapping workbench entry

## Implementation Shape

### New shared building block

Create one reusable workbench shell component that accepts content through props and one default slot.

Required shell inputs:

- kicker
- title
- description
- status text

The shell owns layout and styling. Module sections only provide semantic content.

### New section components

Create six section components:

- outline workbench section
- textbook workbench section
- courseware workbench section
- video workbench section
- question workbench section
- mapping workbench section

Each section wraps the shared shell and fills in:

- module-specific title copy
- module-specific description copy
- one module-specific placeholder block

### Page integration

Update the main resource center page so the section selection logic becomes:

- overview key -> overview section
- six module keys -> their dedicated section component
- existing external home entry behavior remains unchanged

The current generic placeholder section should no longer be the render target for those six module keys.

## Acceptance Criteria

- Clicking any of the six module entries opens a dedicated section component, not a shared generic placeholder.
- All six sections share the same selected workbench shell design.
- The six sections differ in title and responsibility copy so each reads like a module-specific destination.
- Each section contains only one main placeholder region in this phase.
- The overview page keeps its existing independent dashboard layout.
- Responsive behavior remains consistent with the current resource center page style.

## Assumptions

- The current overview shell design is the visual reference for the shared module shell.
- The chosen shell colors remain fixed at `#F7F7F7` for the outer shell and `#FFFFFF` for child cards.
- This phase is structural and visual only; real module workflows will be designed later in separate threads.
- Shared shell reuse is preferred over duplicating styling across the six new section files.
