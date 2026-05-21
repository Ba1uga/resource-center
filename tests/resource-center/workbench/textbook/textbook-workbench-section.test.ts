import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const sectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/textbook/ui/TextbookWorkbenchSection.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/textbook/styles/textbook-workbench.css',
  import.meta.url,
)
const statusPillStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-status-pill.css',
  import.meta.url,
)

assert.equal(existsSync(sectionUrl), true, 'TextbookWorkbenchSection.vue must exist')
assert.equal(existsSync(stylesUrl), true, 'textbook-workbench.css must exist')

const sectionContent = readFileSync(sectionUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')
const statusPillStyles = readFileSync(statusPillStylesUrl, 'utf8')

assert.ok(sectionContent.includes("import '../styles/textbook-workbench.css'"))
assert.ok(sectionContent.includes("import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'"))
assert.ok(sectionContent.includes("import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'"))
assert.ok(sectionContent.includes("import WorkbenchBulkBar from '../../shared/ui/WorkbenchBulkBar.vue'"))
assert.ok(sectionContent.includes("import WorkbenchFormDrawer from '../../shared/ui/WorkbenchFormDrawer.vue'"))
assert.ok(
  sectionContent.includes(
    "import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'",
  ),
)
assert.ok(sectionContent.includes("import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'"))
assert.ok(sectionContent.includes('defineProps<{'))
assert.ok(sectionContent.includes('section: WorkbenchSectionMeta'))
assert.ok(sectionContent.includes('const currentAdminId ='))
assert.ok(sectionContent.includes('const statusPillRef = ref'))
assert.ok(sectionContent.includes('const selectedIds = ref<string[]>([])'))
assert.ok(sectionContent.includes('const visibleIds = computed(() => pageRows.value.map((row) => row.id))'))
assert.ok(sectionContent.includes('const allVisibleSelected = computed('))
assert.ok(sectionContent.includes('function toggleRowSelection('))
assert.ok(sectionContent.includes('function toggleVisibleSelection('))
assert.ok(sectionContent.includes('async function handleBulkDelete()'))
assert.ok(sectionContent.includes('textbook-management'))
assert.equal(sectionContent.includes('管理员可管理全部教材'), false)
assert.ok(sectionContent.includes('WorkbenchStatusPill'))
assert.ok(sectionContent.includes('label="连接异常"'))
assert.ok(sectionContent.includes('message="后端连接失败，当前显示本地教材样例。"'))
assert.ok(sectionContent.includes('<WorkbenchSelect'))
assert.ok(sectionContent.includes('后端连接失败'))
assert.ok(sectionContent.includes('当前显示本地教材样例'))
const normalizedSectionContent = sectionContent.replace(/\s+/g, ' ')
assert.ok(sectionContent.includes('<WorkbenchDataView class="textbook-management"'))
assert.ok(sectionContent.includes('<template #summary>'))
assert.ok(sectionContent.includes('<template #toolbar>'))
assert.ok(sectionContent.includes('<template #bulk>'))
assert.ok(sectionContent.includes('<template #table>'))
assert.ok(sectionContent.includes('<template #pagination>'))
assert.ok(sectionContent.includes('<template #drawer>'))
assert.ok(normalizedSectionContent.includes('<section class="textbook-management__toolbar">'))
assert.ok(normalizedSectionContent.indexOf('textbook-management__search-field') < normalizedSectionContent.indexOf('textbook-management__select-field'))
assert.ok(normalizedSectionContent.indexOf('textbook-management__select-field') < normalizedSectionContent.indexOf('textbook-management__reset-button'))
assert.ok(normalizedSectionContent.indexOf('textbook-management__reset-button') < normalizedSectionContent.indexOf('textbook-management__create-button'))
assert.ok(sectionContent.includes('placeholder="搜索教材名称或作者..."'))
assert.ok(sectionContent.includes('新建教材'))
assert.ok(sectionContent.includes('教材名称'))
assert.ok(sectionContent.includes('作者'))
assert.ok(sectionContent.includes('出版社'))
assert.ok(sectionContent.includes('版本'))
assert.ok(sectionContent.includes('ISBN'))
assert.ok(sectionContent.includes('关联课程'))
assert.ok(sectionContent.includes('操作'))
assert.ok(sectionContent.includes('<WorkbenchTable'))
assert.ok(sectionContent.includes('<WorkbenchBulkBar'))
assert.ok(sectionContent.includes('<WorkbenchTablePagination'))
assert.ok(sectionContent.includes(':page-size="pageSize"'))
assert.ok(sectionContent.includes(':page-size-options="pageSizeOptions"'))
assert.ok(sectionContent.includes('openCreateDrawer'))
assert.ok(sectionContent.includes('openEditDrawer'))
assert.ok(sectionContent.includes('deleteRow'))
assert.ok(sectionContent.includes('saveDrawer'))
assert.ok(sectionContent.includes('批量删除'))
assert.ok(sectionContent.includes('class="textbook-management__loading-state"'))
assert.ok(sectionContent.includes('class="textbook-management__loading-icon"'))
assert.ok(sectionContent.includes('正在加载教材数据...'))
assert.ok(sectionContent.includes('正在尝试连接后端服务，请稍候。'))
assert.ok(sectionContent.includes('class="workbench-drawer-form__field"'))
assert.ok(sectionContent.includes('class="workbench-drawer-form__field-label"'))
assert.ok(sectionContent.includes('class="workbench-drawer-form__field-input"'))
assert.ok(sectionContent.includes('class="workbench-drawer-form__field-error"'))
assert.ok(sectionContent.includes('v-if="isLoading" class="textbook-management__loading-state"'))
assert.ok(sectionContent.includes('v-else'))
assert.equal(sectionContent.includes('<select v-model="filters.course">'), false)
assert.equal(sectionContent.includes('ownedRows'), false)
assert.equal(sectionContent.includes('currentTeacherId'), false)
assert.equal(sectionContent.includes('仅显示我上传的教材'), false)
assert.equal(sectionContent.includes('textbook-management__scope-pill'), false)

assert.match(
  stylesContent,
  /\.textbook-management\s*\{[\s\S]*?--workbench-table-line:\s*var\(--line\);[\s\S]*?--workbench-table-ink:\s*var\(--ink\);/i,
)
assert.match(
  stylesContent,
  /\.textbook-management__toolbar\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+200px\s+auto\s+auto;[\s\S]*?gap:\s*12px;/i,
)
assert.match(
  statusPillStyles,
  /\.workbench-status-pill__anchor\s*\{[\s\S]*?position:\s*relative;/i,
)
assert.match(
  statusPillStyles,
  /\.workbench-status-pill__button\s*\{[\s\S]*?border-radius:\s*999px;/i,
)
assert.match(
  statusPillStyles,
  /\.workbench-status-pill__popover\s*\{[\s\S]*?position:\s*absolute;/i,
)
assert.equal(stylesContent.includes('.textbook-management__toolbar-advanced'), false)
assert.equal(stylesContent.includes('.textbook-management__scope-pill'), false)
assert.match(
  stylesContent,
  /\.textbook-management__pagination\s*\{[\s\S]*?display:\s*flex;[\s\S]*?border-top:\s*1px solid var\(--line\);/i,
)
assert.match(
  stylesContent,
  /\.textbook-management__loading-state\s*\{[\s\S]*?display:\s*grid;[\s\S]*?justify-items:\s*center;[\s\S]*?align-content:\s*center;/i,
)
assert.match(
  stylesContent,
  /\.textbook-management__loading-icon\s*\{[\s\S]*?width:\s*72px;[\s\S]*?height:\s*72px;[\s\S]*?border-radius:\s*24px;/i,
)
assert.match(
  statusPillStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.workbench-status-pill__anchor[\s\S]*?\.workbench-status-pill__popover/i,
)
