import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

const viewModelModuleUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.view-model.ts',
  import.meta.url,
)

assert.equal(existsSync(viewModelModuleUrl), true, 'outline-workbench.view-model.ts must exist')

const {
  createDefaultOutlineWorkbenchQueryState,
  createOutlineWorkbenchViewModel,
} = await import(viewModelModuleUrl.href)

const defaultQuery = createDefaultOutlineWorkbenchQueryState()
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
  queryState: defaultQuery,
})

assert.equal(defaultView.resultCountLabel, 'Found 3 courses, 5 versions')
assert.equal(defaultView.currentVersionMatchesFilters, true)
assert.equal(defaultView.currentCourse?.id, 'course-functions-and-derivatives')
assert.equal(defaultView.currentVersion?.id, 'outline-version-fd-2026-spring')
assert.equal(defaultView.courses.length, 3)
assert.equal(defaultView.courses[0]?.id, 'course-functions-and-derivatives')
assert.equal(defaultView.courses[0]?.versionCount, 3)
assert.equal(defaultView.courses[0]?.versions[0]?.id, 'outline-version-fd-2026-spring')
assert.equal(defaultView.courses[0]?.versions[0]?.completionPercent, 83)
assert.equal(defaultView.courses[0]?.versions[0]?.issueCount, 1)
assert.equal(defaultView.courses[0]?.versions[0]?.archiveState, 'active')
assert.equal(defaultView.courses[2]?.id, 'course-data-structure')

const archivedView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    archiveState: 'archived',
  },
})

assert.equal(archivedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(archivedView.currentVersionMatchesFilters, false)
assert.equal(archivedView.courses[0]?.id, 'course-functions-and-derivatives')
assert.equal(archivedView.courses[0]?.versions[0]?.id, 'outline-version-fd-2025-fall')
assert.equal(archivedView.courses[0]?.versions[0]?.archiveState, 'archived')

const searchedView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    searchText: '立体',
  },
})

assert.equal(searchedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(searchedView.courses[0]?.id, 'course-solid-geometry')

const collaboratorSearchView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    searchText: '赵明远',
  },
})

assert.equal(collaboratorSearchView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(collaboratorSearchView.courses.length, 1)
assert.equal(collaboratorSearchView.courses[0]?.id, 'course-functions-and-derivatives')
assert.equal(collaboratorSearchView.courses[0]?.versions[0]?.id, 'outline-version-fd-2026-collab')
assert.equal(collaboratorSearchView.courses[0]?.versions[0]?.updatedBy, '赵明远')

const completedView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    completionState: 'complete',
  },
})

assert.equal(completedView.resultCountLabel, 'Found 3 courses, 3 versions')
assert.equal(
  completedView.courses.every((course: { versions: Array<{ issueCount: number }> }) =>
    course.versions.every((version) => version.issueCount === 0),
  ),
  true,
)
