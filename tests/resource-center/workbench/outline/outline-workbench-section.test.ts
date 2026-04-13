import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const outlineSectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue',
  import.meta.url,
)
const outlineStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/styles/outline-workbench.css',
  import.meta.url,
)

assert.equal(existsSync(outlineSectionUrl), true, 'OutlineWorkbenchSection.vue must exist')
assert.equal(existsSync(outlineStylesUrl), true, 'outline-workbench.css must exist')

const outlineSection = readFileSync(outlineSectionUrl, 'utf8')
const outlineStyles = readFileSync(outlineStylesUrl, 'utf8')

assert.ok(outlineSection.includes("import '../styles/outline-workbench.css'"))
assert.ok(outlineSection.includes('class="outline-management workbench-surface"'))
assert.ok(outlineSection.includes('class="outline-management__head"'))
assert.ok(outlineSection.includes('class="outline-query-bar"'))
assert.ok(outlineSection.includes('class="outline-management__body"'))
assert.ok(outlineSection.includes('class="outline-course-tree"'))
assert.ok(outlineSection.includes('class="outline-workspace"'))
assert.ok(outlineSection.includes('class="outline-workspace__summary"'))
assert.ok(outlineSection.includes('class="outline-workspace__completion"'))
assert.ok(outlineSection.includes('class="outline-section-tabs"'))
assert.ok(outlineSection.includes('class="outline-editor-panel"'))
assert.ok(outlineSection.includes("const activeEditorSection = ref<OutlineSectionId>('basic-info')"))
assert.ok(outlineSection.includes('placeholder="搜索课程、版本或备注"'))
assert.ok(outlineSection.includes('@click="handleResetFilters"'))
assert.ok(outlineSection.includes('@click="requestVersionSelection(course.id, version.id)"'))
assert.ok(outlineSection.includes('const savedSnapshot = ref('))
assert.ok(outlineSection.includes('const pendingSelection = ref<'))
assert.ok(outlineSection.includes('const pendingArchive = ref<'))
assert.ok(outlineSection.includes('const hasUnsavedChanges = computed(() =>'))
assert.ok(outlineSection.includes('function requestVersionSelection('))
assert.ok(outlineSection.includes('function confirmPendingSelectionWithSave()'))
assert.ok(outlineSection.includes('function discardPendingSelection()'))
assert.ok(outlineSection.includes('function requestArchiveVersion('))
assert.ok(outlineSection.includes('function confirmArchiveVersion()'))
assert.ok(outlineSection.includes('function handleRestoreVersion('))
assert.ok(outlineSection.includes('function handleCreateVersion()'))
assert.ok(outlineSection.includes('当前版本有未保存内容'))
assert.ok(outlineSection.includes('归档后不会删除内容'))
assert.ok(outlineSection.includes('复制当前版本'))
assert.ok(outlineSection.includes('空白版本'))
assert.ok(outlineSection.includes('恢复使用'))
assert.equal(outlineSection.includes('class="outline-overview-shell"'), false)
assert.equal(outlineSection.includes('class="outline-editor-drawer"'), false)
assert.equal(outlineSection.includes('function openSectionDrawer('), false)
assert.equal(outlineSection.includes('function closeSectionDrawer()'), false)

assert.match(
  outlineStyles,
  /\.outline-management\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto\s+auto\s+minmax\(0,\s*1fr\);[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  outlineStyles,
  /\.outline-query-bar\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.45fr\)\s+repeat\(4,\s*minmax\(0,\s*150px\)\)\s+auto\s+auto;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__body\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(260px,\s*320px\)\s+minmax\(0,\s*1fr\);[\s\S]*?min-height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree\s*\{[\s\S]*?display:\s*grid;[\s\S]*?align-content:\s*start;[\s\S]*?overflow:\s*auto;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto\s+auto\s+auto\s+minmax\(0,\s*1fr\);[\s\S]*?min-height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-editor-panel\s*\{[\s\S]*?padding:\s*20px;[\s\S]*?border:\s*1px solid var\(--outline-line\);[\s\S]*?border-radius:\s*22px;[\s\S]*?background:\s*var\(--outline-surface\);/i,
)
assert.match(
  outlineStyles,
  /@media \(max-width: 1180px\)\s*\{[\s\S]*?\.outline-management__body\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.outline-query-bar\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/i,
)
