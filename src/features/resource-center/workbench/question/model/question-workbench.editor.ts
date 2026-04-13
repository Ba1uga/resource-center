import { getQuestionChapterOptions, questionWorkbenchSubjectOptions } from './question-workbench.fixtures.ts'

import type {
  CodingExample,
  CodingTestCase,
  QuestionChoiceOption,
  QuestionEditorDraft,
  QuestionMutationInput,
  QuestionRecord,
  QuestionType,
} from './question-workbench.types.ts'

export function createQuestionEditorDraft(overrides: Partial<QuestionEditorDraft> = {}): QuestionEditorDraft {
  const subjectId = overrides.subjectId ?? questionWorkbenchSubjectOptions[0]?.id ?? ''
  const chapterId = overrides.chapterId ?? getQuestionChapterOptions(subjectId)[0]?.id ?? ''

  return {
    type: overrides.type ?? 'single',
    subjectId,
    chapterId,
    difficulty: overrides.difficulty ?? 'easy',
    status: overrides.status ?? 'draft',
    stem: overrides.stem ?? '',
    knowledgePoint: overrides.knowledgePoint ?? '',
    analysis: overrides.analysis ?? '',
    choiceOptions: cloneChoiceOptions(overrides.choiceOptions ?? createDefaultChoiceOptions()),
    shortAnswer: overrides.shortAnswer ?? '',
    scoringPoints: cloneStringList(overrides.scoringPoints ?? ['']),
    codingPrompt: overrides.codingPrompt ?? '',
    codingInputDescription: overrides.codingInputDescription ?? '',
    codingOutputDescription: overrides.codingOutputDescription ?? '',
    codingExamples: cloneCodingExamples(overrides.codingExamples ?? [createEmptyCodingExample(1)]),
    codingTestCases: cloneCodingTestCases(overrides.codingTestCases ?? [createEmptyCodingTestCase(1)]),
    codingReferenceSolution: overrides.codingReferenceSolution ?? '',
  }
}

export function createQuestionEditorDraftFromRecord(record: QuestionRecord): QuestionEditorDraft {
  switch (record.type) {
    case 'single':
    case 'multiple':
      return createQuestionEditorDraft({
        type: record.type,
        subjectId: record.subjectId,
        chapterId: record.chapterId,
        difficulty: record.difficulty,
        status: record.status,
        stem: record.stem,
        knowledgePoint: record.knowledgePoint,
        analysis: record.analysis,
        choiceOptions: record.content.options,
      })
    case 'short':
      return createQuestionEditorDraft({
        type: record.type,
        subjectId: record.subjectId,
        chapterId: record.chapterId,
        difficulty: record.difficulty,
        status: record.status,
        stem: record.stem,
        knowledgePoint: record.knowledgePoint,
        analysis: record.analysis,
        shortAnswer: record.content.answer,
        scoringPoints: record.content.scoringPoints,
      })
    case 'coding':
      return createQuestionEditorDraft({
        type: record.type,
        subjectId: record.subjectId,
        chapterId: record.chapterId,
        difficulty: record.difficulty,
        status: record.status,
        stem: record.stem,
        knowledgePoint: record.knowledgePoint,
        analysis: record.analysis,
        codingPrompt: record.content.prompt,
        codingInputDescription: record.content.inputDescription,
        codingOutputDescription: record.content.outputDescription,
        codingExamples: record.content.examples,
        codingTestCases: record.content.testCases,
        codingReferenceSolution: record.content.referenceSolution,
      })
  }
}

export function setQuestionDraftType(draft: QuestionEditorDraft, type: QuestionType): QuestionEditorDraft {
  return createQuestionEditorDraft({
    ...draft,
    type,
  })
}

export function createQuestionMutationInputFromDraft(draft: QuestionEditorDraft): QuestionMutationInput {
  const commonFields = {
    type: draft.type,
    subjectId: draft.subjectId,
    chapterId: draft.chapterId,
    difficulty: draft.difficulty,
    status: draft.status,
    stem: draft.stem.trim(),
    knowledgePoint: draft.knowledgePoint.trim(),
    analysis: draft.analysis.trim(),
  }

  switch (draft.type) {
    case 'single':
    case 'multiple':
      return {
        ...commonFields,
        type: draft.type,
        content: {
          options: cloneChoiceOptions(draft.choiceOptions).map((option) => ({
            ...option,
            text: option.text.trim(),
          })),
        },
      }
    case 'short':
      return {
        ...commonFields,
        type: 'short',
        content: {
          answer: draft.shortAnswer.trim(),
          scoringPoints: draft.scoringPoints.map((point) => point.trim()).filter((point) => point.length > 0),
        },
      }
    case 'coding':
      return {
        ...commonFields,
        type: 'coding',
        content: {
          prompt: draft.codingPrompt.trim(),
          inputDescription: draft.codingInputDescription.trim(),
          outputDescription: draft.codingOutputDescription.trim(),
          examples: cloneCodingExamples(draft.codingExamples).map((example) => ({
            ...example,
            input: example.input.trim(),
            output: example.output.trim(),
            explanation: example.explanation.trim(),
          })),
          testCases: cloneCodingTestCases(draft.codingTestCases).map((testCase) => ({
            ...testCase,
            input: testCase.input.trim(),
            output: testCase.output.trim(),
          })),
          referenceSolution: draft.codingReferenceSolution.trim(),
        },
      }
  }
}

function createDefaultChoiceOptions(): QuestionChoiceOption[] {
  return [
    { key: 'A', text: '', correct: true },
    { key: 'B', text: '', correct: false },
    { key: 'C', text: '', correct: false },
    { key: 'D', text: '', correct: false },
  ]
}

export function createEmptyCodingExample(index: number): CodingExample {
  return {
    id: `example-${index}`,
    input: '',
    output: '',
    explanation: '',
  }
}

export function createEmptyCodingTestCase(index: number): CodingTestCase {
  return {
    id: `test-${index}`,
    input: '',
    output: '',
  }
}

function cloneChoiceOptions(options: QuestionChoiceOption[]): QuestionChoiceOption[] {
  return options.map((option) => ({ ...option }))
}

function cloneCodingExamples(examples: CodingExample[]): CodingExample[] {
  return examples.map((example) => ({ ...example }))
}

function cloneCodingTestCases(testCases: CodingTestCase[]): CodingTestCase[] {
  return testCases.map((testCase) => ({ ...testCase }))
}

function cloneStringList(values: string[]): string[] {
  return [...values]
}
