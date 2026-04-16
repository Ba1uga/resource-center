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

assert.equal(existsSync(sectionUrl), true, 'TextbookWorkbenchSection.vue must exist')
assert.equal(existsSync(stylesUrl), true, 'textbook-workbench.css must exist')

const sectionContent = readFileSync(sectionUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

assert.ok(sectionContent.includes("import '../styles/textbook-workbench.css'"))
assert.ok(
  sectionContent.includes(
    "import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'",
  ),
)
assert.ok(sectionContent.includes('defineProps<{'))
assert.ok(sectionContent.includes('section: WorkbenchSectionMeta'))
assert.ok(sectionContent.includes('const currentAdminId ='))
assert.ok(sectionContent.includes('textbook-management'))
assert.ok(sectionContent.includes('管理员可管理全部教材'))
assert.ok(sectionContent.includes('placeholder="搜索教材名称或作者..."'))
assert.ok(sectionContent.includes('新建教材'))
assert.ok(sectionContent.includes('教材名称'))
assert.ok(sectionContent.includes('作者'))
assert.ok(sectionContent.includes('出版社'))
assert.ok(sectionContent.includes('版本'))
assert.ok(sectionContent.includes('ISBN'))
assert.ok(sectionContent.includes('关联课程'))
assert.ok(sectionContent.includes('操作'))
assert.ok(sectionContent.includes('<WorkbenchTablePagination'))
assert.ok(sectionContent.includes(':page-size="pageSize"'))
assert.ok(sectionContent.includes(':page-size-options="pageSizeOptions"'))
assert.ok(sectionContent.includes('openCreateDrawer'))
assert.ok(sectionContent.includes('openEditDrawer'))
assert.ok(sectionContent.includes('deleteRow'))
assert.ok(sectionContent.includes('saveDrawer'))
assert.equal(sectionContent.includes('ownedRows'), false)
assert.equal(sectionContent.includes('currentTeacherId'), false)
assert.equal(sectionContent.includes('仅显示我上传的教材'), false)

assert.match(stylesContent, /\.textbook-management\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(
  stylesContent,
  /\.textbook-management\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(stylesContent, /\.textbook-management__toolbar\s*\{[\s\S]*?display:\s*grid;/i)
assert.match(
  stylesContent,
  /\.textbook-management__table-shell\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\) auto;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/i,
)
assert.ok(!/\.textbook-management__table-shell\s*\{[^}]*height:\s*100%;/i.test(stylesContent))
assert.match(
  stylesContent,
  /\.textbook-management__table-scroll\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?height:\s*100%;[\s\S]*?overflow:\s*auto;/i,
)
assert.match(stylesContent, /\.textbook-management__table\s*\{[\s\S]*?width:\s*100%;/i)
assert.match(
  stylesContent,
  /\.textbook-management__table\s+th\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;/i,
)
assert.match(stylesContent, /\.textbook-management__table\s+th\s*\{[\s\S]*?z-index:\s*1;/i)
assert.match(stylesContent, /\.textbook-management__pagination\s*\{[\s\S]*?display:\s*flex;/i)
assert.equal(stylesContent.includes('@media (max-width: 760px)'), false)
