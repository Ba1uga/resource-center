import assert from 'node:assert/strict'

import { createNavigationItems } from '../../../../src/features/resource-center/navigation/model/navigation.config.ts'
import {
  resolveWorkbenchSectionMeta,
  workbenchSectionByKey,
  workbenchSectionKeys,
} from '../../../../src/features/resource-center/workbench/shared/model/workbench.registry.ts'

assert.equal(workbenchSectionKeys.length, 6)

for (const key of workbenchSectionKeys) {
  const meta = resolveWorkbenchSectionMeta(key)
  assert.equal(meta.key, key)
  assert.equal(meta.icon, workbenchSectionByKey[key].icon)
  assert.ok(meta.navigationLabel.length > 0)
  assert.ok(meta.title.length > 0)
  assert.ok(meta.description.length > 0)
}

const fallback = resolveWorkbenchSectionMeta('not-a-real-section')
assert.equal(fallback.key, 'outline')

const navigation = createNavigationItems('outline')
const navigationWorkbenchKeys = navigation.filter((item) => !item.isExternalEntry).map((item) => item.key)
assert.deepEqual(navigationWorkbenchKeys, [...workbenchSectionKeys])
