import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'

import { createDefaultQuestionQueryState } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.view-model.ts'
import { useQuestionWorkbenchSessionStore } from '../../../../src/features/resource-center/workbench/question/store/question-workbench-session.ts'

setActivePinia(createPinia())

const store = useQuestionWorkbenchSessionStore()
const defaultQueryState = createDefaultQuestionQueryState()

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
