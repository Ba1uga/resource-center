import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const paginationModelUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/model/workbench-pagination.ts',
  import.meta.url,
)
const paginationComponentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchTablePagination.vue',
  import.meta.url,
)
const paginationStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-pagination.css',
  import.meta.url,
)

for (const fileUrl of [paginationModelUrl, paginationComponentUrl, paginationStylesUrl]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

if (existsSync(paginationModelUrl)) {
  const { buildWorkbenchPaginationItems } = await import(paginationModelUrl.href)

  assert.deepEqual(buildWorkbenchPaginationItems({ page: 1, pageCount: 1 }), [1])
  assert.deepEqual(buildWorkbenchPaginationItems({ page: 1, pageCount: 10 }), [1, 2, 3, 4, 5, 'ellipsis', 10])
  assert.deepEqual(
    buildWorkbenchPaginationItems({ page: 5, pageCount: 10 }),
    [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10],
  )
  assert.deepEqual(buildWorkbenchPaginationItems({ page: 9, pageCount: 10 }), [1, 'ellipsis', 6, 7, 8, 9, 10])
}

const paginationComponent = existsSync(paginationComponentUrl)
  ? readFileSync(paginationComponentUrl, 'utf8')
  : ''
const paginationStyles = existsSync(paginationStylesUrl) ? readFileSync(paginationStylesUrl, 'utf8') : ''

assert.ok(paginationComponent.includes("import '../styles/workbench-pagination.css'"))
assert.ok(paginationComponent.includes('buildWorkbenchPaginationItems'))
assert.ok(paginationComponent.includes('showQuickJumper'))
assert.ok(paginationComponent.includes('workbench-pagination__summary'))
assert.ok(paginationComponent.includes('workbench-pagination__controls'))
assert.ok(paginationComponent.includes('workbench-pagination__quick-jumper'))
assert.ok(paginationComponent.includes("emit('page-change'"))
assert.ok(paginationComponent.includes("emit('page-size-change'"))
assert.ok(paginationComponent.includes('跳至'))
assert.equal(paginationComponent.includes('workbench-pagination__button--jump'), false)

assert.match(
  paginationStyles,
  /\.workbench-pagination\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;/i,
)
assert.match(
  paginationStyles,
  /\.workbench-pagination__button\s*\{[\s\S]*?min-width:\s*32px;[\s\S]*?height:\s*32px;/i,
)
assert.match(
  paginationStyles,
  /\.workbench-pagination__button\.is-active\s*\{[\s\S]*?border-color:\s*#1677ff;[\s\S]*?color:\s*#1677ff;/i,
)
assert.match(
  paginationStyles,
  /\.workbench-pagination__quick-jumper\s*\{[\s\S]*?display:\s*inline-flex;/i,
)
assert.match(
  paginationStyles,
  /\.workbench-pagination__quick-jumper input\s*\{[\s\S]*?height:\s*32px;/i,
)
assert.match(paginationStyles, /@media \(max-width: 760px\)\s*\{/i)
