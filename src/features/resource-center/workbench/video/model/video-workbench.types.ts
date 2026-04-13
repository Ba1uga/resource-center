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
}

export interface VideoFilterState {
  keyword: string
  course: string
}

export interface VideoSelectOption {
  value: string
  label: string
}

export interface VideoEmptyState {
  title: string
  description: string
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
  pagination: VideoPaginationState
  emptyState: VideoEmptyState | null
}
