import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const statusCardsUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/ui/VideoWorkbenchStatusCards.vue',
  import.meta.url,
)
const bulkBarUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/ui/VideoWorkbenchBulkBar.vue',
  import.meta.url,
)
const drawerUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/ui/VideoWorkbenchDrawer.vue',
  import.meta.url,
)

for (const fileUrl of [statusCardsUrl, bulkBarUrl, drawerUrl]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const statusCardsContent = readFileSync(statusCardsUrl, 'utf8')
const bulkBarContent = readFileSync(bulkBarUrl, 'utf8')
const drawerContent = readFileSync(drawerUrl, 'utf8')

assert.ok(statusCardsContent.includes('class="video-management__status-overview"'))
assert.ok(statusCardsContent.includes("emit('select-status'"))

assert.ok(bulkBarContent.includes('class="video-management__bulk-bar"'))
assert.ok(bulkBarContent.includes('批量发布'))

assert.ok(drawerContent.includes('class="video-management__drawer"'))
assert.ok(drawerContent.includes('资源文件'))
assert.ok(drawerContent.includes('视频信息'))
assert.ok(drawerContent.includes('发布设置'))
assert.ok(drawerContent.includes("emit('save-draft'"))
assert.ok(drawerContent.includes("emit('save-publish'"))
assert.ok(drawerContent.includes("emit('retry-upload'"))
