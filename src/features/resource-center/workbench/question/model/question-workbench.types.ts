export type QuestionChoiceType = 'single' | 'multiple'
export type QuestionType = QuestionChoiceType | 'short' | 'coding'
export type QuestionTypeFilter = 'all' | QuestionType
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionDifficultyFilter = 'all' | QuestionDifficulty
export type QuestionStatus = 'draft' | 'published'
export type QuestionSortBy = 'updatedAt'
export type QuestionSortOrder = 'asc' | 'desc'
export type QuestionEditorMode = 'create' | 'edit' | 'copy'

export interface QuestionSelectOption {
  id: string
  label: string
}

export interface QuestionChapterOption extends QuestionSelectOption {
  subjectId: string
}

export interface QuestionFilterOption<TValue extends string> {
  value: TValue
  label: string
}

export interface QuestionChoiceOption {
  key: string
  text: string
  correct: boolean
}

export interface CodingExample {
  id: string
  input: string
  output: string
  explanation: string
}

export interface CodingTestCase {
  id: string
  input: string
  output: string
}

export interface ChoiceQuestionPayload {
  options: QuestionChoiceOption[]
}

export interface ShortQuestionPayload {
  answer: string
  scoringPoints: string[]
}

export interface CodingQuestionPayload {
  prompt: string
  inputDescription: string
  outputDescription: string
  examples: CodingExample[]
  testCases: CodingTestCase[]
  referenceSolution: string
}

export interface QuestionRecordBase {
  id: string
  type: QuestionType
  subjectId: string
  chapterId: string
  difficulty: QuestionDifficulty
  status: QuestionStatus
  stem: string
  knowledgePoint: string
  analysis: string
  updatedAt: string
}

export interface QuestionChoiceRecord extends QuestionRecordBase {
  type: QuestionChoiceType
  content: ChoiceQuestionPayload
}

export interface QuestionShortRecord extends QuestionRecordBase {
  type: 'short'
  content: ShortQuestionPayload
}

export interface QuestionCodingRecord extends QuestionRecordBase {
  type: 'coding'
  content: CodingQuestionPayload
}

export type QuestionRecord = QuestionChoiceRecord | QuestionShortRecord | QuestionCodingRecord

export type QuestionChoiceMutationInput = Omit<QuestionChoiceRecord, 'id' | 'updatedAt'>
export type QuestionShortMutationInput = Omit<QuestionShortRecord, 'id' | 'updatedAt'>
export type QuestionCodingMutationInput = Omit<QuestionCodingRecord, 'id' | 'updatedAt'>
export type QuestionMutationInput =
  | QuestionChoiceMutationInput
  | QuestionShortMutationInput
  | QuestionCodingMutationInput

export interface QuestionQueryState {
  subjectId: string
  chapterId: string
  type: QuestionTypeFilter
  difficulty: QuestionDifficultyFilter
  keyword: string
  page: number
  pageSize: number
  sortBy: QuestionSortBy
  sortOrder: QuestionSortOrder
}

export interface QuestionListResult {
  records: QuestionRecord[]
  total: number
  allTotal: number
  matchingPublishedTotal: number
  matchingLatestUpdatedAt: string | null
  page: number
  pageSize: number
}

export interface QuestionDeleteResult {
  deleted?: QuestionRecord
  total: number
}

export interface QuestionListRow {
  id: string
  type: QuestionType
  typeLabel: string
  subjectLabel: string
  chapterLabel: string
  difficulty: QuestionDifficulty
  difficultyLabel: string
  status: QuestionStatus
  statusLabel: string
  stem: string
  knowledgePoint: string
  updatedAt: string
  updatedAtLabel: string
}

export interface QuestionPaginationState {
  page: number
  pageSize: number
  total: number
  pageCount: number
  hasPrev: boolean
  hasNext: boolean
  from: number
  to: number
}

export interface QuestionWorkbenchSummary {
  totalLabel: string
  filteredLabel: string
  activeFilterCount: number
  matchingTotal: number
  publishedTotal: number
  latestUpdatedAtLabel: string
  latestUpdatedHint: string
}

export interface QuestionEmptyState {
  kind: 'empty' | 'filtered'
  title: string
  description: string
}

export interface QuestionWorkbenchViewModel {
  subjectOptions: QuestionSelectOption[]
  chapterOptions: QuestionSelectOption[]
  typeOptions: QuestionFilterOption<QuestionTypeFilter>[]
  difficultyOptions: QuestionFilterOption<QuestionDifficultyFilter>[]
  rows: QuestionListRow[]
  records: QuestionRecord[]
  pagination: QuestionPaginationState
  summary: QuestionWorkbenchSummary
  chapterDisabled: boolean
  emptyState: QuestionEmptyState | null
}

export interface QuestionEditorDraft {
  type: QuestionType
  subjectId: string
  chapterId: string
  difficulty: QuestionDifficulty
  status: QuestionStatus
  stem: string
  knowledgePoint: string
  analysis: string
  choiceOptions: QuestionChoiceOption[]
  shortAnswer: string
  scoringPoints: string[]
  codingPrompt: string
  codingInputDescription: string
  codingOutputDescription: string
  codingExamples: CodingExample[]
  codingTestCases: CodingTestCase[]
  codingReferenceSolution: string
}

export type QuestionValidationField =
  | 'subjectId'
  | 'chapterId'
  | 'stem'
  | 'choiceOptions'
  | 'shortAnswer'
  | 'scoringPoints'
  | 'codingPrompt'
  | 'codingInputDescription'
  | 'codingOutputDescription'
  | 'codingExamples'
  | 'codingTestCases'
  | 'codingReferenceSolution'

export type QuestionValidationErrors = Partial<Record<QuestionValidationField, string>>
