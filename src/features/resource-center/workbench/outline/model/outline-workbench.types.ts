export type OutlineVersionStatus = 'draft' | 'final'
export type OutlineArchiveState = 'active' | 'archived'
export type OutlineCompletionFilter = 'all' | 'needs-completion' | 'nearly-complete' | 'complete'
export type OutlineVersionSort = 'updated-desc' | 'semester-desc' | 'course-name-asc'

export type OutlineSectionId =
  | 'basic-info'
  | 'goals'
  | 'schedule'
  | 'methods'
  | 'assessment'
  | 'materials'

export interface CourseBasicInfo {
  courseName: string
  credits: number
  hours: number
  instructor: string
  majors: string[]
}

export interface OutlineGoalItem {
  id: string
  text: string
}

export interface TeachingScheduleItem {
  id: string
  weekLabel: string
  topic: string
  hours: number
  teachingMethod: string
  notes: string
  chapterLabel?: string
}

export interface TeachingMethodsState {
  selected: string[]
  notes: string
}

export interface AssessmentItem {
  id: string
  label: string
  percentage: number
}

export interface AssessmentBreakdown {
  usualPercentage: number
  midtermPercentage: number
  finalPercentage: number
  usualItems: AssessmentItem[]
  notes: string
}

export interface MaterialReferenceItem {
  id: string
  title: string
  author: string
  source: string
  note: string
}

export interface OutlineMaterialsState {
  primary: MaterialReferenceItem[]
  references: MaterialReferenceItem[]
}

export interface OutlineVersionSectionState {
  basicInfo: CourseBasicInfo
  knowledgeGoals: OutlineGoalItem[]
  abilityGoals: OutlineGoalItem[]
  schedule: TeachingScheduleItem[]
  teachingMethods: TeachingMethodsState
  assessment: AssessmentBreakdown
  materials: OutlineMaterialsState
}

export interface OutlineVersionRecord {
  id: string
  courseId: string
  versionName: string
  semester: string
  status: OutlineVersionStatus
  archiveState: OutlineArchiveState
  archivedAt: string | null
  note: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  sections: OutlineVersionSectionState
}

export interface OutlineCourseRecord {
  id: string
  title: string
  instructor: string
  department: string
  versions: OutlineVersionRecord[]
}

export interface OutlineVersionDraft {
  courseId: string
  versionName: string
  semester: string
  status: OutlineVersionStatus
  note: string
  updatedBy: string
  sections: OutlineVersionSectionState
}

export interface DuplicateOutlineVersionInput {
  courseId: string
  sourceVersionId: string
  versionName: string
  semester: string
  note: string
  createdBy: string
  updatedBy: string
}

export interface CreateOutlineVersionInput {
  courseId: string
  versionName: string
  semester: string
  note: string
  createdBy: string
  updatedBy: string
}

export interface OutlineWorkbenchQueryState {
  selectedCourseId: string
  selectedVersionId: string
  searchText: string
  semester: string
  versionStatus: 'all' | OutlineVersionStatus
  completionState: OutlineCompletionFilter
  archiveState: 'all' | OutlineArchiveState
  sortBy: OutlineVersionSort
}

export interface OutlineCompletionIssue {
  sectionId: OutlineSectionId
  message: string
  severity: 'warning' | 'error'
}

export interface OutlineCompletionSummary {
  completedSectionCount: number
  totalSectionCount: number
  percent: number
  issues: OutlineCompletionIssue[]
  sectionStates: Record<OutlineSectionId, boolean>
}

export interface OutlineDirectoryItem {
  id: OutlineSectionId
  label: string
  complete: boolean
}

export interface OutlineVersionNavItem {
  id: string
  versionName: string
  semester: string
  status: OutlineVersionStatus
  archiveState: OutlineArchiveState
  archivedAt: string | null
  completionPercent: number
  issueCount: number
  current: boolean
  updatedAt: string
  updatedBy: string
}

export interface OutlineCourseNavItem {
  id: string
  title: string
  instructor: string
  versionCount: number
  current: boolean
  versions: OutlineVersionNavItem[]
}

export interface OutlineToolbarViewModel {
  courseLabel: string
  versionLabel: string
  statusLabel: string
  updatedLabel: string
}

export interface OutlineWorkbenchViewModel {
  courses: OutlineCourseNavItem[]
  currentCourse?: OutlineCourseRecord
  currentVersion?: OutlineVersionRecord
  toolbar: OutlineToolbarViewModel
  directory: OutlineDirectoryItem[]
  completion: OutlineCompletionSummary
  teachingMethodOptions: string[]
  resultCountLabel: string
  currentVersionMatchesFilters: boolean
}

export interface PrintableOutlineSection {
  id: OutlineSectionId
  label: string
  lines: string[]
}

export interface PrintableOutlineDocument {
  title: string
  versionLabel: string
  metaLines: string[]
  sections: PrintableOutlineSection[]
}

export interface OutlineExportResult {
  issues: OutlineCompletionIssue[]
  document?: PrintableOutlineDocument
}
