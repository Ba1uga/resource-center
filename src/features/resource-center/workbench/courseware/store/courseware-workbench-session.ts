import { defineStore } from 'pinia'

import { createDefaultCoursewareFilterState } from '../model/courseware-workbench.view-model.ts'
import {
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../shared/store/workbench-session-storage.ts'

import type { CoursewareFilterState } from '../model/courseware-workbench.types.ts'

const COURSEWARE_SESSION_STORAGE_KEY = 'courseware-session:list'
const coursewareTypeFilters = new Set<CoursewareFilterState['type']>(['all', 'PPT', 'PDF', 'DOC'])

interface CoursewareWorkbenchSessionState {
  filters: CoursewareFilterState
  page: number
}
type PersistedCoursewareWorkbenchSessionState = CoursewareWorkbenchSessionState & Record<string, unknown>

const createDefaultState = (): CoursewareWorkbenchSessionState => ({
  filters: createDefaultCoursewareFilterState(),
  page: 1,
})

const sanitizeString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

const sanitizePageNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback

const sanitizeCoursewareFilterState = (value: unknown): CoursewareFilterState => {
  const fallback = createDefaultCoursewareFilterState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<CoursewareFilterState>

  return {
    keyword: sanitizeString(candidate.keyword, fallback.keyword),
    course: sanitizeString(candidate.course, fallback.course),
    type:
      typeof candidate.type === 'string' && coursewareTypeFilters.has(candidate.type)
        ? candidate.type
        : fallback.type,
  }
}

const sanitizeSessionState = (value: unknown): CoursewareWorkbenchSessionState => {
  const fallback = createDefaultState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<PersistedCoursewareWorkbenchSessionState>

  return {
    filters: sanitizeCoursewareFilterState(candidate.filters),
    page: sanitizePageNumber(candidate.page, fallback.page),
  }
}

const loadState = (): CoursewareWorkbenchSessionState =>
  sanitizeSessionState(
    loadWorkbenchSessionState<PersistedCoursewareWorkbenchSessionState>(
      COURSEWARE_SESSION_STORAGE_KEY,
      createDefaultState() as PersistedCoursewareWorkbenchSessionState,
    ),
  )

export const useCoursewareWorkbenchSessionStore = defineStore('courseware-workbench-session', {
  state: loadState,
  actions: {
    patchFilters(patch: Partial<CoursewareFilterState>) {
      this.filters = {
        ...this.filters,
        ...patch,
      }
      this.page = 1
      saveWorkbenchSessionState(COURSEWARE_SESSION_STORAGE_KEY, {
        filters: this.filters,
        page: this.page,
      })
    },
    setPage(page: number) {
      this.page = page
      saveWorkbenchSessionState(COURSEWARE_SESSION_STORAGE_KEY, {
        filters: this.filters,
        page: this.page,
      })
    },
    reset() {
      this.filters = createDefaultCoursewareFilterState()
      this.page = 1
      saveWorkbenchSessionState(COURSEWARE_SESSION_STORAGE_KEY, {
        filters: this.filters,
        page: this.page,
      })
    },
  },
})
