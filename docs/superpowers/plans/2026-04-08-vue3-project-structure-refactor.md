# Vue3 企业化目录重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 将当前扁平的 Vue3 + Vite 项目重构为按需创建的企业级目录结构，完成 `app / views / features` 分层，同时保持现有页面行为不变。

**架构：** 采用轻量混合分层方案。`app` 负责应用启动与全局样式，`views` 负责页面级组合，`features/resource-center` 负责当前业务的数据模型、图标常量与类型定义。测试随结构迁移，并改为直接验证 TypeScript 源模块。

**技术栈：** Vue 3、Vite、TypeScript、Node 22、`vue-tsc`

---

## 文件结构与职责

### 新建文件

- `src/app/main.ts`
- `src/app/App.vue`
- `src/app/styles/index.css`
- `src/views/resource-center/ResourceCenterView.vue`
- `src/features/resource-center/constants/icons.ts`
- `src/features/resource-center/model/dashboard.ts`
- `src/features/resource-center/types/dashboard.ts`
- `tests/resource-center/dashboard-content.test.ts`

### 修改文件

- `index.html`
- `package.json`

### 删除文件

- `src/main.ts`
- `src/App.vue`
- `src/styles.css`
- `src/dashboard-content.js`
- `src/dashboard-content.d.ts`
- `tests/dashboard-content.test.mjs`

## 任务 1：先用测试固定新目录下的行为边界

**文件：**

- 创建：`tests/resource-center/dashboard-content.test.ts`
- 修改：`package.json`
- 测试：`tests/resource-center/dashboard-content.test.ts`

- [ ] **步骤 1：先写失败测试，约束新目录结构和模型导出**

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  createDashboardViewModel,
  createNavigationItems,
  resourceModules,
} from '../../src/features/resource-center/model/dashboard.ts'

const homeDashboard = createDashboardViewModel()
const overviewDashboard = createDashboardViewModel('resourceOverview')
const navigationItems = createNavigationItems()

assert.equal(homeDashboard.navigation.length, 8)
assert.equal(homeDashboard.navigation.find((item) => item.active)?.label, '杩斿洖棣栭〉')
assert.equal(navigationItems.at(0)?.label, '杩斿洖棣栭〉')
assert.equal(navigationItems.at(1)?.label, '璧勬簮鎬昏')
assert.equal(overviewDashboard.navigation.find((item) => item.active)?.label, '璧勬簮鎬昏')

const totalResources = resourceModules.reduce((sum, module) => sum + module.count, 0)

assert.equal(homeDashboard.summary.totalResources, totalResources)
assert.equal(homeDashboard.summary.topModule.label, '涔犻绠＄悊')
assert.match(homeDashboard.summary.coverageLabel, /鎸傝浇瀹屾垚鐜?/)

const rootApp = readFileSync(new URL('../../src/app/App.vue', import.meta.url), 'utf8')
const resourceCenterView = readFileSync(
  new URL('../../src/views/resource-center/ResourceCenterView.vue', import.meta.url),
  'utf8',
)

