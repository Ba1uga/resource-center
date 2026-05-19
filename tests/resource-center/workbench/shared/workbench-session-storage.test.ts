import assert from 'node:assert/strict'

import {
  createInMemoryWorkbenchStorage,
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../../../src/features/resource-center/workbench/shared/store/workbench-session-storage.ts'

const storage = createInMemoryWorkbenchStorage()

assert.equal(storage.getItem('resource-center:missing'), null)

const fallback = { page: 1, keyword: '', filters: ['draft'] }
assert.deepEqual(loadWorkbenchSessionState('missing', fallback, storage), fallback)

saveWorkbenchSessionState('video', { page: 3, keyword: 'network' }, storage)
assert.deepEqual(loadWorkbenchSessionState('video', fallback, storage), {
  page: 3,
  keyword: 'network',
  filters: ['draft'],
})

storage.setItem('resource-center:video', '{not-json')
assert.deepEqual(loadWorkbenchSessionState('video', fallback, storage), fallback)
