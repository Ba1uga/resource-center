import assert from 'node:assert/strict'

import { videoRecords } from '../../../../src/features/resource-center/workbench/video/model/video-workbench.fixtures.ts'
import {
  createDefaultVideoFilterState,
  createVideoWorkbenchViewModel,
  resolveVideoPageAfterDeletion,
} from '../../../../src/features/resource-center/workbench/video/model/video-workbench.view-model.ts'

const defaultFilters = createDefaultVideoFilterState()
const primaryCourse = videoRecords[0]?.course ?? ''
const secondaryCourse = videoRecords[2]?.course ?? ''
const secondaryTitle = videoRecords[2]?.title ?? ''

assert.deepEqual(defaultFilters, {
  keyword: '',
  course: 'all',
})

const defaultViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
})

assert.equal(defaultViewModel.rows.length, videoRecords.length)
assert.equal(defaultViewModel.courseOptions[0]?.value, 'all')
assert.equal(defaultViewModel.courseOptions.length, 3)
assert.deepEqual(
  defaultViewModel.courseOptions.slice(1).map((option) => option.value),
  [primaryCourse, secondaryCourse],
)
assert.equal(defaultViewModel.emptyState, null)
assert.equal(defaultViewModel.rows[0]?.title, videoRecords[0]?.title)
assert.equal(defaultViewModel.rows[1]?.title, videoRecords[1]?.title)
assert.equal(defaultViewModel.rows[2]?.title, videoRecords[2]?.title)
assert.equal(defaultViewModel.pagination.total, videoRecords.length)
assert.equal(defaultViewModel.pagination.pageCount, 1)
assert.equal(defaultViewModel.pagination.from, 1)
assert.equal(defaultViewModel.pagination.to, videoRecords.length)
assert.equal(defaultViewModel.pagination.hasPrev, false)
assert.equal(defaultViewModel.pagination.hasNext, false)

const pagedViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 2,
})

assert.equal(pagedViewModel.rows.length, 2)
assert.equal(pagedViewModel.rows[0]?.id, videoRecords[0]?.id)
assert.equal(pagedViewModel.rows[1]?.id, videoRecords[1]?.id)
assert.equal(pagedViewModel.pagination.total, 3)
assert.equal(pagedViewModel.pagination.pageCount, 2)
assert.equal(pagedViewModel.pagination.from, 1)
assert.equal(pagedViewModel.pagination.to, 2)
assert.equal(pagedViewModel.pagination.hasPrev, false)
assert.equal(pagedViewModel.pagination.hasNext, true)

const pagedSecondViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: defaultFilters,
  page: 2,
  pageSize: 2,
})

assert.equal(pagedSecondViewModel.rows.length, 1)
assert.equal(pagedSecondViewModel.rows[0]?.id, videoRecords[2]?.id)
assert.equal(pagedSecondViewModel.pagination.from, 3)
assert.equal(pagedSecondViewModel.pagination.to, 3)
assert.equal(pagedSecondViewModel.pagination.hasPrev, true)
assert.equal(pagedSecondViewModel.pagination.hasNext, false)

const keywordViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    keyword: secondaryTitle,
  },
  page: 1,
  pageSize: 10,
})

assert.equal(keywordViewModel.rows.length, 1)
assert.equal(keywordViewModel.rows[0]?.id, videoRecords[2]?.id)
assert.equal(keywordViewModel.pagination.total, 1)
assert.equal(keywordViewModel.pagination.pageCount, 1)

const courseViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    course: primaryCourse,
  },
  page: 1,
  pageSize: 10,
})

assert.equal(courseViewModel.rows.length, 2)
assert.equal(courseViewModel.rows.every((row) => row.course === primaryCourse), true)

const filteredPagedViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    course: primaryCourse,
  },
  page: 1,
  pageSize: 1,
})

assert.equal(filteredPagedViewModel.rows.length, 1)
assert.equal(filteredPagedViewModel.pagination.total, 2)
assert.equal(filteredPagedViewModel.pagination.pageCount, 2)
assert.equal(filteredPagedViewModel.pagination.from, 1)
assert.equal(filteredPagedViewModel.pagination.to, 1)

const emptyViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    keyword: 'missing-video-keyword',
    course: 'all',
  },
  page: 1,
  pageSize: 10,
})

assert.deepEqual(emptyViewModel.rows, [])
assert.ok((emptyViewModel.emptyState?.title ?? '').length > 0)
assert.ok((emptyViewModel.emptyState?.description ?? '').length > 0)
assert.equal(emptyViewModel.pagination.total, 0)
assert.equal(emptyViewModel.pagination.pageCount, 1)
assert.equal(emptyViewModel.pagination.from, 0)
assert.equal(emptyViewModel.pagination.to, 0)
assert.equal(emptyViewModel.pagination.hasPrev, false)
assert.equal(emptyViewModel.pagination.hasNext, false)

assert.equal(resolveVideoPageAfterDeletion({ currentPage: 2, pageSize: 2, totalAfterDeletion: 2 }), 1)
assert.equal(resolveVideoPageAfterDeletion({ currentPage: 2, pageSize: 2, totalAfterDeletion: 3 }), 2)
assert.equal(resolveVideoPageAfterDeletion({ currentPage: 1, pageSize: 2, totalAfterDeletion: 0 }), 1)
