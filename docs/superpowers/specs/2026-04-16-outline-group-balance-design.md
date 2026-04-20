# Outline Group Balance Design

**Date:** 2026-04-16
**Project:** `resource-center`
**Status:** Approved in conversation

---

## Goal

Fix the layout imbalance inside the outline editor so paired content groups keep the desktop two-column layout without stretching each other to equal height.

## Context

The issue appears in two outline sections inside `OutlineWorkbenchSection.vue`:

- `课程目标`: `知识目标` and `能力目标`
- `教材与参考资料`: `主教材` and `参考资料`

When one side has more items than the other, or one side is empty, the current grid layout stretches both group cards to the same height. This creates oversized empty regions and visually awkward alignment.

## Approved Direction

Use **Scheme 2**:

- Keep the desktop two-column layout.
- Stop paired groups from stretching to equal height.
- Keep each group anchored to the top of its own column.
- Add a lightweight empty-state block when a group has no items.
- Apply the same rule set to goals and materials so the behavior stays consistent.

## Constraints

- Stay within the existing outline workbench visual language.
- Do not change the section information architecture.
- Do not move these groups into a single-column desktop layout.
- Do not add new routes, drawers, or modal flows.

## Implementation Notes

- Layout fix should be primarily CSS-based.
- Empty states should be calm and low-noise, not dominant cards.
- Empty states must work in both view mode and edit mode.
- Mobile behavior should continue to collapse to one column through the existing responsive rules.
