import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { useCoursewareWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/courseware/store/courseware-workbench-session.ts'

setActivePinia(createPinia())

const store = useCoursewareWorkbenchSessionStore()

assert.equal(store.page, 1)
assert.equal(store.filters.keyword, '')

store.patchFilters({
  keyword: 'ppt',
  type: 'PDF',
})
store.setPage(2)

assert.equal(store.filters.keyword, 'ppt')
assert.equal(store.filters.type, 'PDF')
assert.equal(store.page, 2)

store.reset()

assert.equal(store.page, 1)
assert.equal(store.filters.keyword, '')
