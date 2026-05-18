import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchDataView.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-data-view.css',
  import.meta.url,
)

assert.equal(existsSync(componentUrl), true, 'WorkbenchDataView.vue must exist')
assert.equal(existsSync(stylesUrl), true, 'workbench-data-view.css must exist')

const componentContent = readFileSync(componentUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

assert.ok(componentContent.includes("import '../styles/workbench-data-view.css'"))
assert.ok(componentContent.includes("density?: 'comfortable' | 'compact'"))
assert.ok(componentContent.includes("mobileMode?: 'auto' | 'table' | 'cards'"))
assert.ok(componentContent.includes('selectedCount?: number'))
assert.ok(componentContent.includes('class="workbench-data-view workbench-surface"'))
assert.ok(componentContent.includes('class="workbench-data-view__controls"'))
assert.ok(componentContent.includes('class="workbench-data-view__body"'))
assert.ok(componentContent.includes('class="workbench-data-view__table-frame"'))
assert.ok(componentContent.includes('class="workbench-data-view__bulk"'))
assert.ok(componentContent.includes('class="workbench-data-view__table"'))
assert.ok(componentContent.includes('class="workbench-data-view__pagination"'))
assert.ok(componentContent.includes('<slot name="summary"'))
assert.ok(componentContent.includes('<slot name="feedback"'))
assert.ok(componentContent.includes('<slot name="toolbar"'))
assert.ok(componentContent.includes('<slot name="bulk"'))
assert.ok(componentContent.includes('<slot name="table"'))
assert.ok(componentContent.includes('<slot name="pagination"'))
assert.ok(componentContent.includes('<slot name="drawer"'))
assert.ok(componentContent.includes('v-if="$slots.bulk && selectedCount > 0"'))
assert.ok(componentContent.includes("'is-compact': density === 'compact'"))
assert.ok(componentContent.includes("'is-loading': loading"))

assert.match(
  stylesContent,
  /@import ['"]\.\/workbench-surface\.css['"];/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*?gap:\s*16px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__controls\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*16px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__body\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;[\s\S]*?min-height:\s*0;/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__table-frame\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto;[\s\S]*?border:\s*1px solid var\(--workbench-table-line/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__table-frame\s*\{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__table\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\);[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__pagination\s*\{[\s\S]*?min-width:\s*0;/i,
)
assert.match(
  stylesContent,
  /\.workbench-data-view__table\s*>\s*\*\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?height:\s*100%;/i,
)
