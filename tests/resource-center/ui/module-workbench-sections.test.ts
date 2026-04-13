import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  resolveWorkbenchSectionMeta,
  workbenchSectionByKey,
  workbenchSectionKeys,
} from '../../../src/features/resource-center/workbench/model/workbench.registry.ts'

const genericSection = readFileSync(
  new URL('../../../src/views/resource-center/sections/WorkbenchSection.vue', import.meta.url),
  'utf8',
)

assert.equal(workbenchSectionKeys.length, 6)
for (const key of workbenchSectionKeys) {
  const meta = resolveWorkbenchSectionMeta(key)
  assert.equal(meta.key, key)
  assert.equal(meta.navigationLabel, workbenchSectionByKey[key].navigationLabel)
  assert.ok(meta.title.length > 0)
  assert.ok(meta.description.length > 0)
  assert.ok(meta.placeholderTitle.length > 0)
  assert.ok(meta.placeholderDescription.length > 0)
}

assert.ok(genericSection.includes("import ModuleWorkbenchShell from './ModuleWorkbenchShell.vue'"))
assert.ok(genericSection.includes("import type { WorkbenchSectionMeta }"))
assert.ok(genericSection.includes(':kicker="section.kicker"'))
assert.ok(genericSection.includes(':title="section.title"'))
assert.ok(genericSection.includes(':description="section.description"'))
assert.ok(genericSection.includes(':status="section.status"'))
assert.ok(genericSection.includes('{{ section.placeholderTitle }}'))
assert.ok(genericSection.includes('{{ section.placeholderDescription }}'))