assert.ok(rootApp.includes('ResourceCenterView'))
assert.ok(resourceCenterView.includes('class=\"topbar topbar-shell\"'))
assert.ok(resourceCenterView.includes(\"activeSection === 'resourceOverview'\"))
assert.ok(!resourceCenterView.includes('鏁欏璧勬簮涓€绔欐€昏'))
```

- [ ] **步骤 2：执行测试，确认当前状态必然失败**

运行：

```bash
node --experimental-strip-types tests/resource-center/dashboard-content.test.ts
```

预期：

- 失败，原因应为 `src/features/resource-center/model/dashboard.ts`、`src/app/App.vue` 或 `src/views/resource-center/ResourceCenterView.vue` 尚不存在

- [ ] **步骤 3：把测试脚本切到 TypeScript 文件**

将 `package.json` 中的 `test` 改为：

```json
{
  "scripts": {
    "dev": "vite",
    "test": "node --experimental-strip-types tests/resource-center/dashboard-content.test.ts",
    "build": "run-p type-check \"build-only {@}\" --",
    "preview": "vite preview",
    "build-only": "vite build",
    "type-check": "vue-tsc --build"
  }
}
```

- [ ] **步骤 4：再次执行测试，确认仍然因实现缺失而失败，而不是因为命令不可用**

运行：

```bash
npm test
```

预期：

- 失败
- 失败原因仍为新目录实现文件缺失，而不是 `node --experimental-strip-types` 命令无效

- [ ] **步骤 5：本任务完成标准**

确认点：

- 测试文件已固定新的目录目标
- 测试命令已经切换到可直接执行 TypeScript 测试文件的方式

## 任务 2：迁移 feature 层，把 `dashboard-content` 改为真实 TypeScript 模块

**文件：**

- 创建：`src/features/resource-center/types/dashboard.ts`
- 创建：`src/features/resource-center/constants/icons.ts`
- 创建：`src/features/resource-center/model/dashboard.ts`
- 删除：`src/dashboard-content.js`
- 删除：`src/dashboard-content.d.ts`
- 测试：`tests/resource-center/dashboard-content.test.ts`

- [ ] **步骤 1：先写类型文件**

创建 `src/features/resource-center/types/dashboard.ts`：

```ts
export interface NavigationItem {
  key: string
  label: string
  icon: string
  active: boolean
}

export interface HomeHighlight {
  key: string
  label: string
  value: string
  detail: string
}

export interface MetricCard {
  key: string
  label: string
  value: number
  unit: string
  delta: string
  detail: string
  tone: string
}

export interface ResourceModule {
  key: string
  label: string
  count: number
  completion: number
  description: string
  accent: string
}

export interface ActivityItem {
  id: number
  actor: string
  initials: string
  accent: string
  action: string
  time: string
  note: string
}

export interface SuggestionItem {
  id: number
  level: string
  title: string
  description: string
  action: string
}

export interface QuickAction {
  key: string
  label: string
  caption: string
  icon: string
}

export interface DistributionSourceItem {
  label: string
  value: number
}

export interface DistributionItem extends DistributionSourceItem {
  ratio: number
}

export interface ChapterCoverageItem {
  chapter: string
  completion: number
  focus: string
}

export interface TeacherProfile {
  name: string
  role: string
  campus: string
}

export interface DashboardSummary {
  totalResources: number
  averageCoverage: number
  topModule: ResourceModule
  coverageLabel: string
}

export interface DashboardViewModel {
  navigation: NavigationItem[]
  metrics: MetricCard[]
  modules: ResourceModule[]
  activities: ActivityItem[]
  suggestions: SuggestionItem[]
  actions: QuickAction[]
  distribution: DistributionItem[]
  chapters: ChapterCoverageItem[]
  profile: TeacherProfile
  homeHighlights: HomeHighlight[]
  activeNavigation?: NavigationItem
  summary: DashboardSummary
}
```

- [ ] **步骤 2：提取图标常量**

创建 `src/features/resource-center/constants/icons.ts`：

```ts
export const iconPaths: Record<string, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
  dashboard: 'M4 4h7v7H4zm9 0h7v5h-7zM4 13h7v7H4zm9 7v-9h7v9z',
  tree: 'M12 3v5m0 0a3 3 0 1 0 0 6m0-6a3 3 0 1 1 0 6m0 0v7m-6-4h12',
  book: 'M6 5.5A2.5 2.5 0 0 1 8.5 3H19v16H8.5A2.5 2.5 0 0 0 6 21zM6 5.5V21H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z',
  layers: 'M12 4 4 8l8 4 8-4zm-8 8 8 4 8-4m-16 4 8 4 8-4',
  play: 'M8 6.5v11l9-5.5z',
  clipboard:
    'M9 4.5A2.5 2.5 0 0 1 11.5 2h1A2.5 2.5 0 0 1 15 4.5H18A2 2 0 0 1 20 6.5v13A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-13A2 2 0 0 1 6 4.5zM8 9h8m-8 4h8m-8 4h5',
  link: 'M10.5 13.5 13.5 10.5m-5.5 7.5H6.75a3.75 3.75 0 0 1 0-7.5H10m4 0h3.25a3.75 3.75 0 0 1 0 7.5H14',
  mail: 'M4 7.5h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 0 8 6 8-6',
  bell: 'M12 3a4 4 0 0 1 4 4v1.35c0 .78.23 1.54.66 2.19L18 12.5v1.5H6v-1.5l1.34-1.96A4 4 0 0 0 8 8.35V7a4 4 0 0 1 4-4zm0 18a3 3 0 0 1-2.82-2h5.64A3 3 0 0 1 12 21z',
  spark: 'M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  radar: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M12 12l4-4M12 7.5a4.5 4.5 0 1 0 4.5 4.5',
  arrowUp: 'M12 19V7m0 0-5 5m5-5 5 5',
  arrowTrend: 'm6 14 4-4 3 3 5-6',
}
```

- [ ] **步骤 3：迁移并类型化 dashboard 模型**

创建 `src/features/resource-center/model/dashboard.ts`，导入：

```ts
import type {
  ActivityItem,
  ChapterCoverageItem,
  DashboardSummary,
  DashboardViewModel,
  DistributionSourceItem,
  HomeHighlight,
  MetricCard,
  NavigationItem,
  QuickAction,
  ResourceModule,
  SuggestionItem,
  TeacherProfile,
} from '@/features/resource-center/types/dashboard'
```

然后把当前 `src/dashboard-content.js` 的数据和导出原样迁移为带类型的 TypeScript 实现，最少要包含以下导出名不变：

```ts
export function createNavigationItems(activeKey = 'home'): NavigationItem[] { /* ... */ }

export const navigationItems: NavigationItem[] = createNavigationItems()
export const heroMetrics: MetricCard[] = [/* ... */]
export const resourceModules: ResourceModule[] = [/* ... */]
export const recentActivities: ActivityItem[] = [/* ... */]
export const aiSuggestions: SuggestionItem[] = [/* ... */]
export const quickActions: QuickAction[] = [/* ... */]
export const resourceDistribution: DistributionSourceItem[] = [/* ... */]
export const chapterCoverage: ChapterCoverageItem[] = [/* ... */]
export const teacherProfile: TeacherProfile = { /* ... */ }
export const homeHighlights: HomeHighlight[] = [/* ... */]

export function summarizeResourceModules(modules: ResourceModule[]): DashboardSummary {
  const totalResources = modules.reduce((sum, module) => sum + module.count, 0)
  const averageCoverage = Math.round(
    modules.reduce((sum, module) => sum + module.completion, 0) / modules.length,
  )
  const topModule = [...modules].sort((left, right) => right.count - left.count)[0]

  return {
    totalResources,
    averageCoverage,
    topModule,
    coverageLabel: `鎸傝浇瀹屾垚鐜?${averageCoverage}%`,
  }
}

export function createDashboardViewModel(activeKey = 'home'): DashboardViewModel {
  const summary = summarizeResourceModules(resourceModules)
  const distributionMax = Math.max(...resourceDistribution.map((item) => item.value))
  const activeNavigation = createNavigationItems(activeKey).find((item) => item.active)

  return {
    navigation: createNavigationItems(activeKey),
    metrics: heroMetrics,
    modules: resourceModules,
    activities: recentActivities,
    suggestions: aiSuggestions,
    actions: quickActions,
    distribution: resourceDistribution.map((item) => ({
      ...item,
      ratio: Math.round((item.value / distributionMax) * 100),
    })),
    chapters: chapterCoverage,
    profile: teacherProfile,
    homeHighlights,
    activeNavigation,
    summary,
  }
}
```

- [ ] **步骤 4：执行测试，确认 feature 层导出恢复**

运行：

```bash
npm test
```

预期：

- 仍然失败
- 失败原因收敛到 `src/app/App.vue` 或 `src/views/resource-center/ResourceCenterView.vue` 尚不存在

- [ ] **步骤 5：删除旧的 dashboard 源文件**

删除：

```text
src/dashboard-content.js
src/dashboard-content.d.ts
```

- [ ] **步骤 6：本任务完成标准**

确认点：

- 业务模型已进入 `features/resource-center/model`
- 类型定义已从 `.d.ts` 独立声明迁移为真实 TypeScript 源码
- 图标常量不再内嵌在页面组件里

## 任务 3：拆分 app 与 view 层，迁移页面和启动入口

**文件：**

- 创建：`src/views/resource-center/ResourceCenterView.vue`
- 创建：`src/app/App.vue`
- 创建：`src/app/main.ts`
- 修改：`index.html`
- 删除：`src/App.vue`
- 删除：`src/main.ts`
- 测试：`tests/resource-center/dashboard-content.test.ts`

- [ ] **步骤 1：创建页面视图组件**

创建 `src/views/resource-center/ResourceCenterView.vue`，脚本部分使用：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

import { iconPaths } from '@/features/resource-center/constants/icons'
import { createDashboardViewModel } from '@/features/resource-center/model/dashboard'

const activeSection = ref('home')
const dashboard = computed(() => createDashboardViewModel(activeSection.value))
</script>
```

模板部分处理规则：

- 将当前 `src/App.vue` 的 `<template>` 内容完整迁移到该文件
- 只做两类替换：
  - 视图模型导入改为 `@/features/resource-center/model/dashboard`
  - `iconPaths` 改为来自 `@/features/resource-center/constants/icons`

- [ ] **步骤 2：创建真正的根组件**

创建 `src/app/App.vue`：

```vue
<script setup lang="ts">
import ResourceCenterView from '@/views/resource-center/ResourceCenterView.vue'
</script>

<template>
  <ResourceCenterView />
</template>
```

- [ ] **步骤 3：创建新的应用入口**

创建 `src/app/main.ts`：

```ts
import { createApp } from 'vue'

import App from '@/app/App.vue'
import '@/app/styles/index.css'

createApp(App).mount('#app')
```

- [ ] **步骤 4：调整 HTML 入口到新路径**

修改 `index.html`：

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/app/main.ts"></script>
  </body>
</html>
```

- [ ] **步骤 5：执行测试，确认 app/view 分层已跑通**

运行：

```bash
npm test
```

预期：

- 通过

- [ ] **步骤 6：删除旧入口文件**

删除：

```text
src/App.vue
src/main.ts
```

- [ ] **步骤 7：本任务完成标准**

确认点：

- 根组件只负责渲染页面视图
- 页面级状态从根组件中拆出
- `index.html` 已指向新的 app 入口

## 任务 4：迁移全局样式并完成最终验证

**文件：**

- 创建：`src/app/styles/index.css`
- 删除：`src/styles.css`
- 删除：`tests/dashboard-content.test.mjs`
- 验证：`npm test`、`npm run type-check`、`npm run build-only`

- [ ] **步骤 1：迁移全局样式文件**

创建 `src/app/styles/index.css`：

- 将当前 `src/styles.css` 内容完整迁移到该文件
- 不改类名、不改变量名、不改选择器层级

- [ ] **步骤 2：移除旧样式与旧测试文件**

删除：

```text
src/styles.css
tests/dashboard-content.test.mjs
```

- [ ] **步骤 3：跑测试验证行为**

运行：

```bash
npm test
```

预期：

- 通过
- 无 `ERR_MODULE_NOT_FOUND`
- 无模板路径断言失败

- [ ] **步骤 4：跑类型检查**

运行：

```bash
npm run type-check
```

预期：

- 通过
- 无路径别名错误
- 无 `.vue` 类型错误

- [ ] **步骤 5：跑构建验证**

运行：

```bash
npm run build-only
```

预期：

- 通过
- Vite 正常输出打包产物

- [ ] **步骤 6：人工检查最终目录**

目标结构应为：

```text
src/
  app/
    App.vue
    main.ts
    styles/
      index.css
  views/
    resource-center/
      ResourceCenterView.vue
  features/
    resource-center/
      constants/
        icons.ts
      model/
        dashboard.ts
      types/
        dashboard.ts
tests/
  resource-center/
    dashboard-content.test.ts
```

- [ ] **步骤 7：本任务完成标准**

确认点：

- `src` 下不再存在旧的扁平入口文件
- 所有现有业务代码都归位到 `app / views / features`
- 测试、类型检查、构建都通过

## 自检结果

### 需求覆盖

- 企业级目录分层：已覆盖
- 只创建当前项目需要的层级：已覆盖
- 将现有 `dashboard-content.js` 改为 TypeScript：已覆盖
- 统一别名导入：已覆盖
- 不提交 git：本计划不包含提交步骤

### 占位符检查

- 未使用 `TODO`、`TBD` 或“后续再补”式描述
- 每个任务都给出了明确的文件路径、命令和完成标准

### 一致性检查

- 入口路径统一为 `src/app/main.ts`
- 页面路径统一为 `src/views/resource-center/ResourceCenterView.vue`
- 模型路径统一为 `src/features/resource-center/model/dashboard.ts`
- 测试路径统一为 `tests/resource-center/dashboard-content.test.ts`

## 执行方式

计划已保存到 `docs/superpowers/plans/2026-04-08-vue3-project-structure-refactor.md`。两种执行方式：

1. 子代理分任务执行，逐任务审查
2. 我在当前会话直接按计划落地实现

如果你不需要再看计划，我建议直接选第 2 种。*** End Patch
