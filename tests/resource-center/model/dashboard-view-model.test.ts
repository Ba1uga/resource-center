import assert from 'node:assert/strict'

import { createDashboardViewModel } from '../../../src/features/resource-center/dashboard/model/dashboard.view-model.ts'

const overview = createDashboardViewModel('resourceOverview')
const placeholder = createDashboardViewModel('outline')

assert.equal(overview.navigation.find((item) => item.active)?.key, 'resourceOverview')
assert.equal(placeholder.navigation.find((item) => item.active)?.key, 'outline')
assert.equal(overview.summary.topModule.key, 'question')
assert.equal(overview.distribution.every((item) => item.ratio > 0), true)
assert.equal('profile' in overview, false)
