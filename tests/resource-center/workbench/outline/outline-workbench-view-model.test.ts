import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

import { outlineWorkbenchCourses } from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.fixtures.ts'

const viewModelModuleUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.view-model.ts',
  import.meta.url,
)

assert.equal(existsSync(viewModelModuleUrl), true, 'outline-workbench.view-model.ts must exist')

const {
  createDefaultOutlineWorkbenchQueryState,
  createOutlineWorkbenchViewModel,
} = await import(viewModelModuleUrl.href)

const defaultQuery = createDefaultOutlineWorkbenchQueryState(
  {
    records: [
      {
        id: 'course-functions-and-derivatives',
        title: '函数与导数',
        instructor: '林知夏',
        department: '数学教研组',
        matchedVersionCount: 2,
        totalVersionCount: 3,
        latestMatchedVersionUpdatedAt: '2026-04-10 09:30:00',
      },
    ],
    total: 1,
    size: 10,
    current: 1,
    pages: 1,
  },
  {
    'course-functions-and-derivatives': {
      records: [
        {
          id: 'outline-version-fd-2026-spring',
          courseId: 'course-functions-and-derivatives',
          versionName: '2026 春版',
          semester: '2026春',
          status: 'draft',
          archiveState: 'active',
          archivedAt: null,
          note: '测试',
          updatedBy: '林知夏',
          updatedAt: '2026-04-10 09:30:00',
          completionPercent: 83,
          completionIssueCount: 1,
          completionState: 'nearly-complete',
        },
      ],
      total: 1,
      size: 20,
      current: 1,
      pages: 1,
    },
  },
)

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

const pagedSummaryView = createOutlineWorkbenchViewModel({
  coursePage: {
    records: [
      {
        id: 'course-functions-and-derivatives',
        title: '函数与导数',
        instructor: '林知夏',
        department: '数学教研组',
        matchedVersionCount: 2,
        totalVersionCount: 3,
        latestMatchedVersionUpdatedAt: '2026-04-10 09:30:00',
      },
    ],
    total: 1,
    size: 10,
    current: 1,
    pages: 1,
  },
  versionPagesByCourseId: {
    'course-functions-and-derivatives': {
      records: [
        {
          id: 'outline-version-fd-2026-spring',
          courseId: 'course-functions-and-derivatives',
          versionName: '2026 春版',
          semester: '2026春',
          status: 'draft',
          archiveState: 'active',
          archivedAt: null,
          note: '测试',
          updatedBy: '林知夏',
          updatedAt: '2026-04-10 09:30:00',
          completionPercent: 83,
          completionIssueCount: 1,
          completionState: 'nearly-complete',
        },
      ],
      total: 1,
      size: 20,
      current: 1,
      pages: 1,
    },
  },
  selectedCourseId: 'course-functions-and-derivatives',
  selectedVersionId: 'outline-version-fd-2026-spring',
  currentVersion: outlineWorkbenchCourses[0].versions[0],
  queryState: {
    selectedCourseId: 'course-functions-and-derivatives',
    selectedVersionId: 'outline-version-fd-2026-spring',
    searchText: '函数',
    semester: '',
    versionStatus: 'all',
    completionState: 'all',
    archiveState: 'active',
    sortBy: 'updated-desc',
  },
})

assert.equal('resultCountLabel' in pagedSummaryView, false)
assert.equal(pagedSummaryView.currentVersionMatchesFilters, true)
assert.equal(pagedSummaryView.currentCourse?.id, 'course-functions-and-derivatives')
assert.equal(pagedSummaryView.currentVersion?.id, 'outline-version-fd-2026-spring')
assert.equal(pagedSummaryView.courses[0]?.matchedVersionCount, 2)
assert.equal(pagedSummaryView.courses[0]?.totalVersionCount, 3)
assert.equal(pagedSummaryView.courses[0]?.versions[0]?.completionPercent, 83)
assert.equal(pagedSummaryView.pagination.page, 1)
assert.equal(pagedSummaryView.pagination.total, 1)

const hiddenCurrentVersionView = createOutlineWorkbenchViewModel({
  coursePage: {
    records: [],
    total: 0,
    size: 10,
    current: 1,
    pages: 1,
  },
  versionPagesByCourseId: {},
  selectedCourseId: 'course-functions-and-derivatives',
  selectedVersionId: 'outline-version-fd-2026-spring',
  currentVersion: outlineWorkbenchCourses[0].versions[0],
  queryState: {
    ...defaultQuery,
    searchText: '不存在',
  },
})

assert.equal(hiddenCurrentVersionView.currentVersionMatchesFilters, false)
assert.equal(hiddenCurrentVersionView.currentVersion?.id, 'outline-version-fd-2026-spring')
assert.equal(hiddenCurrentVersionView.pagination.total, 0)
