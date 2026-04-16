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

for (const fileUrl of [sectionUrl, stylesUrl, typesUrl, fixturesUrl, viewModelUrl, validationUrl]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const sectionContent = readFileSync(sectionUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')
const normalizedSectionContent = sectionContent.replace(/\s+/g, ' ')

assert.ok(sectionContent.includes("import '../styles/courseware-workbench.css'"))
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

assert.ok(sectionContent.includes('class="courseware-management workbench-surface"'))
assert.ok(sectionContent.includes('class="courseware-management__controls"'))
assert.ok(sectionContent.includes('class="courseware-management__summary"'))
assert.ok(sectionContent.includes('class="courseware-management__summary-card"'))
assert.ok(sectionContent.includes('class="courseware-management__summary-value"'))
assert.ok(sectionContent.includes(`'is-record': item.label ===`))
assert.ok(sectionContent.includes('class="courseware-management__toolbar"'))
assert.ok(sectionContent.includes('class="courseware-management__search-field"'))
assert.ok(sectionContent.includes('class="courseware-management__select-field"'))
assert.ok(sectionContent.includes('class="courseware-management__create-button"'))
assert.ok(sectionContent.includes('class="courseware-management__table-shell"'))
assert.ok(sectionContent.includes('class="courseware-management__pagination"'))
assert.ok(sectionContent.includes('<WorkbenchTablePagination'))
assert.ok(sectionContent.includes('show-quick-jumper'))
assert.ok(sectionContent.includes('class="courseware-management__drawer-shell"'))
assert.ok(sectionContent.includes('placeholder='))
assert.ok(sectionContent.includes('handleCreate'))
assert.ok(sectionContent.includes('handleEdit'))
assert.ok(sectionContent.includes('handleDelete'))
assert.ok(sectionContent.includes('saveDrawer'))
assert.ok(
  normalizedSectionContent.includes(
    '<button type="button" class="danger" aria-label=',
  ),
)
assert.ok(normalizedSectionContent.includes('class="danger" aria-label='))
assert.ok(normalizedSectionContent.includes('@click="handleDelete(row.id)"'))
assert.equal(sectionContent.includes('module-workbench-placeholder'), false)
assert.equal(sectionContent.includes('placeholderTitle'), false)
assert.equal(sectionContent.includes('placeholderDescription'), false)
assert.equal(
  /<label class="courseware-management__select-field">\s*<span>/.test(sectionContent),
  false,
)

assert.match(stylesContent, /\.courseware-management\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(stylesContent, /\.courseware-management__summary\s*\{[\s\S]*?grid-template-columns:/i)
assert.match(
  stylesContent,
  /\.courseware-management__summary-card\s*\{[\s\S]*?min-height:\s*88px;[\s\S]*?padding:\s*14px 16px;/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__summary-value\.is-record\s*\{[\s\S]*?font-size:\s*1\.15rem;/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__toolbar\s*\{[\s\S]*?grid-template-columns:[\s\S]*?align-items:\s*stretch;/i,
)
assert.match(stylesContent, /\.courseware-management__search-field\s*\{[\s\S]*?height:\s*56px;/i)
assert.match(
  stylesContent,
  /\.courseware-management__toolbar\s+\.courseware-management__select-field\s+select\s*\{[\s\S]*?height:\s*56px;/i,
)
assert.match(stylesContent, /\.courseware-management__create-button\s*\{[\s\S]*?height:\s*56px;/i)
assert.equal(stylesContent.includes('.courseware-management__select-field span'), false)
assert.match(stylesContent, /\.courseware-management\s*\{[\s\S]*?gap:\s*16px;/i)
assert.match(
  stylesContent,
  /\.courseware-management\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__controls\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*16px;/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__table-shell\s*\{[\s\S]*?border-radius:\s*18px;/i,
)
assert.match(stylesContent, /\.courseware-management__table\s*\{[\s\S]*?width:\s*100%;/i)
assert.match(
  stylesContent,
  /\.courseware-management__table\s+th,\s*[\s\S]*?\.courseware-management__table\s+td\s*\{[\s\S]*?padding:\s*18px 16px;/i,
)
assert.match(
  stylesContent,
  /\.courseware-management__table\s+th\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;/i,
)
assert.match(stylesContent, /\.courseware-management__table\s+th\s*\{[\s\S]*?z-index:\s*1;/i)
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
assert.match(stylesContent, /\.courseware-management__drawer-shell\s*\{[\s\S]*?position:\s*fixed;/i)
assert.equal(stylesContent.includes('@media (max-width: 760px)'), false)
