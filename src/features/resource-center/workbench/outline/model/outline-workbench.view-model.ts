import { outlineTeachingMethodOptions } from './outline-workbench.fixtures.ts'
import { createOutlineDirectoryItems, validateOutlineVersionForExport } from './outline-workbench.validation.ts'

import type {
  OutlineCompletionSummary,
  OutlineCourseRecord,
  OutlineCourseSummaryRecord,
  OutlinePageResult,
  OutlinePaginationState,
  OutlineToolbarViewModel,
  OutlineVersionRecord,
  OutlineVersionSummaryRecord,
  OutlineWorkbenchQueryState,
  OutlineWorkbenchViewModel,
} from './outline-workbench.types.ts'

export interface CreateOutlineWorkbenchViewModelOptions {
  coursePage: OutlinePageResult<OutlineCourseSummaryRecord>
  versionPagesByCourseId: Record<string, OutlinePageResult<OutlineVersionSummaryRecord>>
  selectedCourseId: string
  selectedVersionId: string
  currentCourse?: OutlineCourseRecord
  currentVersion?: OutlineVersionRecord
  queryState: OutlineWorkbenchQueryState
}

export function createDefaultOutlineWorkbenchQueryState(
  coursePage: OutlinePageResult<OutlineCourseSummaryRecord> = {
    records: [],
    total: 0,
    size: 10,
    current: 1,
    pages: 1,
  },
  versionPagesByCourseId: Record<string, OutlinePageResult<OutlineVersionSummaryRecord>> = {},
): OutlineWorkbenchQueryState {
  const firstCourse = coursePage.records[0]
  const firstVersion = firstCourse ? versionPagesByCourseId[firstCourse.id]?.records[0] : undefined

  return {
    selectedCourseId: firstCourse?.id ?? '',
    selectedVersionId: firstVersion?.id ?? '',
    searchText: '',
    semester: '',
    versionStatus: 'all',
    completionState: 'all',
    archiveState: 'active',
    sortBy: 'updated-desc',
  }
}

export function createOutlinePaginationState(result: OutlinePageResult<unknown>): OutlinePaginationState {
  const pageCount = Math.max(1, result.pages || Math.ceil(result.total / Math.max(result.size, 1)) || 1)
  const page = Math.min(Math.max(result.current, 1), pageCount)
  const hasRecords = result.total > 0

  return {
    page,
    pageSize: result.size,
    total: result.total,
    pageCount,
    from: hasRecords ? (page - 1) * result.size + 1 : 0,
    to: hasRecords ? Math.min(page * result.size, result.total) : 0,
    hasPrev: page > 1,
    hasNext: page < pageCount,
  }
}

export function createOutlineWorkbenchViewModel(
  options: CreateOutlineWorkbenchViewModelOptions,
): OutlineWorkbenchViewModel {
  const selectedCourse = options.coursePage.records.find((course) => course.id === options.selectedCourseId)
  const selectedVersionPage = selectedCourse ? options.versionPagesByCourseId[selectedCourse.id] : undefined
  const currentVersionSummary = selectedVersionPage?.records.find((version) => version.id === options.selectedVersionId)
  const completion = options.currentVersion ? validateOutlineVersionForExport(options.currentVersion) : createEmptyCompletion()
  const currentCourse = options.currentCourse ?? (selectedCourse ? toCurrentCourse(selectedCourse) : undefined)

  return {
    courses: options.coursePage.records.map((course) => ({
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      versionCount: course.matchedVersionCount,
      matchedVersionCount: course.matchedVersionCount,
      totalVersionCount: course.totalVersionCount,
      current: course.id === options.selectedCourseId,
      versions: (options.versionPagesByCourseId[course.id]?.records ?? []).map((version) => ({
        id: version.id,
        versionName: version.versionName,
        semester: version.semester,
        status: version.status,
        archiveState: version.archiveState,
        archivedAt: version.archivedAt,
        completionPercent: version.completionPercent,
        issueCount: version.completionIssueCount,
        current: course.id === options.selectedCourseId && version.id === options.selectedVersionId,
        updatedAt: version.updatedAt,
        updatedBy: version.updatedBy,
      })),
    })),
    currentCourse,
    currentVersion: options.currentVersion,
    toolbar: createToolbarViewModel(currentCourse, options.currentVersion),
    directory: createOutlineDirectoryItems(completion),
    completion,
    teachingMethodOptions: [...outlineTeachingMethodOptions],
    currentVersionMatchesFilters: !!currentVersionSummary || !options.currentVersion,
    pagination: createOutlinePaginationState(options.coursePage),
  }
}

function toCurrentCourse(course: OutlineCourseSummaryRecord): OutlineCourseRecord {
  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor,
    department: course.department,
    versions: [],
  }
}

function createEmptyCompletion(): OutlineCompletionSummary {
  return {
    completedSectionCount: 0,
    totalSectionCount: 6,
    percent: 0,
    issues: [],
    sectionStates: {
      'basic-info': false,
      goals: false,
      schedule: false,
      methods: false,
      assessment: false,
      materials: false,
    },
  }
}

function createToolbarViewModel(
  course: OutlineCourseRecord | undefined,
  version: OutlineVersionRecord | undefined,
): OutlineToolbarViewModel {
  return {
    courseLabel: course?.title ?? '未选择课程',
    versionLabel: version ? `${version.versionName}` : '未选择版本',
    statusLabel: version ? (version.status === 'final' ? '已定稿' : '草稿') : '未开始',
    updatedLabel: version ? `${version.updatedAt.slice(0, 10)} · ${version.updatedBy}` : '暂无修改记录',
  }
}
