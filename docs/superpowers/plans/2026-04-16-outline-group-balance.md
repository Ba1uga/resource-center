# Outline Group Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep outline goal/material pairs in two desktop columns without equal-height stretching, while showing clear empty states for missing content.

**Architecture:** The change stays inside the existing outline workbench. Static tests lock the expected template and CSS hooks first, then the Vue template adds per-group empty states, and the stylesheet removes grid stretching while styling the new placeholders.

**Tech Stack:** Vue 3 SFC, TypeScript, CSS, Node-based static tests

---

### Task 1: Lock the Layout Behavior in Tests

**Files:**
- Modify: `tests/resource-center/workbench/outline/outline-workbench-section.test.ts`
- Test: `tests/resource-center/workbench/outline/outline-workbench-section.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
assert.ok(normalizedOutlineSection.includes('v-if="draft.sections.knowledgeGoals.length === 0" class="outline-group-empty-state"'))
assert.ok(normalizedOutlineSection.includes('v-if="draft.sections.materials.primary.length === 0" class="outline-group-empty-state"'))
assert.match(outlineStyles, /\.outline-goals-grid,[\s\S]*?align-items:\s*start;/i)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c "cd /d d:\AAA_Mine\Vue3\resource-center && node --experimental-strip-types tests/resource-center/workbench/outline/outline-workbench-section.test.ts"`
Expected: FAIL because the empty-state markup and non-stretch grid rules do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```vue
<p v-if="draft.sections.knowledgeGoals.length === 0" class="outline-group-empty-state">
  暂未添加知识目标
</p>
```

```css
.outline-goals-grid,
.outline-materials-grid {
  align-items: start;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cmd /c "cd /d d:\AAA_Mine\Vue3\resource-center && node --experimental-strip-types tests/resource-center/workbench/outline/outline-workbench-section.test.ts"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/resource-center/workbench/outline/outline-workbench-section.test.ts src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue src/features/resource-center/workbench/outline/styles/outline-workbench.css
git commit -m "fix: balance outline paired group layout"
```

### Task 2: Apply Empty States and Non-Stretch Layout

**Files:**
- Modify: `src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue`
- Modify: `src/features/resource-center/workbench/outline/styles/outline-workbench.css`
- Test: `tests/resource-center/workbench/outline/outline-workbench-section.test.ts`

- [ ] **Step 1: Add empty-state placeholders to each paired group**

```vue
<p v-if="draft.sections.abilityGoals.length === 0" class="outline-group-empty-state">
  暂未添加能力目标
</p>
```

```vue
<p v-if="draft.sections.materials.references.length === 0" class="outline-group-empty-state">
  暂未添加参考资料
</p>
```

- [ ] **Step 2: Update the group layout styles**

```css
.outline-goal-group,
.outline-material-group {
  align-content: start;
}

.outline-group-empty-state {
  margin: 0;
  padding: 18px 16px;
  border: 1px dashed var(--outline-line);
  border-radius: 16px;
  background: var(--outline-surface-soft);
  color: var(--outline-soft);
}
```

- [ ] **Step 3: Run focused verification**

Run: `cmd /c "cd /d d:\AAA_Mine\Vue3\resource-center && node --experimental-strip-types tests/resource-center/workbench/outline/outline-workbench-section.test.ts"`
Expected: PASS

- [ ] **Step 4: Run full verification**

Run: `cmd /c "cd /d d:\AAA_Mine\Vue3\resource-center && npm test"`
Expected: PASS

Run: `cmd /c "cd /d d:\AAA_Mine\Vue3\resource-center && npm run type-check"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-04-16-outline-group-balance-design.md docs/superpowers/plans/2026-04-16-outline-group-balance.md tests/resource-center/workbench/outline/outline-workbench-section.test.ts src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue src/features/resource-center/workbench/outline/styles/outline-workbench.css
git commit -m "fix: balance outline paired group layout"
```
