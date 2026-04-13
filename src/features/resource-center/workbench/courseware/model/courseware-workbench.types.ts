export type CoursewareType = 'PPT' | 'PDF' | 'DOC'
export type CoursewareTypeFilter = 'all' | CoursewareType

export interface CoursewareRecord {
  id: string
  title: string
  course: string
  chapter: string
  type: CoursewareType
  fileSize: string
  uploadedBy: string
  uploadedAt: string
}

export interface CoursewareFilterState {
  keyword: string
  course: string
  type: CoursewareTypeFilter
}

export interface CoursewarePaginationState {
  page: number
  pageSize: number
  total: number
  pageCount: number
  from: number
  to: number
  hasPrev: boolean
  hasNext: boolean
}

export interface CoursewareDraft {
  title: string
  course: string
  chapter: string
  type: CoursewareType
  fileSize: string
  uploadedBy: string
}

export interface CoursewareSelectOption<TValue extends string = string> {
  value: TValue
  label: string
}

export interface CoursewareSummaryItem {
  label: string
  value: string
  hint: string
}

export interface CoursewareEmptyState {
  title: string
  description: string
}

export interface CoursewareWorkbenchViewModel {
  rows: CoursewareRecord[]
  courseOptions: CoursewareSelectOption[]
  typeOptions: CoursewareSelectOption<CoursewareTypeFilter>[]
  pagination: CoursewarePaginationState
  summaryItems: CoursewareSummaryItem[]
  emptyState: CoursewareEmptyState | null
}

export type CoursewareValidationField = 'title' | 'course' | 'chapter' | 'fileSize' | 'uploadedBy'
export type CoursewareValidationErrors = Partial<Record<CoursewareValidationField, string>>
