import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { mappingRecords } from '../../../../src/features/resource-center/workbench/mapping/model/mapping-workbench.fixtures.ts'
import {
  createDefaultMappingFilterState,
  createMappingWorkbenchViewModel,
} from '../../../../src/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'

const rootDir = process.cwd()

const sectionPath = path.join(
  rootDir,
  'src/features/resource-center/workbench/mapping/ui/MappingWorkbenchSection.vue',
)
const filtersPath = path.join(
  rootDir,
  'src/features/resource-center/workbench/mapping/ui/MappingWorkbenchFilters.vue',
)
const tablePath = path.join(
  rootDir,
  'src/features/resource-center/workbench/mapping/ui/MappingWorkbenchTable.vue',
)
const bulkBarPath = path.join(
  rootDir,
  'src/features/resource-center/workbench/mapping/ui/MappingWorkbenchBulkBar.vue',
)
const reviewDrawerPath = path.join(
  rootDir,
  'src/features/resource-center/workbench/mapping/ui/MappingWorkbenchReviewDrawer.vue',
)
const stylesPath = path.join(
  rootDir,
  'src/features/resource-center/workbench/mapping/styles/mapping-workbench.css',
)

for (const filePath of [sectionPath, filtersPath, tablePath, bulkBarPath, reviewDrawerPath, stylesPath]) {
  assert.equal(fs.existsSync(filePath), true, `${path.basename(filePath)} should exist`)
}
assert.equal(fs.existsSync(path.join(rootDir, 'src/features/resource-center/workbench/mapping/ui/MappingWorkbenchStatusCards.vue')), false)

const sectionSource = fs.readFileSync(sectionPath, 'utf8')
const filtersSource = fs.readFileSync(filtersPath, 'utf8')
const tableSource = fs.readFileSync(tablePath, 'utf8')
const reviewDrawerSource = fs.readFileSync(reviewDrawerPath, 'utf8')
const stylesSource = fs.readFileSync(stylesPath, 'utf8')

const defaultFilters = createDefaultMappingFilterState()
const matchedViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    overviewStatus: 'matched',
  },
  page: 1,
  pageSize: 8,
})
const lowConfidenceViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    confidenceLevel: 'low',
  },
  page: 1,
  pageSize: 8,
})

const defaultViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 8,
})

assert.equal(matchedViewModel.summaryCards.find((item) => item.key === 'matched')?.active, true)
assert.equal(
  matchedViewModel.summaryCards
    .filter((item) => item.key !== 'matched')
    .every((item) => item.active === false),
  true,
)
assert.equal(lowConfidenceViewModel.summaryCards.find((item) => item.key === 'low-confidence')?.active, true)
assert.equal(
  lowConfidenceViewModel.summaryCards
    .filter((item) => item.key !== 'low-confidence')
    .every((item) => item.active === false),
  true,
)
assert.deepEqual(
  defaultViewModel.rows.find((row) => row.id === 'map-1004')?.riskTags,
  ['低置信度', '待复核'],
)
assert.deepEqual(
  defaultViewModel.rows.find((row) => row.id === 'map-1005')?.riskTags,
  ['低置信度', '缺少主挂载点'],
)

