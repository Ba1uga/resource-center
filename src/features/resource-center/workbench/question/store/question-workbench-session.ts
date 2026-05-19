import { defineStore } from 'pinia'

import { createDefaultQuestionQueryState } from '../model/question-workbench.view-model.ts'
import {
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../shared/store/workbench-session-storage.ts'

import type { QuestionQueryState } from '../model/question-workbench.types.ts'

const QUESTION_DRAFT_STORAGE_KEY = 'question-session:draft'
const QUESTION_ACTIVE_STORAGE_KEY = 'question-session:active'
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

const loadQuestionState = (key: string): QuestionQueryState =>
  sanitizeQuestionState(loadWorkbenchSessionState<QuestionSessionState>(key, createPersistedQuestionState()))

const createDefaultState = (): {
  queryDraft: QuestionQueryState
  activeQuery: QuestionQueryState
} => ({
  queryDraft: loadQuestionState(QUESTION_DRAFT_STORAGE_KEY),
  activeQuery: loadQuestionState(QUESTION_ACTIVE_STORAGE_KEY),
})

export const useQuestionWorkbenchSessionStore = defineStore('question-workbench-session', {
  state: createDefaultState,
  actions: {
    patchQueryDraft(patch: Partial<QuestionQueryState>) {
      this.queryDraft = {
        ...this.queryDraft,
        ...patch,
      }
      saveWorkbenchSessionState(QUESTION_DRAFT_STORAGE_KEY, this.queryDraft)
    },
    patchQuery(patch: Partial<QuestionQueryState>) {
      this.activeQuery = {
        ...this.activeQuery,
        ...patch,
      }
      saveWorkbenchSessionState(QUESTION_ACTIVE_STORAGE_KEY, this.activeQuery)
    },
    reset() {
      this.queryDraft = createDefaultQuestionQueryState()
      this.activeQuery = createDefaultQuestionQueryState()
      saveWorkbenchSessionState(QUESTION_DRAFT_STORAGE_KEY, this.queryDraft)
      saveWorkbenchSessionState(QUESTION_ACTIVE_STORAGE_KEY, this.activeQuery)
    },
  },
})
