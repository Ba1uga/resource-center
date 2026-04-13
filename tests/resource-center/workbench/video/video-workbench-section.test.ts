import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const sectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/ui/VideoWorkbenchSection.vue',
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

for (const fileUrl of [sectionUrl, stylesUrl, typesUrl, fixturesUrl, viewModelUrl]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const sectionContent = readFileSync(sectionUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

assert.ok(sectionContent.includes("import '../styles/video-workbench.css'"))
assert.ok(
  sectionContent.includes(
    "import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'",
  ),
)
assert.ok(sectionContent.includes('createDefaultVideoFilterState'))
assert.ok(sectionContent.includes('createVideoWorkbenchViewModel'))
assert.ok(sectionContent.includes('resolveVideoPageAfterDeletion'))
assert.ok(sectionContent.includes('videoRecords'))
assert.ok(sectionContent.includes('const page = ref(1)'))
assert.ok(sectionContent.includes('const pageSize = 8'))
assert.ok(sectionContent.includes('function handlePageChange('))
assert.ok(sectionContent.includes('class="video-management workbench-surface"'))
assert.ok(sectionContent.includes('class="video-management__controls"'))
assert.ok(sectionContent.includes('class="video-management__heading"'))
assert.ok(sectionContent.includes('class="video-management__toolbar"'))
assert.ok(sectionContent.includes('class="video-management__search-field"'))
assert.ok(sectionContent.includes('class="video-management__select-field"'))
assert.ok(sectionContent.includes('class="video-management__upload-button"'))
assert.ok(sectionContent.includes('class="video-management__table-shell"'))
assert.ok(sectionContent.includes('class="video-management__table-scroll"'))
assert.ok(sectionContent.includes('class="video-management__table"'))
assert.ok(sectionContent.includes('class="video-management__row-actions"'))
assert.ok(sectionContent.includes('class="video-management__pagination"'))
assert.ok(sectionContent.includes('<WorkbenchTablePagination'))
assert.ok(sectionContent.includes('show-quick-jumper'))
assert.ok(sectionContent.includes(':pagination="viewModel.pagination"'))
assert.ok(sectionContent.includes('handleUpload'))
assert.ok(sectionContent.includes('handleEdit'))
assert.ok(sectionContent.includes('handleDelete'))
assert.equal(sectionContent.includes('管理教学视频资源'), false)
assert.equal(sectionContent.includes('module-workbench-placeholder'), false)
assert.equal(sectionContent.includes('placeholderTitle'), false)
assert.equal(sectionContent.includes('placeholderDescription'), false)

assert.match(stylesContent, /\.video-management\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(
  stylesContent,
  /\.video-management\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  stylesContent,
  /\.video-management__controls\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*16px;/i,
)
assert.match(stylesContent, /\.video-management__heading\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(stylesContent, /\.video-management__toolbar\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(stylesContent, /\.video-management\s*\{[\s\S]*?gap:\s*16px;/i)
assert.match(
  stylesContent,
  /\.video-management__search-field,\s*[\r\n]+\s*\.video-management__select-field\s*\{[\s\S]*?height:\s*62px;/i,
)
assert.match(stylesContent, /\.video-management__upload-button\s*\{[\s\S]*?height:\s*62px;/i)
assert.match(
  stylesContent,
  /\.video-management__table-shell\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto;[\s\S]*?border-radius:\s*18px;/i,
)
assert.match(stylesContent, /\.video-management__table\s*\{[\s\S]*?width:\s*100%;/i)
assert.match(
  stylesContent,
  /\.video-management__table\s+th,\s*[\s\S]*?\.video-management__table\s+td\s*\{[\s\S]*?padding:\s*18px 16px;/i,
)
assert.match(
  stylesContent,
  /\.video-management__table\s+thead\s+th\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;/i,
)
assert.match(
  stylesContent,
  /\.video-management__numeric-cell,\s*[\r\n]+\s*\.video-management__date-cell\s*\{[\s\S]*?font-variant-numeric:\s*tabular-nums;/i,
)
assert.match(
  stylesContent,
  /\.video-management__pagination\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;[\s\S]*?padding:\s*14px 16px;/i,
)
assert.match(stylesContent, /@media \(max-width: 980px\)\s*\{/i)
assert.match(stylesContent, /@media \(max-width: 760px\)\s*\{/i)
