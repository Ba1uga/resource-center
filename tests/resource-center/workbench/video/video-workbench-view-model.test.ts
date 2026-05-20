import assert from 'node:assert/strict'

import { videoRecords } from '../../../../src/features/resource-center/workbench/video/model/video-workbench.fixtures.ts'
import {
  createDefaultVideoFilterState,
  createVideoWorkbenchViewModel,
  resolveVideoPageAfterDeletion,
} from '../../../../src/features/resource-center/workbench/video/model/video-workbench.view-model.ts'

const defaultFilters = createDefaultVideoFilterState()
const primaryCourse = videoRecords[0]?.course ?? ''
const secondaryTitle = videoRecords[2]?.title ?? ''

assert.deepEqual(defaultFilters, {
  keyword: '',
  course: 'all',
  chapter: 'all',
  overviewStatus: 'all',
  processingStatus: 'all',
  publishStatus: 'all',
  uploadedBy: 'all',
  uploadedFrom: '',
  uploadedTo: '',
})

const defaultViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
})

assert.equal(defaultViewModel.rows.length, videoRecords.length)
assert.equal(defaultViewModel.courseOptions[0]?.value, 'all')
assert.deepEqual(
  defaultViewModel.courseOptions.map((option) => option.value),
  ['all', '计算机网络', '算法设计', '操作系统', '数据库系统', '软件工程', '人工智能'],
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
assert.deepEqual(
  defaultViewModel.summaryCards.map((item) => [item.key, item.label, item.count, item.isActive]),
  [
    ['draft', '草稿', 1, false],
    ['uploading', '上传中', 1, false],
    ['transcoding', '转码中', 1, false],
    ['published', '已发布', 3, false],
    ['offline', '已下架', 1, false],
    ['failed', '转码失败', 1, false],
  ],
)
assert.equal(defaultViewModel.chapterOptions.some((option) => option.value === '第3章'), true)
assert.equal(defaultViewModel.uploaderOptions.some((option) => option.value === '王老师'), true)

const courseScopedViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    course: primaryCourse,
  },
  page: 1,
  pageSize: 10,
})

assert.deepEqual(
  courseScopedViewModel.chapterOptions.map((option) => option.value),
  ['all', '第1章', '第2章', '第3章'],
)

const pagedViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 2,
})

assert.equal(pagedViewModel.rows.length, 2)
assert.equal(pagedViewModel.rows[0]?.id, videoRecords[0]?.id)
assert.equal(pagedViewModel.rows[1]?.id, videoRecords[1]?.id)
assert.equal(pagedViewModel.pagination.total, videoRecords.length)
assert.equal(pagedViewModel.pagination.pageCount, 4)
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

assert.equal(pagedSecondViewModel.rows.length, 2)
assert.equal(pagedSecondViewModel.rows[0]?.id, videoRecords[2]?.id)
assert.equal(pagedSecondViewModel.rows[1]?.id, videoRecords[3]?.id)
assert.equal(pagedSecondViewModel.pagination.from, 3)
assert.equal(pagedSecondViewModel.pagination.to, 4)
assert.equal(pagedSecondViewModel.pagination.hasPrev, true)
assert.equal(pagedSecondViewModel.pagination.hasNext, true)

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

assert.equal(courseViewModel.rows.length, 3)
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
assert.equal(filteredPagedViewModel.pagination.total, 3)
assert.equal(filteredPagedViewModel.pagination.pageCount, 3)
assert.equal(filteredPagedViewModel.pagination.from, 1)
assert.equal(filteredPagedViewModel.pagination.to, 1)
assert.equal(filteredPagedViewModel.rows[0]?.course, primaryCourse)

const emptyViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    keyword: 'missing-video-keyword',
    course: 'all',
  },
  page: 1,
  pageSize: 10,
})

assert.deepEqual(emptyViewModel.rows, [])
assert.equal(emptyViewModel.emptyState?.kind, 'filtered')
assert.ok((emptyViewModel.emptyState?.title ?? '').length > 0)
assert.ok((emptyViewModel.emptyState?.description ?? '').length > 0)
assert.equal(emptyViewModel.pagination.total, 0)
assert.equal(emptyViewModel.pagination.pageCount, 1)
assert.equal(emptyViewModel.pagination.from, 0)
assert.equal(emptyViewModel.pagination.to, 0)
assert.equal(emptyViewModel.pagination.hasPrev, false)
assert.equal(emptyViewModel.pagination.hasNext, false)

const initialEmptyViewModel = createVideoWorkbenchViewModel({
  records: [],
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
})

assert.equal(initialEmptyViewModel.emptyState?.kind, 'initial')

const failedStatusViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    overviewStatus: 'failed',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(failedStatusViewModel.rows.length, 1)
assert.equal(failedStatusViewModel.rows[0]?.processingStatus, 'failed')
assert.equal(
  failedStatusViewModel.summaryCards.find((item) => item.key === 'failed')?.isActive,
  true,
)

const processingStatusViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    processingStatus: 'failed',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(processingStatusViewModel.rows.length, 1)
assert.equal(processingStatusViewModel.rows[0]?.processingStatus, 'failed')

const publishStatusViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    publishStatus: 'offline',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(publishStatusViewModel.rows.length, 1)
assert.equal(publishStatusViewModel.rows[0]?.publishStatus, 'offline')

const uploaderViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    uploadedBy: '王老师',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(uploaderViewModel.rows.length, 3)
assert.equal(uploaderViewModel.rows.every((row) => row.uploadedBy === '王老师'), true)

const uploadedFromViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    uploadedFrom: '2026-04-01',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(uploadedFromViewModel.rows.every((row) => row.uploadedAt >= '2026-04-01'), true)

const uploadedToViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    uploadedTo: '2026-04-20',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(uploadedToViewModel.rows.every((row) => row.uploadedAt <= '2026-04-20'), true)
assert.equal(uploadedToViewModel.rows.length, 7)

const uploadedRangeViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    uploadedFrom: '2026-04-01',
    uploadedTo: '2026-04-20',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(uploadedRangeViewModel.rows.length, 4)
assert.equal(uploadedRangeViewModel.rows.every((row) => row.uploadedAt >= '2026-04-01' && row.uploadedAt <= '2026-04-20'), true)

const statusEmptyViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    overviewStatus: 'failed',
    keyword: '不会命中任何视频',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(statusEmptyViewModel.emptyState?.kind, 'status')
assert.equal(statusEmptyViewModel.emptyState?.actionLabel, '查看全部视频')

const processingStatusEmptyViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    processingStatus: 'failed',
    keyword: '不会命中任何视频',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(processingStatusEmptyViewModel.emptyState?.kind, 'status')
assert.equal(processingStatusEmptyViewModel.emptyState?.actionLabel, '查看全部视频')

const publishStatusEmptyViewModel = createVideoWorkbenchViewModel({
  records: videoRecords,
  filters: {
    ...defaultFilters,
    publishStatus: 'offline',
    keyword: '不会命中任何视频',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(publishStatusEmptyViewModel.emptyState?.kind, 'status')
assert.equal(publishStatusEmptyViewModel.emptyState?.actionLabel, '查看全部视频')

assert.equal(resolveVideoPageAfterDeletion({ currentPage: 2, pageSize: 2, totalAfterDeletion: 2 }), 1)
assert.equal(resolveVideoPageAfterDeletion({ currentPage: 2, pageSize: 2, totalAfterDeletion: 3 }), 2)
assert.equal(resolveVideoPageAfterDeletion({ currentPage: 1, pageSize: 2, totalAfterDeletion: 0 }), 1)
