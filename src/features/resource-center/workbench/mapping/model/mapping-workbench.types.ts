export type MappingResourceType = 'article' | 'courseware' | 'question' | 'video' | 'excerpt'
export type MappingResourceTypeFilter = 'all' | MappingResourceType

export type MappingReviewStatus = 'pending' | 'approved' | 'rejected'
export type MappingReviewStatusFilter = 'all' | MappingReviewStatus

export type MappingConfidenceLevel = 'high' | 'medium' | 'low'
export type MappingConfidenceLevelFilter = 'all' | MappingConfidenceLevel

export type MappingOverviewStatus = 'pending' | 'matched' | 'manual-review' | 'confirmed' | 'failed'
export type MappingOverviewStatusFilter = 'all' | MappingOverviewStatus

export type MappingSummaryCardKey =
  | 'pending'
  | 'matched'
  | 'manual-review'
  | 'confirmed'
  | 'failed'
  | 'low-confidence'

export type MappingSummaryFilterKey = MappingSummaryCardKey

export interface MappingCandidate {
  id: string
  knowledgePointName: string
  confidenceLevel: MappingConfidenceLevel
  matchedBy: 'ai' | 'manual'
  note: string
}

export interface MappingRecord {
  id: string
  resourceTitle: string
  resourceType: MappingResourceType
  courseName: string
  chapterName: string
  batchId: string
  batchLabel: string
  reviewStatus: MappingReviewStatus
  confidenceLevel: MappingConfidenceLevel
  primaryKnowledgePoint: string | null
  selectedCandidateId: string | null
  candidates: MappingCandidate[]
}

export interface MappingFilterState {
  keyword: string
  resourceType: MappingResourceTypeFilter
  course: string
  chapter: string
  batchId: string
  reviewStatus: MappingReviewStatusFilter
  confidenceLevel: MappingConfidenceLevelFilter
  overviewStatus: MappingOverviewStatusFilter
}

export interface MappingSelectOption<TValue extends string = string> {
  value: TValue
  label: string
}

export interface MappingWorkbenchRow extends MappingRecord {
  overviewStatus: MappingOverviewStatus
  resourceTypeLabel: string
  reviewStatusLabel: string
  confidenceLevelLabel: string
  overviewStatusLabel: string
  selectedCandidate: MappingCandidate | null
  riskTags: string[]
}

export type MappingSummaryCard =
  import('../../shared/model/workbench-summary-cards.ts').WorkbenchSummaryCard<MappingSummaryCardKey>

export interface MappingPaginationState {
  page: number
  pageSize: number
  total: number
  pageCount: number
  from: number
  to: number
  hasPrev: boolean
  hasNext: boolean
}

export interface MappingEmptyState {
  kind: 'initial' | 'filtered'
  title: string
  description: string
}

export interface MappingWorkbenchViewModel {
  rows: MappingWorkbenchRow[]
  summaryCards: MappingSummaryCard[]
  resourceTypeOptions: MappingSelectOption<MappingResourceTypeFilter>[]
  courseOptions: MappingSelectOption[]
  chapterOptions: MappingSelectOption[]
  batchOptions: MappingSelectOption[]
  reviewStatusOptions: MappingSelectOption<MappingReviewStatusFilter>[]
  confidenceLevelOptions: MappingSelectOption<MappingConfidenceLevelFilter>[]
  overviewStatusOptions: MappingSelectOption<MappingOverviewStatusFilter>[]
  pagination: MappingPaginationState
  emptyState: MappingEmptyState | null
}
