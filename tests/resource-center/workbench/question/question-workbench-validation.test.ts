import assert from 'node:assert/strict'

import { createQuestionEditorDraft, setQuestionDraftType } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.editor.ts'
import {
  hasQuestionValidationErrors,
  validateQuestionEditorDraft,
} from '../../../../src/features/resource-center/workbench/question/model/question-workbench.validation.ts'

const singleDraft = createQuestionEditorDraft({
  type: 'single',
  subjectId: 'math',
  chapterId: 'math-functions',
  difficulty: 'medium',
  status: 'draft',
  stem: '一次函数 y = kx + b 中，k 表示什么？',
  knowledgePoint: '一次函数',
  analysis: '关注斜率。',
  choiceOptions: [
    { key: 'A', text: '斜率', correct: true },
    { key: 'B', text: '截距', correct: true },
  ],
})

const singleErrors = validateQuestionEditorDraft(singleDraft)
assert.equal(hasQuestionValidationErrors(singleErrors), true)
assert.match(singleErrors.choiceOptions ?? '', /单选题必须且只能有 1 个正确答案/)

const multipleDraft = createQuestionEditorDraft({
  type: 'multiple',
  subjectId: 'it',
  chapterId: 'it-syntax',
  difficulty: 'medium',
  status: 'draft',
  stem: '以下哪些写法属于合法变量名？',
  knowledgePoint: '变量名',
  analysis: '注意命名规则。',
  choiceOptions: [
    { key: 'A', text: 'score_total', correct: true },
    { key: 'B', text: '2ndValue', correct: false },
  ],
})

const multipleErrors = validateQuestionEditorDraft(multipleDraft)
assert.match(multipleErrors.choiceOptions ?? '', /多选题至少需要 2 个正确答案/)

const shortDraft = setQuestionDraftType(singleDraft, 'short')
shortDraft.shortAnswer = '斜率决定直线倾斜方向。'
shortDraft.scoringPoints = ['   ']

const shortErrors = validateQuestionEditorDraft(shortDraft)
assert.match(shortErrors.scoringPoints ?? '', /评分要点至少填写 1 条/)

const codingDraft = setQuestionDraftType(singleDraft, 'coding')
codingDraft.codingPrompt = '编写函数统计每个章节下的习题数量。'
codingDraft.codingInputDescription = '输入一个习题数组。'
codingDraft.codingOutputDescription = '输出章节和数量映射。'
codingDraft.codingExamples = []
codingDraft.codingTestCases = []
codingDraft.codingReferenceSolution = ''

const codingErrors = validateQuestionEditorDraft(codingDraft)
assert.match(codingErrors.codingExamples ?? '', /至少需要 1 组示例/)
assert.match(codingErrors.codingTestCases ?? '', /至少需要 1 条测试用例/)
assert.match(codingErrors.codingReferenceSolution ?? '', /请填写参考解法/)
