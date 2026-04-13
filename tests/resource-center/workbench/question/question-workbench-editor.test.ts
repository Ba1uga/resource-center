import assert from 'node:assert/strict'

import {
  createQuestionEditorDraft,
  createQuestionEditorDraftFromRecord,
  createQuestionMutationInputFromDraft,
  setQuestionDraftType,
} from '../../../../src/features/resource-center/workbench/question/model/question-workbench.editor.ts'
import { createQuestionWorkbenchRepository } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.repository.ts'

const repository = createQuestionWorkbenchRepository()
const sourceRecord = repository.listQuestions({
  subjectId: '',
  chapterId: '',
  type: 'all',
  difficulty: 'all',
  keyword: '',
  page: 1,
  pageSize: 10,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
}).records[0]

assert.ok(sourceRecord)

const copiedDraft = createQuestionEditorDraftFromRecord(sourceRecord!)
assert.equal(copiedDraft.type, sourceRecord!.type)
assert.equal(copiedDraft.stem, sourceRecord!.stem)
assert.equal(copiedDraft.subjectId, sourceRecord!.subjectId)

const blankDraft = createQuestionEditorDraft({
  type: 'single',
  subjectId: 'math',
  chapterId: 'math-functions',
  difficulty: 'easy',
  status: 'draft',
  stem: '函数图像经过点 (0, 1)。',
  knowledgePoint: '一次函数',
  analysis: '先看截距。',
})
const switchedDraft = setQuestionDraftType(blankDraft, 'coding')

assert.equal(switchedDraft.type, 'coding')
assert.equal(switchedDraft.subjectId, 'math')
assert.equal(switchedDraft.chapterId, 'math-functions')
assert.equal(switchedDraft.stem, '函数图像经过点 (0, 1)。')
assert.equal(switchedDraft.choiceOptions.length, 4)
assert.equal(switchedDraft.codingExamples.length, 1)

const mutationInput = createQuestionMutationInputFromDraft(switchedDraft)
assert.equal(mutationInput.type, 'coding')
assert.equal(mutationInput.subjectId, 'math')