assert.match(sectionSource, /import '\.\.\/styles\/mapping-workbench\.css'/)
assert.match(sectionSource, /import WorkbenchSummaryCards from '\.\.\/\.\.\/shared\/ui\/WorkbenchSummaryCards\.vue'/)
assert.match(sectionSource, /import MappingWorkbenchFilters from '\.\/MappingWorkbenchFilters\.vue'/)
assert.match(sectionSource, /import MappingWorkbenchTable from '\.\/MappingWorkbenchTable\.vue'/)
assert.match(sectionSource, /import MappingWorkbenchBulkBar from '\.\/MappingWorkbenchBulkBar\.vue'/)
assert.match(sectionSource, /import MappingWorkbenchReviewDrawer from '\.\/MappingWorkbenchReviewDrawer\.vue'/)
assert.ok(sectionSource.includes('watch('))
assert.ok(sectionSource.includes('() => ({ ...filters })'))
assert.ok(sectionSource.includes('page.value = 1'))
assert.ok(sectionSource.includes('selectedIds.value = []'))
assert.ok(sectionSource.includes('const drawerOpen = ref(false)'))
assert.ok(sectionSource.includes('const activeRecordId = ref<string | null>(null)'))
assert.ok(sectionSource.includes('const activeRecord = computed('))
assert.ok(sectionSource.includes('function handleReview(recordId: string)'))
assert.ok(sectionSource.includes('function closeDrawer()'))
assert.ok(sectionSource.includes('page.value = 1'))
assert.ok(sectionSource.includes('selectedIds.value = []'))
assert.ok(sectionSource.includes("if (status === 'low-confidence')"))
assert.ok(sectionSource.includes("filters.confidenceLevel = filters.confidenceLevel === 'low' ? 'all' : 'low'"))
assert.ok(sectionSource.includes("filters.overviewStatus = filters.overviewStatus === status ? 'all' : status"))
assert.ok(sectionSource.includes('function handleSwitchPrimary(candidateId: string)'))
assert.ok(sectionSource.includes('function handleConfirmRecord()'))
assert.ok(sectionSource.includes('function handleIgnoreRecord()'))
assert.ok(sectionSource.includes('<WorkbenchSummaryCards :items="viewModel.summaryCards" @select="handleStatusSelect" />'))
assert.ok(sectionSource.includes('v-if="selectedIds.length > 0"'))
assert.ok(sectionSource.includes('<MappingWorkbenchBulkBar :selected-count="selectedIds.length" @apply-action="handleBulkAction" />'))
assert.ok(sectionSource.includes('<MappingWorkbenchReviewDrawer'))
assert.ok(sectionSource.includes(':open="drawerOpen"'))
assert.ok(sectionSource.includes(':record="activeRecord"'))
assert.ok(sectionSource.includes('@close="closeDrawer"'))
assert.ok(sectionSource.includes('@confirm-record="handleConfirmRecord"'))
assert.ok(sectionSource.includes('@ignore-record="handleIgnoreRecord"'))
assert.ok(sectionSource.includes('@switch-primary="handleSwitchPrimary"'))
assert.equal(sectionSource.includes('Task 3 的抽屉流程中接入'), false)

assert.ok(filtersSource.includes("import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'"))
assert.ok(filtersSource.includes('<WorkbenchSelect'))
assert.equal(filtersSource.includes('<select :value="filters.resourceType"'), false)
assert.equal(filtersSource.includes('<select :value="filters.course"'), false)
assert.equal(filtersSource.includes('<select :value="filters.chapter"'), false)
assert.equal(filtersSource.includes('<select :value="filters.batchId"'), false)
assert.equal(filtersSource.includes('<select :value="filters.reviewStatus"'), false)
assert.equal(filtersSource.includes('<select :value="filters.confidenceLevel"'), false)
assert.match(stylesSource, /\.mapping-management-filters__select-field\s*\{[\s\S]*?display:\s*contents;/i)
assert.equal(/\.mapping-management-filters__select-field::after\s*\{/i.test(stylesSource), false)
assert.equal(/\.mapping-management-filters__select-field\s+select\s*\{/i.test(stylesSource), false)

for (const contract of [
  ':rows="viewModel.rows"',
  ':empty-state="viewModel.emptyState"',
  ':selected-ids="selectedIds"',
  ':all-visible-selected="allVisibleSelected"',
  ':pagination="viewModel.pagination"',
  '@toggle-row="toggleRowSelection"',
  '@toggle-visible="toggleVisibleSelection"',
  '@review="handleReview"',
  '@page-change="handlePageChange"',
]) {
  assert.ok(sectionSource.includes(contract), `Section should expose table contract: ${contract}`)
}

assert.equal(tableSource.includes('function buildRiskTags('), false)
assert.ok(tableSource.includes('v-for="tag in row.riskTags"'))
assert.ok(tableSource.includes('v-if="row.riskTags.length === 0"'))

assert.ok(reviewDrawerSource.includes('open: boolean'))
assert.ok(reviewDrawerSource.includes('record: MappingRecord | null'))
assert.ok(reviewDrawerSource.includes('v-for="candidate in record.candidates"'))
assert.ok(reviewDrawerSource.includes("emit('switch-primary', candidate.id)"))
assert.ok(reviewDrawerSource.includes("@click=\"emit('confirm-record')\""))
assert.ok(reviewDrawerSource.includes("@click=\"emit('ignore-record')\""))

assert.match(stylesSource, /\.mapping-management__editor-shell\s*\{[\s\S]*?position:\s*fixed/i)
assert.match(stylesSource, /\.mapping-management__editor-panel\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?right:\s*0;/i)
assert.match(stylesSource, /\.mapping-management__editor-footer\s*\{[\s\S]*?justify-content:\s*flex-end;/i)
assert.match(stylesSource, /@media \(max-width: 760px\)\s*\{[\s\S]*?\.mapping-management__editor-panel\s*\{[\s\S]*?width:\s*100vw;/i)
