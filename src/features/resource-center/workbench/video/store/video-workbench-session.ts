import { defineStore } from 'pinia'

import { createDefaultVideoFilterState } from '../model/video-workbench.view-model.ts'
import {
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../shared/store/workbench-session-storage.ts'

import type { VideoFilterState } from '../model/video-workbench.types.ts'

const VIDEO_SESSION_STORAGE_KEY = 'video-session:list'
const videoOverviewStatuses = new Set<VideoFilterState['overviewStatus']>([
  'all',
  'draft',
  'uploading',
  'transcoding',
  'published',
  'offline',
  'failed',
])
const videoProcessingStatuses = new Set<VideoFilterState['processingStatus']>([
  'all',
  'uploading',
  'transcoding',
  'ready',
  'failed',
])
const videoPublishStatuses = new Set<VideoFilterState['publishStatus']>(['all', 'draft', 'published', 'offline'])

interface VideoWorkbenchSessionState {
  filters: VideoFilterState
  page: number
}
type PersistedVideoWorkbenchSessionState = VideoWorkbenchSessionState & Record<string, unknown>

const createDefaultState = (): VideoWorkbenchSessionState => ({
  filters: createDefaultVideoFilterState(),
  page: 1,
})

const sanitizeString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

const sanitizePositiveInteger = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback

const sanitizeEnum = <TValue extends string>(
  value: unknown,
  allowedValues: Set<TValue>,
  fallback: TValue,
): TValue => (typeof value === 'string' && allowedValues.has(value as TValue) ? (value as TValue) : fallback)

const sanitizeVideoFilterState = (value: unknown): VideoFilterState => {
  const fallback = createDefaultVideoFilterState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<VideoFilterState>

  return {
    keyword: sanitizeString(candidate.keyword, fallback.keyword),
    course: sanitizeString(candidate.course, fallback.course),
    chapter: sanitizeString(candidate.chapter, fallback.chapter),
    overviewStatus: sanitizeEnum(candidate.overviewStatus, videoOverviewStatuses, fallback.overviewStatus),
    processingStatus: sanitizeEnum(candidate.processingStatus, videoProcessingStatuses, fallback.processingStatus),
    publishStatus: sanitizeEnum(candidate.publishStatus, videoPublishStatuses, fallback.publishStatus),
    uploadedBy: sanitizeString(candidate.uploadedBy, fallback.uploadedBy),
    uploadedFrom: sanitizeString(candidate.uploadedFrom, fallback.uploadedFrom),
    uploadedTo: sanitizeString(candidate.uploadedTo, fallback.uploadedTo),
  }
}

const sanitizeSessionState = (value: unknown): VideoWorkbenchSessionState => {
  const fallback = createDefaultState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<PersistedVideoWorkbenchSessionState>

  return {
    filters: sanitizeVideoFilterState(candidate.filters),
    page: sanitizePositiveInteger(candidate.page, fallback.page),
  }
}

const persistState = (state: VideoWorkbenchSessionState) => {
  saveWorkbenchSessionState(VIDEO_SESSION_STORAGE_KEY, {
    filters: state.filters,
    page: state.page,
  })
}

const loadState = (): VideoWorkbenchSessionState =>
  sanitizeSessionState(
    loadWorkbenchSessionState<PersistedVideoWorkbenchSessionState>(
      VIDEO_SESSION_STORAGE_KEY,
      createDefaultState() as PersistedVideoWorkbenchSessionState,
    ),
  )

export const useVideoWorkbenchSessionStore = defineStore('video-workbench-session', {
  state: loadState,
  actions: {
    patchFilters(patch: Partial<VideoFilterState>) {
      this.filters = {
        ...this.filters,
        ...patch,
      }
      this.page = 1
      persistState({
        filters: this.filters,
        page: this.page,
      })
    },
    setPage(page: number) {
      this.page = page
      persistState({
        filters: this.filters,
        page: this.page,
      })
    },
    reset() {
      this.filters = createDefaultVideoFilterState()
      this.page = 1
      persistState({
        filters: this.filters,
        page: this.page,
      })
    },
  },
})
