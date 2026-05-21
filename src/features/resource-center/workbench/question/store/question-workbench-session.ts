import { defineStore } from 'pinia'

import { createDefaultQuestionQueryState } from '../model/question-workbench.view-model.ts'
import {
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../shared/store/workbench-session-storage.ts'

import type { QuestionQueryState } from '../model/question-workbench.types.ts'

const QUESTION_STORAGE_KEY = 'question-session:query'
type QuestionSessionState = QuestionQueryState & Record<string, unknown>
const questionTypeFilters = new Set<QuestionQueryState['type']>(['all', 'single', 'multiple', 'short', 'coding'])
const questionDifficultyFilters = new Set<QuestionQueryState['difficulty']>(['all', 'easy', 'medium', 'hard'])
const questionStatusFilters = new Set<QuestionQueryState['status']>(['all', 'draft', 'published'])
const questionSortByValues = new Set<QuestionQueryState['sortBy']>(['updatedAt'])
const questionSortOrderValues = new Set<QuestionQueryState['sortOrder']>(['asc', 'desc'])

const createPersistedQuestionState = (): QuestionSessionState =>
  createDefaultQuestionQueryState() as QuestionSessionState

const sanitizeString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

const sanitizeNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const sanitizePositiveInteger = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback

const sanitizeEnum = <TValue extends string>(
  value: unknown,
  allowedValues: Set<TValue>,
  fallback: TValue,
): TValue => (typeof value === 'string' && allowedValues.has(value as TValue) ? (value as TValue) : fallback)

const sanitizeQuestionState = (value: unknown): QuestionQueryState => {
  const fallback = createDefaultQuestionQueryState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<QuestionSessionState>

  return {
    subjectId: sanitizeString(candidate.subjectId, fallback.subjectId),
    chapterId: sanitizeString(candidate.chapterId, fallback.chapterId),
    type: sanitizeEnum(candidate.type, questionTypeFilters, fallback.type),
    difficulty: sanitizeEnum(candidate.difficulty, questionDifficultyFilters, fallback.difficulty),
    status: sanitizeEnum(candidate.status, questionStatusFilters, fallback.status),
    keyword: sanitizeString(candidate.keyword, fallback.keyword),
    page: sanitizePositiveInteger(candidate.page, fallback.page),
    pageSize: sanitizePositiveInteger(candidate.pageSize, fallback.pageSize),
    sortBy: sanitizeEnum(candidate.sortBy, questionSortByValues, fallback.sortBy),
    sortOrder: sanitizeEnum(candidate.sortOrder, questionSortOrderValues, fallback.sortOrder),
  }
}

const loadQuestionState = (): QuestionQueryState =>
  sanitizeQuestionState(loadWorkbenchSessionState<QuestionSessionState>(QUESTION_STORAGE_KEY, createPersistedQuestionState()))

const createDefaultState = (): {
  query: QuestionQueryState
} => ({
  query: loadQuestionState(),
})

export const useQuestionWorkbenchSessionStore = defineStore('question-workbench-session', {
  state: createDefaultState,
  actions: {
    patchQuery(patch: Partial<QuestionQueryState>) {
      this.query = {
        ...this.query,
        ...patch,
      }
      saveWorkbenchSessionState(QUESTION_STORAGE_KEY, this.query)
    },
    reset() {
      this.query = createDefaultQuestionQueryState()
      saveWorkbenchSessionState(QUESTION_STORAGE_KEY, this.query)
    },
  },
})
