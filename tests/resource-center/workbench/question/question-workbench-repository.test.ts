import assert from 'node:assert/strict'

import { createQuestionEditorDraft, createQuestionMutationInputFromDraft } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.editor.ts'
import { createQuestionWorkbenchRepository } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.repository.ts'
import { createDefaultQuestionQueryState } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.view-model.ts'

const repository = createQuestionWorkbenchRepository({
  now: () => '2026-04-11T09:30:00.000Z',
  createId: (() => {
    let index = 100
    return () => `question-${index++}`
  })(),
})

const defaultQuery = createDefaultQuestionQueryState()
const defaultPage = repository.listQuestions(defaultQuery)

assert.equal(defaultPage.total, 12)
assert.equal(defaultPage.records.length, 10)
assert.equal(defaultPage.records[0]?.id, 'question-12')

const searchedPage = repository.listQuestions({
  ...defaultQuery,
  keyword: '变量名',
})

assert.equal(searchedPage.total, 1)
assert.equal(searchedPage.records[0]?.id, 'question-09')

const createDraft = createQuestionEditorDraft({
  type: 'short',
  subjectId: 'math',
  chapterId: 'math-functions',
  difficulty: 'medium',
  status: 'draft',
  stem: '简述反比例函数图像的主要特征。',
  knowledgePoint: '反比例函数',
  analysis: '关注象限分布与增减性。',
  shortAnswer: '图像位于双曲线的两个分支，且不与坐标轴相交。',
  scoringPoints: ['指出图像是双曲线', '说明所在象限与 k 的符号有关'],
})

const createdRecord = repository.createQuestion(createQuestionMutationInputFromDraft(createDraft))
assert.equal(createdRecord.id, 'question-100')
assert.equal(createdRecord.updatedAt, '2026-04-11T09:30:00.000Z')
assert.equal(createdRecord.type, 'short')

const afterCreatePage = repository.listQuestions(defaultQuery)
assert.equal(afterCreatePage.total, 13)
assert.equal(afterCreatePage.records[0]?.id, 'question-100')

const updatedRecord = repository.updateQuestion('question-09', {
  ...createQuestionMutationInputFromDraft(
    createQuestionEditorDraft({
      type: 'multiple',
      subjectId: 'it',
      chapterId: 'it-syntax',
      difficulty: 'hard',
      status: 'published',
      stem: '以下哪些变量名符合 Python 标识符规则？',
      knowledgePoint: '变量与命名',
      analysis: '关键字、数字开头和连字符都不合法。',
      choiceOptions: [
        { key: 'A', text: 'score_total', correct: true },
        { key: 'B', text: '2ndValue', correct: false },
        { key: 'C', text: '_cache', correct: true },
        { key: 'D', text: 'user-name', correct: false },
      ],
    }),
  ),
})

assert.equal(updatedRecord.id, 'question-09')
assert.equal(updatedRecord.updatedAt, '2026-04-11T09:30:00.000Z')
assert.equal(updatedRecord.difficulty, 'hard')
assert.equal(updatedRecord.status, 'published')

const deletedResult = repository.deleteQuestion('question-01')
assert.equal(deletedResult.deleted?.id, 'question-01')
assert.equal(repository.listQuestions(defaultQuery).total, 12)
