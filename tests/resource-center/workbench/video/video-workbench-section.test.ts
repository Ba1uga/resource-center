import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const sectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/ui/VideoWorkbenchSection.vue',
  import.meta.url,
)
const sharedCardsUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchSummaryCards.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/styles/video-workbench.css',
  import.meta.url,
)
const typesUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/model/video-workbench.types.ts',
  import.meta.url,
)
const fixturesUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/model/video-workbench.fixtures.ts',
  import.meta.url,
)
const viewModelUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/model/video-workbench.view-model.ts',
  import.meta.url,
)

for (const fileUrl of [sectionUrl, sharedCardsUrl, stylesUrl, typesUrl, fixturesUrl, viewModelUrl]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}
assert.equal(
  existsSync(
    new URL('../../../../src/features/resource-center/workbench/video/ui/VideoWorkbenchStatusCards.vue', import.meta.url),
  ),
  false,
)

const sectionContent = readFileSync(sectionUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

assert.ok(sectionContent.includes("import '../styles/video-workbench.css'"))
assert.ok(sectionContent.includes("import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'"))
assert.ok(sectionContent.includes("import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'"))
assert.ok(sectionContent.includes("import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'"))
assert.ok(sectionContent.includes("import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'"))
assert.ok(sectionContent.includes("import VideoWorkbenchBulkBar from './VideoWorkbenchBulkBar.vue'"))
assert.ok(sectionContent.includes("import VideoWorkbenchDrawer from './VideoWorkbenchDrawer.vue'"))
assert.ok(
  sectionContent.includes(
    "import { useVideoWorkbenchSessionStore } from '@/features/resource-center/workbench/video/store/video-workbench-session.ts'",
  ),
)
assert.ok(
  sectionContent.includes(
    "import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'",
  ),
)
assert.ok(sectionContent.includes('createVideoWorkbenchViewModel'))
assert.ok(sectionContent.includes('resolveVideoPageAfterDeletion'))
assert.ok(sectionContent.includes('videoRecords'))
assert.ok(sectionContent.includes('const sessionStore = useVideoWorkbenchSessionStore()'))
assert.ok(sectionContent.includes('const filters = computed({'))
assert.ok(sectionContent.includes('get: () => sessionStore.filters'))
assert.ok(sectionContent.includes('set: (value) => sessionStore.patchFilters(value)'))
assert.ok(sectionContent.includes('const page = computed({'))
assert.ok(sectionContent.includes('get: () => sessionStore.page'))
assert.ok(sectionContent.includes('set: (value) => sessionStore.setPage(value)'))
assert.ok(sectionContent.includes('const pageSize = 8'))
assert.ok(sectionContent.includes('const fallbackRecords = ref<VideoRecord[]>([...videoRecords])'))
assert.ok(sectionContent.includes('const selectedIds = ref<string[]>([])'))
assert.ok(sectionContent.includes("mode: 'create' as 'create' | 'edit'"))
assert.ok(sectionContent.includes('function handlePageChange('))
assert.ok(sectionContent.includes('function handleStatusSelect('))
assert.ok(sectionContent.includes("overviewStatus: filters.value.overviewStatus === status ? 'all' : status"))
assert.ok(sectionContent.includes("sessionStore.patchFilters({"))
assert.ok(sectionContent.includes('sessionStore.setPage(nextPage)'))
assert.ok(sectionContent.includes('sessionStore.setPage(resolveVideoPageAfterDeletion({'))
assert.ok(sectionContent.includes('selectedIds.value = []'))
assert.ok(sectionContent.includes('function handleBulkAction('))
assert.ok(sectionContent.includes('function openUploadDrawer('))
assert.ok(sectionContent.includes('function openEditDrawer('))
assert.ok(sectionContent.includes('function toggleRecordSelection('))
assert.ok(sectionContent.includes('selectedIds.value = selectedIds.value.filter((id) => records.value.some((record) => record.id === id))'))
assert.equal(sectionContent.includes('Legacy anchors'), false)
assert.ok(sectionContent.includes('<WorkbenchDataView class="video-management"'))
assert.ok(sectionContent.includes('<template #summary>'))
assert.ok(sectionContent.includes('<template #toolbar>'))
assert.ok(sectionContent.includes('<template #bulk>'))
assert.ok(sectionContent.includes('<template #table>'))
assert.ok(sectionContent.includes('<template #pagination>'))
assert.ok(sectionContent.includes('<template #drawer>'))
assert.ok(sectionContent.includes('class="video-management__heading"'))
assert.ok(sectionContent.includes('class="video-management__toolbar"'))
assert.ok(sectionContent.includes('class="video-management__search-field"'))
assert.ok(sectionContent.includes('class="video-management__select-field"'))
assert.ok(sectionContent.includes('<WorkbenchSelect'))
assert.ok(sectionContent.includes('class="video-management__upload-button"'))
assert.ok(sectionContent.includes('class="video-management__row-actions"'))
assert.ok(sectionContent.includes('<WorkbenchTable'))
assert.ok(sectionContent.includes(':selected-row-keys="selectedIds"'))
assert.ok(sectionContent.includes(':all-visible-selected="allVisibleSelected"'))
assert.ok(sectionContent.includes('cell-resource'))
assert.ok(sectionContent.includes('cell-processingStatus'))
assert.ok(sectionContent.includes('cell-publishStatus'))
assert.ok(sectionContent.includes('cell-actions'))
assert.ok(sectionContent.includes('class="video-management__status-badge"'))
assert.ok(sectionContent.includes('class="video-management__meta-line"'))
assert.ok(sectionContent.includes('<WorkbenchSummaryCards :items="viewModel.summaryCards" @select="(key) => handleStatusSelect(key as VideoOverviewStatus)" />'))
assert.ok(sectionContent.includes('<VideoWorkbenchBulkBar'))
assert.ok(sectionContent.includes('<VideoWorkbenchDrawer'))
assert.ok(sectionContent.includes('<WorkbenchTablePagination'))
assert.ok(sectionContent.includes('show-quick-jumper'))
assert.ok(sectionContent.includes(':pagination="viewModel.pagination"'))
assert.ok(sectionContent.includes('handleUpload'))
assert.ok(sectionContent.includes('handleEdit'))
assert.ok(sectionContent.includes('handleDelete'))
assert.ok(sectionContent.includes('v-model="keywordInput"'))
assert.ok(sectionContent.includes('placeholder="搜索视频标题、知识点..."'))
assert.ok(sectionContent.includes(':model-value="filters.course"'))
assert.ok(sectionContent.includes("@update:model-value=\"(course) => { sessionStore.patchFilters({ course }); selectedIds = [] }\""))
assert.ok(sectionContent.includes(':model-value="filters.chapter"'))
assert.ok(sectionContent.includes("@update:model-value=\"(chapter) => { sessionStore.patchFilters({ chapter }); selectedIds = [] }\""))
assert.ok(sectionContent.includes(':model-value="filters.processingStatus"'))
assert.ok(
  sectionContent.includes(
    "@update:model-value=\"(processingStatus) => { sessionStore.patchFilters({ processingStatus: processingStatus as VideoFilterState['processingStatus'] }); selectedIds = [] }\"",
  ),
)
assert.ok(sectionContent.includes(':model-value="filters.publishStatus"'))
assert.ok(
  sectionContent.includes(
    "@update:model-value=\"(publishStatus) => { sessionStore.patchFilters({ publishStatus: publishStatus as VideoFilterState['publishStatus'] }); selectedIds = [] }\"",
  ),
)
assert.equal(sectionContent.includes('<select v-model="filters.course"'), false)
assert.equal(sectionContent.includes('<select v-model="filters.chapter"'), false)
assert.equal(sectionContent.includes('<select v-model="filters.processingStatus"'), false)
assert.equal(sectionContent.includes('<select v-model="filters.publishStatus"'), false)
assert.equal(sectionContent.includes('class="video-management__feedback"'), false)
assert.equal(sectionContent.includes('已打开上传视频抽屉，可继续补齐资源文件与发布信息。'), false)
assert.ok(sectionContent.includes('<VideoWorkbenchBulkBar'))
assert.equal(sectionContent.includes('管理教学视频资源'), false)
assert.ok(sectionContent.includes("import { listVideos } from '@/api/video.ts'"))
assert.ok(sectionContent.includes('const apiRecords = ref<VideoRecord[]>([])'))
assert.ok(sectionContent.includes('const isLoading = ref(false)'))
assert.ok(sectionContent.includes('const isUsingFallback = ref(false)'))
assert.ok(sectionContent.includes('async function loadVideos()'))
assert.ok(sectionContent.includes('await listVideos('))
assert.ok(sectionContent.includes("import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'"))
assert.ok(sectionContent.includes('keywordDebounceTimer'))
assert.equal(sectionContent.includes('module-workbench-placeholder'), false)
assert.equal(sectionContent.includes('placeholderTitle'), false)
assert.equal(sectionContent.includes('placeholderDescription'), false)

assert.match(stylesContent, /\.video-management__heading\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(stylesContent, /\.video-management__toolbar\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(
  stylesContent,
  /\.video-management\s*\{[\s\S]*?--workbench-table-line:\s*var\(--video-line\);[\s\S]*?--workbench-table-ink:\s*var\(--video-ink\);/i,
)
assert.match(
  stylesContent,
  /\.video-management__search-field\s*\{[\s\S]*?height:\s*62px;/i,
)
assert.match(stylesContent, /\.video-management__select-field\s*\{[\s\S]*?display:\s*contents;/i)
assert.equal(/\.video-management__select-field::after\s*\{/i.test(stylesContent), false)
assert.equal(/\.video-management__select-field\s+select\s*\{/i.test(stylesContent), false)
assert.match(stylesContent, /\.video-management__upload-button\s*\{[\s\S]*?height:\s*62px;/i)
assert.match(
  stylesContent,
  /\.video-management__numeric-cell,\s*[\r\n]+\s*\.video-management__date-cell\s*\{[\s\S]*?font-variant-numeric:\s*tabular-nums;/i,
)
assert.match(stylesContent, /\.video-management__bulk-bar\s*\{[\s\S]*?display:\s*flex;/i)
assert.match(stylesContent, /\.video-management__info-cell\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(stylesContent, /\.video-management__cover\s*\{[\s\S]*?width:\s*56px;/i)
assert.match(stylesContent, /\.video-management__status-badge\s*\{[\s\S]*?border-radius:\s*999px;/i)
assert.match(stylesContent, /\.video-management__drawer-footer\s*\{[\s\S]*?position:\s*sticky;/i)
assert.match(stylesContent, /@media \(max-width: 980px\)\s*\{/i)
assert.match(stylesContent, /@media \(max-width: 760px\)\s*\{/i)
