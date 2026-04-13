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
  selectedCourseId: 'course-advanced-mathematics',
  selectedVersionId: 'outline-version-amath-2026-spring',
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

assert.equal(defaultView.resultCountLabel, 'Found 3 courses, 3 versions')
assert.equal(defaultView.currentVersionMatchesFilters, true)
assert.equal(defaultView.courses.length, 3)
assert.equal(defaultView.courses[0]?.versions[0]?.completionPercent, 83)
assert.equal(defaultView.courses[0]?.versions[0]?.issueCount, 1)
assert.equal(defaultView.courses[0]?.versions[0]?.archiveState, 'active')

const archivedView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    archiveState: 'archived',
  },
})

assert.equal(archivedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(archivedView.currentVersionMatchesFilters, false)
assert.equal(archivedView.courses[0]?.versions[0]?.archiveState, 'archived')

const searchedView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    searchText: '数据',
  },
})

assert.equal(searchedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(searchedView.courses[0]?.title, '数据结构')

const completedView = createOutlineWorkbenchViewModel({
  queryState: {
    ...defaultQuery,
    completionState: 'complete',
  },
})

assert.equal(completedView.resultCountLabel, 'Found 1 courses, 1 versions')
assert.equal(
  completedView.courses.every((course: { versions: Array<{ issueCount: number }> }) =>
    course.versions.every((version) => version.issueCount === 0),
  ),
  true,
)
