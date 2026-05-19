import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { createDefaultVideoFilterState } from '../../../../src/features/resource-center/workbench/video/model/video-workbench.view-model.ts'
import { useVideoWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/video/store/video-workbench-session.ts'

const defaultFilters = createDefaultVideoFilterState()
const storageKey = 'resource-center:video-session:list'

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

const store = useVideoWorkbenchSessionStore()

assert.equal(store.page, 1)
assert.equal(store.filters.overviewStatus, 'all')
assert.deepEqual(store.filters, defaultFilters)

store.patchFilters({
  course: '计算机网络',
  overviewStatus: 'published',
})
store.setPage(2)

assert.equal(store.filters.course, '计算机网络')
assert.equal(store.filters.overviewStatus, 'published')
assert.equal(store.page, 2)

store.reset()

assert.deepEqual(store.filters, defaultFilters)
assert.equal(store.page, 1)

window.localStorage.setItem(
  storageKey,
  JSON.stringify({
    filters: {
      course: '计算机网络',
      overviewStatus: 'published',
    },
    page: 2,
  }),
)

setActivePinia(createPinia())
const rehydratedStore = useVideoWorkbenchSessionStore()

assert.deepEqual(rehydratedStore.filters, {
  ...defaultFilters,
  course: '计算机网络',
  overviewStatus: 'published',
})
assert.equal(rehydratedStore.page, 2)

window.localStorage.setItem(
  storageKey,
  JSON.stringify({
    filters: {
      overviewStatus: 'published',
    },
  }),
)

setActivePinia(createPinia())
const sanitizedStore = useVideoWorkbenchSessionStore()

assert.deepEqual(sanitizedStore.filters, {
  ...defaultFilters,
  overviewStatus: 'published',
})
assert.equal(sanitizedStore.page, 1)
