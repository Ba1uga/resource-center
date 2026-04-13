# Resource Center Sidebar Redesign

**Date:** 2026-04-08
**Project:** `resource-center`
**Status:** Approved in conversation, pending file review

---

## Goal

Redesign the resource center sidebar so it more closely matches the provided reference image: calm, professional, minimal, and office-like. The sidebar should primarily help teachers switch modules quickly while also providing a very light reminder when a module contains unsaved work.

## Current State

The existing sidebar already supports module switching, but its visual language is heavier than the target direction:

- The sidebar uses a stronger card feel, larger gradients, and more visible component containers.
- Navigation items feel more like soft cards than flat office-style list entries.
- The brand block is more prominent than the reference.
- A footer progress card occupies the lower area, which reduces the long clean whitespace that defines the reference.
- The active state is stronger and broader than the reference, which instead uses a restrained left-side accent.

Functionally, the current sidebar works, but visually it does not yet communicate the quiet, restrained, teacher-facing workspace the user wants.

## Design Context

- Primary audience: teachers
- Primary job: quickly switch between resource modules
- Secondary job: lightly notice modules with pending unsaved changes
- Desired tone: calm, professional, minimal, office-like
- Reference alignment: high visual similarity is preferred over preserving the current decorative sidebar style

## Design Principles

- Prioritize fast module scanning over decorative styling.
- Match the reference image through restraint, not embellishment.
- Keep the sidebar visually quiet so the main content remains the focus.
- Use status signaling sparingly and only for meaningful unsaved work.
- Remove secondary information blocks that compete with navigation clarity.

## Recommended Design

### Overall Visual Direction

The sidebar will shift to a soft white-fog panel with a lighter, flatter office-product feel. It should feel more like a refined navigation rail than a stack of cards.

Key visual traits:

- Narrower-feeling vertical rhythm
- Softer panel treatment with reduced visual noise
- Much lighter group headings
- Long intentional whitespace in the lower half
- Minimal active-state treatment
- Very restrained status indicators

### Brand Area

The brand area will be simplified into a lighter one-line header treatment:

- Keep a compact logo mark and title
- Reduce the visual weight of the current brand block
- Avoid oversized gradients or strong decorative emphasis
- Keep the brand present, but secondary to navigation

This area should feel like a quiet product identifier, not a hero block.

### Navigation Structure

The sidebar remains primarily a module-switching surface. The navigation list should stay near the top and read as a clean vertical menu.

Approved structure:

- Keep the main module group at the top
- Remove the bottom help/general group from the design
- Remove or fully de-emphasize the current footer progress card
- Preserve the large lower whitespace after the main list

This is important because the reference image gets much of its tone from empty space and disciplined grouping.

### Navigation Item Styling

Navigation items should become flatter, slimmer, and less card-like.

Default state:

- Use muted gray-blue text
- Use light linear icon styling
- Avoid strong filled backgrounds
- Keep padding clean and controlled rather than pill-heavy

Active state:

- Use darker text and icon color
- Do not add a large filled background block
- Use a short dark vertical accent on the far left
- The accent should remain a single capsule-like bar, not two separate bars

To capture the layered feeling the user asked about while staying faithful to the reference, the active accent should use one primary dark bar with subtle depth from shadow or edge contrast rather than a literal double-line indicator.

### Unsaved State Indicator

The sidebar should support a very light reminder for modules with unsaved work.

Approved behavior:

- Show only a very small dot on the right side of a navigation item
- The dot means "there are unsaved changes in this module"
- Do not show numbers
- Do not show text labels for status
- Do not render placeholder status space for clean items

This keeps the interface quiet while still helping teachers avoid losing work.

### Information Hierarchy

The visual hierarchy should be:

1. Active module
2. Module labels
3. Unsaved dots
4. Group heading
5. Brand

This ordering keeps the sidebar optimized for wayfinding rather than decoration or dashboard-like messaging.

## Responsive Behavior

Desktop should be the highest-fidelity version of the approved design.

On narrower widths:

- Preserve the same visual language
- Compress spacing carefully rather than changing the concept
- Keep icons, labels, active bar, and unsaved dot behavior consistent
- Avoid oversized empty areas that make the sidebar feel awkward on small screens
- Maintain comfortable tap targets even if spacing becomes tighter

The design should adapt proportionally, not switch to a different style system.

## Explicit Non-Goals

This redesign does not include:

- Changing the sidebar's core navigation order unless required for the new grouping
- Adding numeric badges for activity or tasks
- Adding a second footer navigation group
- Adding large task cards back into the sidebar
- Turning the sidebar into a dense data-summary panel
- Redesigning the main content area to match the reference at this stage

## Risks And Mitigations

- Risk: The sidebar becomes so minimal that state cues disappear
  Mitigation: Keep the active bar clearly visible and allow the unsaved dot only where needed

- Risk: Removing the footer card makes the left side feel too empty
  Mitigation: Preserve a compact brand area and disciplined spacing so the emptiness feels intentional rather than unfinished

- Risk: A literal double-line active marker drifts away from the reference
  Mitigation: Use one primary dark bar with subtle depth instead of two separate visible bars

- Risk: Unsaved indicators compete with active state
  Mitigation: Keep the dot smaller and visually lighter than the active marker

## Acceptance Criteria

The redesign is complete when all of the following are true:

- The sidebar clearly resembles the provided reference in overall tone and restraint
- The current active module is primarily indicated by a short dark left-side accent and darker text
- The bottom help/general section is removed
- The old footer progress card is removed or visually eliminated from the sidebar
- Unsaved state is represented only by a small right-side dot
- Navigation remains optimized for fast teacher module switching
- The desktop version feels calm, professional, and minimal rather than decorative

## Implementation Summary

The approved direction is a high-reference, minimalist sidebar redesign for teachers:

- calm white office-style panel
- lighter one-line brand treatment
- flatter navigation items
- single dark active accent with subtle depth
- no footer help/general section
- no progress card
- tiny unsaved-state dot as the only secondary cue

This design intentionally trades decorative richness for clarity, calmness, and stronger alignment with the provided reference image.
