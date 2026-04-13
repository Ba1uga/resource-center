import assert from 'node:assert/strict'

import { createNavigationItems } from '../../../src/features/resource-center/navigation/model/navigation.config.ts'
import { workbenchSectionKeys } from '../../../src/features/resource-center/workbench/shared/model/workbench.registry.ts'

const items = createNavigationItems('outline')

assert.equal(items.length, 7)
assert.equal(items.at(0)?.key, 'home')
assert.equal(items.at(1)?.key, 'outline')
assert.equal(items.find((item) => item.active)?.key, 'outline')
assert.equal(items.at(0)?.isExternalEntry, true)
assert.equal(items.at(1)?.isExternalEntry, false)
assert.equal(items.find((item) => item.key === 'courseware')?.hasUnsavedChanges, false)
assert.equal(
  items.every((item) => !item.hasUnsavedChanges),
  true,
)
assert.deepEqual(
  items.filter((item) => !item.isExternalEntry).map((item) => item.key),
  [...workbenchSectionKeys],
)
