import { defineStore } from 'pinia'

import { createDefaultMappingFilterState } from '../model/mapping-workbench.view-model.ts'
import {
  loadWorkbenchSessionState,
  saveWorkbenchSessionState,
} from '../../shared/store/workbench-session-storage.ts'

import type { MappingFilterState } from '../model/mapping-workbench.types.ts'

const MAPPING_SESSION_STORAGE_KEY = 'mapping-session:list'
const mappingResourceTypes = new Set<MappingFilterState['resourceType']>([
  'all',
  'article',
  'courseware',
  'question',
  'video',
  'excerpt',
])
const mappingReviewStatuses = new Set<MappingFilterState['reviewStatus']>(['all', 'pending', 'approved', 'rejected'])
const mappingConfidenceLevels = new Set<MappingFilterState['confidenceLevel']>(['all', 'high', 'medium', 'low'])
const mappingOverviewStatuses = new Set<MappingFilterState['overviewStatus']>([
  'all',
  'pending',
  'matched',
  'manual-review',
  'confirmed',
  'failed',
])

interface MappingWorkbenchSessionState {
  filters: MappingFilterState
  page: number
}
type PersistedMappingWorkbenchSessionState = MappingWorkbenchSessionState & Record<string, unknown>

const createDefaultState = (): MappingWorkbenchSessionState => ({
  filters: createDefaultMappingFilterState(),
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

const sanitizeMappingFilterState = (value: unknown): MappingFilterState => {
  const fallback = createDefaultMappingFilterState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<MappingFilterState>

  return {
    keyword: sanitizeString(candidate.keyword, fallback.keyword),
    resourceType: sanitizeEnum(candidate.resourceType, mappingResourceTypes, fallback.resourceType),
    course: sanitizeString(candidate.course, fallback.course),
    chapter: sanitizeString(candidate.chapter, fallback.chapter),
    batchId: sanitizeString(candidate.batchId, fallback.batchId),
    reviewStatus: sanitizeEnum(candidate.reviewStatus, mappingReviewStatuses, fallback.reviewStatus),
    confidenceLevel: sanitizeEnum(candidate.confidenceLevel, mappingConfidenceLevels, fallback.confidenceLevel),
    overviewStatus: sanitizeEnum(candidate.overviewStatus, mappingOverviewStatuses, fallback.overviewStatus),
  }
}

const sanitizeSessionState = (value: unknown): MappingWorkbenchSessionState => {
  const fallback = createDefaultState()

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const candidate = value as Partial<PersistedMappingWorkbenchSessionState>

  return {
    filters: sanitizeMappingFilterState(candidate.filters),
    page: sanitizePositiveInteger(candidate.page, fallback.page),
  }
}

const persistState = (state: MappingWorkbenchSessionState) => {
  saveWorkbenchSessionState(MAPPING_SESSION_STORAGE_KEY, {
    filters: state.filters,
    page: state.page,
  })
}

const loadState = (): MappingWorkbenchSessionState =>
  sanitizeSessionState(
    loadWorkbenchSessionState<PersistedMappingWorkbenchSessionState>(
      MAPPING_SESSION_STORAGE_KEY,
      createDefaultState() as PersistedMappingWorkbenchSessionState,
    ),
  )

export const useMappingWorkbenchSessionStore = defineStore('mapping-workbench-session', {
  state: loadState,
  actions: {
    patchFilters(patch: Partial<MappingFilterState>) {
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
      this.filters = createDefaultMappingFilterState()
      this.page = 1
      persistState({
        filters: this.filters,
        page: this.page,
      })
    },
  },
})
