import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  resourceCenterSectionRouteName,
  resolveWorkbenchSectionFromRouteParam,
  toResourceCenterSectionRoute,
} from '../../../src/features/resource-center/navigation/model/navigation.routes.ts'
import { workbenchSectionKeys } from '../../../src/features/resource-center/workbench/shared/model/workbench.registry.ts'

const routerFilePath = path.resolve(import.meta.dirname, '../../../src/app/router.ts')

assert.equal(fs.existsSync(routerFilePath), true, 'router.ts should exist')

const routerSource = fs.readFileSync(routerFilePath, 'utf8')

assert.match(routerSource, /\bcreateRouter\b/)
assert.match(routerSource, /\bcreateWebHistory\b/)
assert.match(routerSource, /path:\s*'\/'/)
assert.match(routerSource, /redirect:\s*'\/resource-center\/outline'/)
assert.match(routerSource, /path:\s*'\/resource-center\/:section'/)
assert.match(routerSource, /name:\s*resourceCenterSectionRouteName/)

assert.equal(resourceCenterSectionRouteName, 'resource-center-section')
assert.deepEqual(workbenchSectionKeys, [
  'outline',
  'textbook',
  'courseware',
  'video',
  'question',
  'mapping',
])
assert.equal(resolveWorkbenchSectionFromRouteParam('outline'), 'outline')
assert.equal(resolveWorkbenchSectionFromRouteParam('mapping'), 'mapping')
assert.equal(resolveWorkbenchSectionFromRouteParam('missing'), 'outline')
assert.deepEqual(toResourceCenterSectionRoute('video'), {
  name: 'resource-center-section',
  params: { section: 'video' },
})
