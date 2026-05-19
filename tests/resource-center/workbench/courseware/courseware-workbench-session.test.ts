import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { createDefaultCoursewareFilterState } from '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts'
import { useCoursewareWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/courseware/store/courseware-workbench-session.ts'

setActivePinia(createPinia())

const store = useCoursewareWorkbenchSessionStore()
const defaultFilters = createDefaultCoursewareFilterState()

assert.equal(store.page, 1)
assert.deepEqual(store.filters, defaultFilters)

store.patchFilters({
  keyword: 'ppt',
  type: 'PDF',
})
store.setPage(2)

assert.equal(store.filters.keyword, 'ppt')
assert.equal(store.filters.type, 'PDF')
assert.equal(store.page, 2)

store.reset()

assert.deepEqual(store.filters, defaultFilters)
assert.equal(store.page, 1)
