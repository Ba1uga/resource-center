import assert from 'node:assert/strict'

import { createNavigationItems } from '../../../src/features/resource-center/navigation/model/navigation.config.ts'

const items = createNavigationItems('resourceOverview')

assert.equal(items.length, 8)
assert.equal(items.at(0)?.key, 'home')
assert.equal(items.at(1)?.key, 'resourceOverview')
assert.equal(items.find((item) => item.active)?.key, 'resourceOverview')
assert.equal(items.at(0)?.isExternalEntry, true)
assert.equal(items.at(1)?.isExternalEntry, false)
assert.equal(items.find((item) => item.key === 'courseware')?.hasUnsavedChanges, true)
assert.equal(
  items.filter((item) => item.key !== 'courseware').every((item) => !item.hasUnsavedChanges),
  true,
)
