import assert from 'node:assert/strict'

import {
  createInMemoryWorkbenchStorage,
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../../../src/features/resource-center/workbench/shared/store/workbench-session-storage.ts'

const storage = createInMemoryWorkbenchStorage()

assert.equal(storage.getItem('resource-center:missing'), null)

const fallback = { page: 1, keyword: '', filters: ['draft'] }
const missingState = loadWorkbenchSessionState('missing', fallback, storage)
assert.deepEqual(missingState, fallback)
assert.notEqual(missingState, fallback)

saveWorkbenchSessionState('video', { page: 3, keyword: 'network' }, storage)
assert.deepEqual(loadWorkbenchSessionState('video', fallback, storage), {
  page: 3,
  keyword: 'network',
  filters: ['draft'],
})

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
