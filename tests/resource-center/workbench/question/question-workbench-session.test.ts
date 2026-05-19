import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { createDefaultQuestionQueryState } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.view-model.ts'
import { useQuestionWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/question/store/question-workbench-session.ts'

const defaultQueryState = createDefaultQuestionQueryState()
const storageKeyPrefix = 'resource-center:'

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

const store = useQuestionWorkbenchSessionStore()

assert.deepEqual(store.queryDraft, defaultQueryState)
assert.deepEqual(store.activeQuery, defaultQueryState)

store.patchQueryDraft({
  subjectId: 'network',
  keyword: 'tcp',
})

assert.equal(store.queryDraft.subjectId, 'network')
assert.equal(store.queryDraft.keyword, 'tcp')

store.patchQuery({
  subjectId: 'network',
  page: 3,
})

assert.equal(store.activeQuery.subjectId, 'network')
assert.equal(store.activeQuery.page, 3)

store.reset()

assert.deepEqual(store.queryDraft, defaultQueryState)
assert.deepEqual(store.activeQuery, defaultQueryState)

window.localStorage.setItem(
  `${storageKeyPrefix}question-session:draft`,
  JSON.stringify({
    subjectId: 'network',
    keyword: 'tcp',
    page: 0,
    pageSize: 0,
  }),
)
window.localStorage.setItem(
  `${storageKeyPrefix}question-session:active`,
  JSON.stringify({
    page: -1,
    pageSize: 20,
    sortOrder: 'asc',
    status: null,
  }),
)

setActivePinia(createPinia())
const rehydratedStore = useQuestionWorkbenchSessionStore()

assert.deepEqual(rehydratedStore.queryDraft, {
  ...defaultQueryState,
  subjectId: 'network',
  keyword: 'tcp',
  page: 1,
  pageSize: 10,
})
assert.deepEqual(rehydratedStore.activeQuery, {
  ...defaultQueryState,
  page: 1,
  pageSize: 20,
  sortOrder: 'asc',
  status: 'all',
})
