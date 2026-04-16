import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

import { teacherProfile } from '../../../../src/features/resource-center/profile/model/profile.fixture.ts'

const viewModelModuleUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.view-model.ts',
  import.meta.url,
)

assert.equal(existsSync(viewModelModuleUrl), true, 'outline-workbench.view-model.ts must exist')

const {
  createDefaultOutlineWorkbenchQueryState,
  createOutlineWorkbenchViewModel,
} = await import(viewModelModuleUrl.href)

const defaultQuery = createDefaultOutlineWorkbenchQueryState(undefined, teacherProfile.name)
assert.deepEqual(defaultQuery, {
  selectedCourseId: 'course-functions-and-derivatives',
  selectedVersionId: 'outline-version-fd-2026-spring',
  searchText: '',
  semester: '',
  versionStatus: 'all',
  completionState: 'all',
  archiveState: 'active',
  sortBy: 'updated-desc',
})

const defaultView = createOutlineWorkbenchViewModel({
  currentTeacherName: teacherProfile.name,
  queryState: defaultQuery,
})

assert.equal(defaultView.resultCountLabel, 'Found 2 courses, 3 versions')
assert.equal(defaultView.currentVersionMatchesFilters, true)
assert.equal(defaultView.courses.length, 2)
assert.equal(defaultView.courses[0]?.title, '函数与导数')
assert.equal(defaultView.courses[0]?.versionCount, 2)
assert.equal(defaultView.courses[0]?.versions[0]?.completionPercent, 83)
assert.equal(defaultView.courses[0]?.versions[0]?.issueCount, 1)
assert.equal(defaultView.courses[0]?.versions[0]?.archiveState, 'active')
assert.equal(defaultView.courses.some((course: { title: string }) => course.title === '概率与统计'), false)

const archivedView = createOutlineWorkbenchViewModel({
  currentTeacherName: teacherProfile.name,
  queryState: {
    ...defaultQuery,
    archiveState: 'archived',
  },
})

assert.equal(archivedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(archivedView.currentVersionMatchesFilters, false)
assert.equal(archivedView.courses[0]?.title, '函数与导数')
assert.equal(archivedView.courses[0]?.versions[0]?.archiveState, 'archived')

const searchedView = createOutlineWorkbenchViewModel({
  currentTeacherName: teacherProfile.name,
  queryState: {
    ...defaultQuery,
    searchText: '立体',
  },
})

assert.equal(searchedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(searchedView.courses[0]?.title, '立体几何')

const hiddenOwnedSearchView = createOutlineWorkbenchViewModel({
  currentTeacherName: teacherProfile.name,
  queryState: {
    ...defaultQuery,
    searchText: '协作',
  },
})

assert.equal(hiddenOwnedSearchView.resultCountLabel, 'Found 0 courses, 0 versions')
assert.equal(hiddenOwnedSearchView.courses.length, 0)

const completedView = createOutlineWorkbenchViewModel({
  currentTeacherName: teacherProfile.name,
  queryState: {
    ...defaultQuery,
    completionState: 'complete',
  },
})

assert.equal(completedView.resultCountLabel, 'Found 2 courses, 2 versions')
assert.equal(
  completedView.courses.every((course: { versions: Array<{ issueCount: number }> }) =>
    course.versions.every((version) => version.issueCount === 0),
  ),
  true,
)

const emptyOwnedQuery = createDefaultOutlineWorkbenchQueryState(undefined, '不存在的老师')
const emptyOwnedView = createOutlineWorkbenchViewModel({
  currentTeacherName: '不存在的老师',
  queryState: emptyOwnedQuery,
})

assert.equal(emptyOwnedQuery.selectedCourseId, '')
assert.equal(emptyOwnedQuery.selectedVersionId, '')
assert.equal(emptyOwnedView.resultCountLabel, 'Found 0 courses, 0 versions')
assert.equal(emptyOwnedView.courses.length, 0)
assert.equal(emptyOwnedView.currentCourse, undefined)
assert.equal(emptyOwnedView.currentVersion, undefined)
