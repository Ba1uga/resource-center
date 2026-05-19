import assert from 'node:assert/strict'

import {
  createInMemoryWorkbenchStorage,
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../../../src/features/resource-center/workbench/shared/store/workbench-session-storage.ts'

const storage = createInMemoryWorkbenchStorage()

assert.equal(storage.getItem('resource-center:missing'), null)

const fallback = {
  page: 1,
  keyword: '',
  filters: ['draft'],
  advanced: { owner: 'system', visibleColumns: ['title', 'status'] },
}
const missingState = loadWorkbenchSessionState('missing', fallback, storage)
assert.deepEqual(missingState, fallback)
assert.notEqual(missingState, fallback)
assert.notEqual(missingState.filters, fallback.filters)
assert.notEqual(missingState.advanced, fallback.advanced)
assert.notEqual(missingState.advanced.visibleColumns, fallback.advanced.visibleColumns)

missingState.filters.push('published')
missingState.advanced.visibleColumns.push('updatedAt')
assert.deepEqual(fallback.filters, ['draft'])
assert.deepEqual(fallback.advanced.visibleColumns, ['title', 'status'])

saveWorkbenchSessionState('video', { page: 3, keyword: 'network' }, storage)
const persistedState = loadWorkbenchSessionState('video', fallback, storage)
assert.deepEqual(persistedState, {
  page: 3,
  keyword: 'network',
  filters: ['draft'],
  advanced: { owner: 'system', visibleColumns: ['title', 'status'] },
})
assert.notEqual(persistedState.filters, fallback.filters)
assert.notEqual(persistedState.advanced, fallback.advanced)
assert.notEqual(persistedState.advanced.visibleColumns, fallback.advanced.visibleColumns)

storage.setItem('resource-center:video', '{not-json')
const brokenJsonState = loadWorkbenchSessionState('video', fallback, storage)
assert.deepEqual(brokenJsonState, fallback)
assert.notEqual(brokenJsonState, fallback)

const throwingStorage = {
  getItem() {
    throw new Error('read failed')
  },
  setItem() {
    throw new Error('write failed')
  },
}

const throwingStorageState = loadWorkbenchSessionState('video', fallback, throwingStorage)
assert.deepEqual(throwingStorageState, fallback)
assert.notEqual(throwingStorageState, fallback)

assert.doesNotThrow(() => saveWorkbenchSessionState('video', { page: 2 }, throwingStorage))
