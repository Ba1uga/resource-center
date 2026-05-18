import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const tableComponentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchTable.vue',
  import.meta.url,
)
const emptyStateComponentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchTableEmptyState.vue',
  import.meta.url,
)
const bulkBarComponentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchBulkBar.vue',
  import.meta.url,
)
const drawerHostComponentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchDrawerHost.vue',
  import.meta.url,
)
const modelUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/model/workbench-table.ts',
  import.meta.url,
)
const tableStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-table.css',
  import.meta.url,
)
const bulkStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-bulk-bar.css',
  import.meta.url,
)
const drawerStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-drawer-host.css',
  import.meta.url,
)

for (const fileUrl of [
  tableComponentUrl,
  emptyStateComponentUrl,
  bulkBarComponentUrl,
  drawerHostComponentUrl,
  modelUrl,
  tableStylesUrl,
  bulkStylesUrl,
  drawerStylesUrl,
]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const tableComponentContent = readFileSync(tableComponentUrl, 'utf8')
const emptyStateComponentContent = readFileSync(emptyStateComponentUrl, 'utf8')
const bulkBarComponentContent = readFileSync(bulkBarComponentUrl, 'utf8')
const drawerHostComponentContent = readFileSync(drawerHostComponentUrl, 'utf8')
const modelContent = readFileSync(modelUrl, 'utf8')
const tableStylesContent = readFileSync(tableStylesUrl, 'utf8')
const bulkStylesContent = readFileSync(bulkStylesUrl, 'utf8')
const drawerStylesContent = readFileSync(drawerStylesUrl, 'utf8')

assert.ok(modelContent.includes("export type WorkbenchDensity = 'comfortable' | 'compact'"))
assert.ok(modelContent.includes("export type WorkbenchMobileMode = 'auto' | 'table' | 'cards'"))
assert.ok(modelContent.includes("export type WorkbenchSelectionMode = 'page-only'"))
assert.ok(modelContent.includes('export interface WorkbenchTableColumn'))
assert.ok(modelContent.includes('mobileLabel?: string'))
assert.ok(modelContent.includes('hideOnMobile?: boolean'))
assert.ok(modelContent.includes('cellClassName?: string'))

assert.ok(tableComponentContent.includes("import '../styles/workbench-table.css'"))
assert.ok(tableComponentContent.includes("import WorkbenchTableEmptyState from './WorkbenchTableEmptyState.vue'"))
assert.ok(tableComponentContent.includes("selectionMode: 'page-only'"))
assert.ok(tableComponentContent.includes("event: 'row-click'"))
assert.ok(tableComponentContent.includes("event: 'toggle-row'"))
assert.ok(tableComponentContent.includes("event: 'toggle-all-visible'"))
assert.ok(tableComponentContent.includes('class="workbench-table"'))
assert.ok(tableComponentContent.includes('class="workbench-table__selection-column"'))
assert.ok(tableComponentContent.includes('class="workbench-table__mobile-cards"'))
assert.ok(tableComponentContent.includes('class="workbench-table__mobile-card"'))
assert.ok(tableComponentContent.includes('<slot :name="`cell-${column.key}`"'))
assert.ok(tableComponentContent.includes('<slot name="card"'))
assert.ok(tableComponentContent.includes('<WorkbenchTableEmptyState'))
assert.ok(tableComponentContent.includes('v-if="rows.length > 0 && !showMobileCards"'))
assert.ok(tableComponentContent.includes('v-else-if="rows.length > 0"'))
assert.ok(tableComponentContent.includes('@click="handleRowClick(row)"'))
assert.ok(tableComponentContent.includes('@keydown="handleRowKeydown($event, row)"'))
assert.ok(tableComponentContent.includes("if (!props.rowClickable)"))
assert.ok(tableComponentContent.includes("emit('toggle-all-visible')"))

assert.ok(emptyStateComponentContent.includes("import '../styles/workbench-table.css'"))
assert.ok(emptyStateComponentContent.includes('class="workbench-table__empty"'))
assert.ok(emptyStateComponentContent.includes("{{ title ?? '暂无数据' }}"))

assert.ok(bulkBarComponentContent.includes("import '../styles/workbench-bulk-bar.css'"))
assert.ok(bulkBarComponentContent.includes("event: 'clear'"))
assert.ok(bulkBarComponentContent.includes('class="workbench-bulk-bar"'))
assert.ok(bulkBarComponentContent.includes('class="workbench-bulk-bar__actions"'))
assert.ok(bulkBarComponentContent.includes('已选择当前页 {{ selectedCount }} 项'))

assert.ok(drawerHostComponentContent.includes("import '../styles/workbench-drawer-host.css'"))
assert.ok(drawerHostComponentContent.includes('<teleport to="body">'))
assert.ok(drawerHostComponentContent.includes("event: 'close'"))
assert.ok(drawerHostComponentContent.includes('class="workbench-drawer-host"'))
assert.ok(drawerHostComponentContent.includes('class="workbench-drawer-host__backdrop"'))
assert.ok(drawerHostComponentContent.includes('class="workbench-drawer-host__panel"'))
assert.ok(drawerHostComponentContent.includes('<slot name="header"'))
assert.ok(drawerHostComponentContent.includes('<slot name="footer"'))

assert.match(
  tableStylesContent,
  /\.workbench-table-shell\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\);[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  tableStylesContent,
  /\.workbench-table-shell\s*\{[\s\S]*?height:\s*100%;/i,
)
assert.match(
  tableStylesContent,
  /\.workbench-table-shell__scroll\s*\{[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*auto;/i,
)
assert.match(
  tableStylesContent,
  /\.workbench-table\s+thead\s+th,\s*[\s\S]*?\.workbench-table\s+tbody\s+td\s*\{[\s\S]*?padding:\s*18px 16px;/i,
)
assert.match(
  tableStylesContent,
  /\.workbench-table__mobile-cards\s*\{[\s\S]*?display:\s*grid;/i,
)
assert.match(
  bulkStylesContent,
  /\.workbench-bulk-bar\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;/i,
)
assert.match(
  drawerStylesContent,
  /\.workbench-drawer-host\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/i,
)
