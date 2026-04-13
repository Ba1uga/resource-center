import type { QuestionEditorDraft, QuestionValidationErrors } from './question-workbench.types.ts'

export function validateQuestionEditorDraft(draft: QuestionEditorDraft): QuestionValidationErrors {
  const errors: QuestionValidationErrors = {}

  if (draft.subjectId.length === 0) {
    errors.subjectId = '请选择学科。'
  }

  if (draft.chapterId.length === 0) {
    errors.chapterId = '请选择章节。'
  }

  if (draft.stem.trim().length === 0) {
    errors.stem = '请填写题干。'
  }

  switch (draft.type) {
    case 'single':
      validateChoiceQuestion(errors, draft, 1, '单选题必须且只能有 1 个正确答案。')
      break
    case 'multiple':
      validateChoiceQuestion(errors, draft, 2, '多选题至少需要 2 个正确答案。')
      break
    case 'short':
      if (draft.shortAnswer.trim().length === 0) {
        errors.shortAnswer = '请填写参考答案。'
      }

      if (draft.scoringPoints.map((point) => point.trim()).filter((point) => point.length > 0).length === 0) {
        errors.scoringPoints = '评分要点至少填写 1 条。'
      }
      break
    case 'coding':
      if (draft.codingPrompt.trim().length === 0) {
        errors.codingPrompt = '请填写题目描述。'
      }

      if (draft.codingInputDescription.trim().length === 0) {
        errors.codingInputDescription = '请填写输入说明。'
      }

      if (draft.codingOutputDescription.trim().length === 0) {
        errors.codingOutputDescription = '请填写输出说明。'
      }

      if (draft.codingExamples.length === 0) {
        errors.codingExamples = '至少需要 1 组示例。'
      } else if (
        draft.codingExamples.some(
          (example) => example.input.trim().length === 0 || example.output.trim().length === 0,
        )
      ) {
        errors.codingExamples = '每组示例都需要填写输入和输出。'
      }

      if (draft.codingTestCases.length === 0) {
        errors.codingTestCases = '至少需要 1 条测试用例。'
      } else if (
        draft.codingTestCases.some(
          (testCase) => testCase.input.trim().length === 0 || testCase.output.trim().length === 0,
        )
      ) {
        errors.codingTestCases = '每条测试用例都需要填写输入和输出。'
      }

      if (draft.codingReferenceSolution.trim().length === 0) {
        errors.codingReferenceSolution = '请填写参考解法。'
      }
      break
  }

  return errors
}

export function hasQuestionValidationErrors(errors: QuestionValidationErrors): boolean {
  return Object.values(errors).some((value) => Boolean(value))
}

function validateChoiceQuestion(
  errors: QuestionValidationErrors,
  draft: QuestionEditorDraft,
  minimumCorrectCount: number,
  invalidMessage: string,
) {
  const validOptions = draft.choiceOptions.filter((option) => option.text.trim().length > 0)
  const correctCount = draft.choiceOptions.filter((option) => option.correct).length

  if (draft.choiceOptions.length < 2 || draft.choiceOptions.length > 8) {
    errors.choiceOptions = '选择题选项数量需要保持在 2 到 8 个之间。'
    return
  }

  if (validOptions.length !== draft.choiceOptions.length) {
    errors.choiceOptions = '请完整填写所有选项内容。'
    return
  }

  if (minimumCorrectCount === 1) {
    if (correctCount !== 1) {
      errors.choiceOptions = invalidMessage
    }
    return
  }

  if (correctCount < minimumCorrectCount) {
    errors.choiceOptions = invalidMessage
  }
}
