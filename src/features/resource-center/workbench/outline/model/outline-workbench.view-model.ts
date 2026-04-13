import { outlineTeachingMethodOptions, outlineWorkbenchCourses } from './outline-workbench.fixtures.ts'
import { createOutlineDirectoryItems, validateOutlineVersionForExport } from './outline-workbench.validation.ts'

import type {
  OutlineCompletionSummary,
  OutlineCourseNavItem,
  OutlineCourseRecord,
  OutlineToolbarViewModel,
  OutlineVersionNavItem,
  OutlineVersionRecord,
  OutlineVersionSort,
  OutlineWorkbenchQueryState,
  OutlineWorkbenchViewModel,
} from './outline-workbench.types.ts'

export interface CreateOutlineWorkbenchViewModelOptions {
  courses?: OutlineCourseRecord[]
  queryState?: Partial<OutlineWorkbenchQueryState>
}

export function createDefaultOutlineWorkbenchQueryState(
  courses: OutlineCourseRecord[] = outlineWorkbenchCourses,
): OutlineWorkbenchQueryState {
  const firstCourse = courses[0]
  const firstVersion = firstCourse?.versions.find((version) => version.archiveState === 'active') ?? firstCourse?.versions[0]

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

export function createOutlineWorkbenchViewModel(
  options: CreateOutlineWorkbenchViewModelOptions = {},
): OutlineWorkbenchViewModel {
  const courses = options.courses ?? outlineWorkbenchCourses
  const queryState = {
    ...createDefaultOutlineWorkbenchQueryState(courses),
    ...options.queryState,
  }
  const currentCourse = resolveCurrentCourse(courses, queryState.selectedCourseId)
  const currentVersion = resolveCurrentVersion(currentCourse, queryState.selectedVersionId)
  const completion = currentVersion ? validateOutlineVersionForExport(currentVersion) : createEmptyCompletion()
  const visibleCourses = createVisibleCourses(courses, queryState, currentCourse?.id, currentVersion?.id)

  return {
    courses: visibleCourses,
    currentCourse,
    currentVersion,
    toolbar: createToolbarViewModel(currentCourse, currentVersion),
    directory: createOutlineDirectoryItems(completion),
    completion,
    teachingMethodOptions: [...outlineTeachingMethodOptions],
    resultCountLabel: createResultCountLabel(visibleCourses),
    currentVersionMatchesFilters: currentVersion ? matchesVersionFilters(currentVersion, queryState, currentCourse) : true,
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

function resolveCurrentCourse(courses: OutlineCourseRecord[], selectedCourseId: string): OutlineCourseRecord | undefined {
  return courses.find((course) => course.id === selectedCourseId) ?? courses[0]
}

function resolveCurrentVersion(
  course: OutlineCourseRecord | undefined,
  selectedVersionId: string,
): OutlineVersionRecord | undefined {
  if (!course) {
    return undefined
  }

  return course.versions.find((version) => version.id === selectedVersionId) ?? course.versions[0]
}

function createVisibleCourses(
  courses: OutlineCourseRecord[],
  queryState: OutlineWorkbenchQueryState,
  currentCourseId?: string,
  currentVersionId?: string,
): OutlineCourseNavItem[] {
  return courses
    .map((course) => {
      const visibleVersions = course.versions
        .filter((version) => matchesVersionFilters(version, queryState, course))
        .sort((left, right) => compareVersions(left, right, queryState.sortBy))
        .map((version) => createVersionNavItem(version, currentVersionId, course.id === currentCourseId))

      if (visibleVersions.length === 0) {
        return null
      }

      return {
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        versionCount: visibleVersions.length,
        current: course.id === currentCourseId,
        versions: visibleVersions,
      }
    })
    .filter((course): course is OutlineCourseNavItem => course !== null)
}

function matchesVersionFilters(
  version: OutlineVersionRecord,
  queryState: OutlineWorkbenchQueryState,
  course?: OutlineCourseRecord,
): boolean {
  const completion = validateOutlineVersionForExport(version)
  const keyword = queryState.searchText.trim().toLowerCase()
  const haystack = [course?.title ?? '', version.versionName, version.semester, version.note, version.updatedBy]
    .join(' ')
    .toLowerCase()

  if (keyword.length > 0 && !haystack.includes(keyword)) {
    return false
  }

  if (queryState.semester.length > 0 && version.semester !== queryState.semester) {
    return false
  }

  if (queryState.versionStatus !== 'all' && version.status !== queryState.versionStatus) {
    return false
  }

  if (queryState.archiveState !== 'all' && version.archiveState !== queryState.archiveState) {
    return false
  }

  if (queryState.completionState === 'complete') {
    return completion.issues.length === 0
  }

  if (queryState.completionState === 'needs-completion') {
    return completion.percent < 80
  }

  if (queryState.completionState === 'nearly-complete') {
    return completion.percent >= 80 && completion.issues.length > 0
  }

  return true
}

function compareVersions(left: OutlineVersionRecord, right: OutlineVersionRecord, sortBy: OutlineVersionSort): number {
  if (sortBy === 'semester-desc') {
    return right.semester.localeCompare(left.semester, 'zh-CN')
  }

  if (sortBy === 'course-name-asc') {
    return left.versionName.localeCompare(right.versionName, 'zh-CN')
  }

  return right.updatedAt.localeCompare(left.updatedAt)
}

function createVersionNavItem(
  version: OutlineVersionRecord,
  currentVersionId: string | undefined,
  showCurrent: boolean,
): OutlineVersionNavItem {
  const completion = validateOutlineVersionForExport(version)

  return {
    id: version.id,
    versionName: version.versionName,
    semester: version.semester,
    status: version.status,
    archiveState: version.archiveState,
    archivedAt: version.archivedAt,
    completionPercent: completion.percent,
    issueCount: completion.issues.length,
    current: showCurrent && version.id === currentVersionId,
    updatedAt: version.updatedAt,
    updatedBy: version.updatedBy,
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

function createResultCountLabel(courses: OutlineCourseNavItem[]): string {
  const versionCount = courses.reduce((total, course) => total + course.versions.length, 0)
  return `Found ${courses.length} courses, ${versionCount} versions`
}
