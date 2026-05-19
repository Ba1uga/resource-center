import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { createDefaultMappingFilterState } from '../../../../src/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'
import { useMappingWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/mapping/store/mapping-workbench-session.ts'

const defaultFilters = createDefaultMappingFilterState()
const storageKey = 'resource-center:mapping-session:list'

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

const store = useMappingWorkbenchSessionStore()

assert.equal(store.page, 1)
assert.equal(store.filters.reviewStatus, 'all')
assert.deepEqual(store.filters, defaultFilters)

store.patchFilters({
  confidenceLevel: 'low',
  overviewStatus: 'manual-review',
})
store.setPage(3)

assert.equal(store.filters.confidenceLevel, 'low')
assert.equal(store.filters.overviewStatus, 'manual-review')
assert.equal(store.page, 3)

store.reset()

assert.deepEqual(store.filters, defaultFilters)
assert.equal(store.page, 1)

window.localStorage.setItem(
  storageKey,
  JSON.stringify({
    filters: {
      confidenceLevel: 'low',
      overviewStatus: 'manual-review',
    },
    page: 3,
  }),
)

setActivePinia(createPinia())
const rehydratedStore = useMappingWorkbenchSessionStore()

assert.deepEqual(rehydratedStore.filters, {
  ...defaultFilters,
  confidenceLevel: 'low',
  overviewStatus: 'manual-review',
})
assert.equal(rehydratedStore.page, 3)

window.localStorage.setItem(
  storageKey,
  JSON.stringify({
    filters: {
      overviewStatus: 'manual-review',
    },
  }),
)

setActivePinia(createPinia())
const sanitizedStore = useMappingWorkbenchSessionStore()

assert.deepEqual(sanitizedStore.filters, {
  ...defaultFilters,
  overviewStatus: 'manual-review',
})
assert.equal(sanitizedStore.page, 1)
