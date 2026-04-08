import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  createDashboardViewModel,
  createNavigationItems,
  resourceModules,
} from '../src/dashboard-content.js'

const homeDashboard = createDashboardViewModel()
const overviewDashboard = createDashboardViewModel('resourceOverview')
const navigationItems = createNavigationItems()

assert.equal(homeDashboard.navigation.length, 8)
assert.equal(homeDashboard.navigation.find((item) => item.active)?.label, '返回首页')
assert.equal(navigationItems.at(0)?.label, '返回首页')
assert.equal(navigationItems.at(1)?.label, '资源总览')
assert.equal(overviewDashboard.navigation.find((item) => item.active)?.label, '资源总览')

const totalResources = resourceModules.reduce((sum, module) => sum + module.count, 0)

assert.equal(homeDashboard.summary.totalResources, totalResources)
assert.equal(homeDashboard.summary.topModule.label, '习题管理')
assert.match(homeDashboard.summary.coverageLabel, /挂载完成率/)

const appTemplate = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')

assert.ok(appTemplate.includes('class="topbar topbar-shell"'))
assert.ok(appTemplate.includes("activeSection === 'resourceOverview'"))
assert.ok(!appTemplate.includes('教学资源一站总览'))
assert.ok(
  !appTemplate.includes(
    '围绕教师备课与资源挂载建立统一入口，让知识结构、资源状态和 AI 建议同屏可见。',
  ),
)
