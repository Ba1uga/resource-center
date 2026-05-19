import { defineStore } from 'pinia'

import { createDefaultCoursewareFilterState } from '../model/courseware-workbench.view-model.ts'
import {
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../shared/store/workbench-session-storage.ts'

import type { CoursewareFilterState } from '../model/courseware-workbench.types.ts'

const COURSEWARE_SESSION_STORAGE_KEY = 'courseware-session:list'

interface CoursewareWorkbenchSessionState {
  filters: CoursewareFilterState
  page: number
}
type PersistedCoursewareWorkbenchSessionState = CoursewareWorkbenchSessionState & Record<string, unknown>

const createDefaultState = (): CoursewareWorkbenchSessionState => ({
  filters: createDefaultCoursewareFilterState(),
  page: 1,
})

const loadState = () =>
  loadWorkbenchSessionState<PersistedCoursewareWorkbenchSessionState>(
    COURSEWARE_SESSION_STORAGE_KEY,
    createDefaultState() as PersistedCoursewareWorkbenchSessionState,
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
