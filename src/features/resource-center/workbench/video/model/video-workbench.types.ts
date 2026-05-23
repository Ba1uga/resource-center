export type VideoOverviewStatus = 'all' | 'draft' | 'uploading' | 'transcoding' | 'published' | 'offline' | 'failed'

export type VideoProcessingStatus = 'uploading' | 'transcoding' | 'ready' | 'failed'

export type VideoPublishStatus = 'draft' | 'published' | 'offline'

export type VideoVisibility = 'internal' | 'students'

export interface VideoRecord {
  id: string
  title: string
  course: string
  chapter: string
  duration: string
  resolution: string
  viewCount: number
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  lastEditedAt: string
  coverLabel: string
  knowledgePoint: string
  tags: string[]
  description: string
  processingStatus: VideoProcessingStatus
  publishStatus: VideoPublishStatus
  assetId: number | null
  coverAssetId: number | null
  resourceAlert: string | null
  visibility: VideoVisibility
  scheduledPublishAt: string | null
}

export interface VideoFilterState {
  keyword: string
  course: string
  chapter: string
  overviewStatus: VideoOverviewStatus
  processingStatus: VideoProcessingStatus | 'all'
  publishStatus: VideoPublishStatus | 'all'
  uploadedBy: string
  uploadedFrom: string
  uploadedTo: string
}

export interface VideoSelectOption {
  value: string
  label: string
}

export type VideoSummaryCard =
  import('../../shared/model/workbench-summary-cards.ts').WorkbenchSummaryCard<Exclude<VideoOverviewStatus, 'all'>>

export interface VideoEmptyState {
  kind: 'initial' | 'filtered' | 'status'
  title: string
  description: string
  actionLabel: string
}

export interface VideoPaginationState {
  page: number
  pageSize: number
  total: number
  pageCount: number
  from: number
  to: number
  hasPrev: boolean
  hasNext: boolean
}

export interface VideoWorkbenchViewModel {
  rows: VideoRecord[]
  courseOptions: VideoSelectOption[]
  chapterOptions: VideoSelectOption[]
  uploaderOptions: VideoSelectOption[]
  summaryCards: VideoSummaryCard[]
  pagination: VideoPaginationState
  emptyState: VideoEmptyState | null
}
