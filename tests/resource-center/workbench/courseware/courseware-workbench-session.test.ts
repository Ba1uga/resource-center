import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { createDefaultCoursewareFilterState } from '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts'
import { useCoursewareWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/courseware/store/courseware-workbench-session.ts'

const defaultFilters = createDefaultCoursewareFilterState()
const storageKey = 'resource-center:courseware-session:list'

const createLocalStorage = () => {
  const storage = new Map<string, string>()

  return {
    getItem(key: string) {
      return storage.get(key) ?? null
    },
    setItem(key: string, value: string) {
      storage.set(key, value)
    },
    removeItem(key: string) {
      storage.delete(key)
    },
    clear() {
      storage.clear()
    },
  }
}

Object.assign(globalThis, {
  window: {
    localStorage: createLocalStorage(),
  },
})

setActivePinia(createPinia())

const store = useCoursewareWorkbenchSessionStore()

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

window.localStorage.setItem(
  storageKey,
  JSON.stringify({
    filters: {
      keyword: 'ppt',
    },
    page: 3,
  }),
)

setActivePinia(createPinia())
const rehydratedStore = useCoursewareWorkbenchSessionStore()

assert.deepEqual(rehydratedStore.filters, {
  ...defaultFilters,
  keyword: 'ppt',
})
assert.equal(rehydratedStore.page, 3)

for (const invalidPage of [0, -1, 1.5]) {
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({
      filters: {
        keyword: 'pdf',
      },
      page: invalidPage,
    }),
  )

  setActivePinia(createPinia())
  const invalidPageStore = useCoursewareWorkbenchSessionStore()

  assert.deepEqual(invalidPageStore.filters, {
    ...defaultFilters,
    keyword: 'pdf',
  })
  assert.equal(invalidPageStore.page, 1)
}
