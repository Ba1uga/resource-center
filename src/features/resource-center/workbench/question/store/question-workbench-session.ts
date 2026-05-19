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

const createPersistedQuestionState = (): QuestionSessionState =>
  createDefaultQuestionQueryState() as QuestionSessionState

const loadQuestionState = (key: string): QuestionQueryState =>
  loadWorkbenchSessionState<QuestionSessionState>(key, createPersistedQuestionState()) as QuestionQueryState

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
