import assert from 'node:assert/strict'

import { resourceModules } from '../../../src/features/resource-center/dashboard/model/dashboard.fixtures.ts'
import { summarizeResourceModules } from '../../../src/features/resource-center/dashboard/model/dashboard.selectors.ts'

const summary = summarizeResourceModules(resourceModules)

assert.equal(summary.totalResources, resourceModules.reduce((sum, item) => sum + item.count, 0))
assert.equal(summary.topModule.key, 'question')
assert.equal(summary.averageCoverage, 84)
assert.equal(summary.coverageLabel, '挂载完成率 84%')
