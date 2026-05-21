import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const sectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/ui/CoursewareWorkbenchSection.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/styles/courseware-workbench.css',
  import.meta.url,
)
const typesUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.types.ts',
  import.meta.url,
)
const summaryCardsUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchSummaryCards.vue',
  import.meta.url,
)
const fixturesUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.fixtures.ts',
  import.meta.url,
)
const viewModelUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts',
  import.meta.url,
)
const validationUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.validation.ts',
  import.meta.url,
)

for (const fileUrl of [sectionUrl, stylesUrl, typesUrl, summaryCardsUrl, fixturesUrl, viewModelUrl, validationUrl]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const sectionContent = readFileSync(sectionUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')
const normalizedSectionContent = sectionContent.replace(/\s+/g, ' ')

assert.ok(sectionContent.includes("import '../styles/courseware-workbench.css'"))
assert.ok(sectionContent.includes("import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'"))
assert.ok(sectionContent.includes("import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'"))
assert.ok(sectionContent.includes("import WorkbenchBulkBar from '../../shared/ui/WorkbenchBulkBar.vue'"))
assert.ok(sectionContent.includes("import WorkbenchFormDrawer from '../../shared/ui/WorkbenchFormDrawer.vue'"))
assert.ok(sectionContent.includes("import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'"))
assert.ok(sectionContent.includes("import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'"))
assert.ok(
  sectionContent.includes(
    "import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'",
  ),
)
assert.ok(sectionContent.includes('createCoursewareWorkbenchViewModel'))
assert.ok(sectionContent.includes('createDefaultCoursewareDraft'))
assert.ok(sectionContent.includes('createDefaultCoursewareFilterState'))
assert.ok(sectionContent.includes('resolveCoursewarePageAfterDeletion'))
assert.ok(sectionContent.includes('validateCoursewareDraft'))
assert.ok(sectionContent.includes('const selectedIds = ref<string[]>([])'))
assert.ok(sectionContent.includes('const visibleIds = computed(() => viewModel.value.rows.map((row) => row.id))'))
assert.ok(sectionContent.includes('const allVisibleSelected = computed('))
assert.ok(sectionContent.includes('function toggleRowSelection('))
assert.ok(sectionContent.includes('function toggleVisibleSelection('))
assert.ok(sectionContent.includes('function handleBulkDelete()'))
assert.equal(
  sectionContent.includes(
    "import ModuleWorkbenchShell from '@/features/resource-center/workbench/shared/ui/ModuleWorkbenchShell.vue'",
  ),
  false,
)
assert.equal(sectionContent.includes('<ModuleWorkbenchShell'), false)
assert.equal(sectionContent.includes('kicker=""'), false)
assert.equal(sectionContent.includes('description=""'), false)
assert.equal(sectionContent.includes('status=""'), false)
assert.equal(sectionContent.includes(':kicker="props.section.kicker"'), false)
assert.equal(sectionContent.includes(':description="props.section.description"'), false)
assert.equal(sectionContent.includes(':status="props.section.status"'), false)

assert.ok(sectionContent.includes('<WorkbenchDataView class="courseware-management"'))
assert.ok(sectionContent.includes('<template #summary>'))
assert.ok(sectionContent.includes('<template #toolbar>'))
assert.ok(sectionContent.includes('<template #bulk>'))
assert.ok(sectionContent.includes('<template #table>'))
assert.ok(sectionContent.includes('<template #pagination>'))
assert.ok(sectionContent.includes('<template #drawer>'))
assert.ok(sectionContent.includes('<WorkbenchSummaryCards :items="viewModel.summaryCards" @select="(key) => handleSummaryCardSelect(key)" />'))
assert.ok(sectionContent.includes('class="courseware-management__toolbar"'))
assert.ok(sectionContent.includes('class="courseware-management__search-field"'))
assert.ok(sectionContent.includes('class="courseware-management__select-field"'))
assert.ok(sectionContent.includes('<WorkbenchSelect'))
assert.ok(sectionContent.includes('class="courseware-management__create-button"'))
assert.ok(sectionContent.includes('<WorkbenchTable'))
assert.ok(sectionContent.includes('<WorkbenchBulkBar'))
assert.ok(sectionContent.includes('<WorkbenchTablePagination'))
assert.ok(sectionContent.includes('show-quick-jumper'))
assert.ok(sectionContent.includes(':selected-row-keys="selectedIds"'))
assert.ok(sectionContent.includes(':all-visible-selected="allVisibleSelected"'))
assert.ok(sectionContent.includes('v-if="selectedIds.length > 0"'))
assert.ok(sectionContent.includes('批量删除'))
assert.ok(sectionContent.includes('<WorkbenchFormDrawer'))
assert.ok(sectionContent.includes('class="workbench-drawer-form__field"'))
assert.ok(sectionContent.includes('class="workbench-drawer-form__meta"'))
assert.ok(sectionContent.includes('placeholder='))
assert.ok(sectionContent.includes('handleCreate'))
assert.ok(sectionContent.includes('handleEdit'))
assert.ok(sectionContent.includes('handleDelete'))
assert.ok(sectionContent.includes('handleSummaryCardSelect'))
assert.ok(sectionContent.includes('saveDrawer'))
assert.equal(sectionContent.includes('<select v-model="filters.course">'), false)
assert.equal(sectionContent.includes('<select v-model="filters.type">'), false)
assert.equal(sectionContent.includes('<select v-model="drawerDraft.course">'), false)
assert.equal(sectionContent.includes('<select v-model="drawerDraft.type">'), false)
assert.ok(
  normalizedSectionContent.includes(
    '<button type="button" class="danger" aria-label=',
  ),
)
assert.ok(normalizedSectionContent.includes('class="danger" aria-label='))
assert.equal(sectionContent.includes('module-workbench-placeholder'), false)
assert.equal(sectionContent.includes('placeholderTitle'), false)
assert.equal(sectionContent.includes('placeholderDescription'), false)
assert.equal(
  /<label class="courseware-management__select-field">\s*<span>/.test(sectionContent),
  false,
)

assert.match(
  stylesContent,
  /\.courseware-management\s*\{[\s\S]*?--workbench-table-line:\s*var\(--courseware-line\);[\s\S]*?--workbench-table-ink:\s*var\(--courseware-ink\);/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__toolbar\s*\{[\s\S]*?grid-template-columns:\s*minmax\(280px,\s*1\.1fr\)\s+160px\s+160px\s+auto;[\s\S]*?gap:\s*12px;[\s\S]*?align-items:\s*stretch;/i,
)
assert.match(stylesContent, /\.courseware-management__search-field\s*\{[\s\S]*?height:\s*56px;/i)
assert.match(stylesContent, /\.courseware-management__select-field\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(stylesContent, /\.courseware-management__create-button\s*\{[\s\S]*?height:\s*56px;/i)
assert.equal(stylesContent.includes('.courseware-management__select-field span'), false)
assert.match(
  stylesContent,
  /\.courseware-management__row-actions\s+button\.danger\s*\{[\s\S]*?width:\s*34px;[\s\S]*?height:\s*34px;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*10px;[\s\S]*?background:\s*transparent;[\s\S]*?color:\s*var\(--courseware-danger\);/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__row-actions\s+button\.danger:hover\s*\{[\s\S]*?background:\s*oklch\(0\.97 0\.01 245\);/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__pagination\s*\{[\s\S]*?padding:\s*14px 16px;/i,
)
assert.equal(stylesContent.includes('@media (max-width: 760px)'), false)
