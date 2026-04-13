import assert from 'node:assert/strict'

import {
  coursewareRecords,
  currentCoursewareUploader,
} from '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.fixtures.ts'
import {
  createCoursewareWorkbenchViewModel,
  createDefaultCoursewareDraft,
  createDefaultCoursewareFilterState,
  resolveCoursewarePageAfterDeletion,
} from '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts'
import { validateCoursewareDraft } from '../../../../src/features/resource-center/workbench/courseware/model/courseware-workbench.validation.ts'

const defaultFilters = createDefaultCoursewareFilterState()

const defaultViewModel = createCoursewareWorkbenchViewModel({
  records: coursewareRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 8,
})

assert.equal(defaultViewModel.rows.length, 8)
assert.equal(defaultViewModel.pagination.pageCount, 2)
assert.equal(defaultViewModel.pagination.from, 1)
assert.equal(defaultViewModel.pagination.to, 8)
assert.equal(defaultViewModel.pagination.total, coursewareRecords.length)
assert.equal(defaultViewModel.summaryItems[0]?.label, '总课件数')
assert.equal(defaultViewModel.summaryItems[0]?.value, String(coursewareRecords.length))
assert.equal(defaultViewModel.summaryItems[1]?.label, '当前结果数')
assert.equal(defaultViewModel.summaryItems[1]?.value, String(coursewareRecords.length))
assert.equal(defaultViewModel.summaryItems[2]?.label, '最近上传')
assert.equal(defaultViewModel.summaryItems[2]?.value, coursewareRecords[0]?.title)
assert.match(defaultViewModel.summaryItems[2]?.hint ?? '', /\d{4}-\d{2}-\d{2}/)
assert.equal(defaultViewModel.courseOptions[0]?.label, '全部课程')
assert.equal(defaultViewModel.typeOptions[0]?.label, '全部类型')
assert.equal(defaultViewModel.emptyState, null)

const keywordViewModel = createCoursewareWorkbenchViewModel({
  records: coursewareRecords,
  filters: {
    ...defaultFilters,
    keyword: '网络',
  },
  page: 1,
  pageSize: 8,
})

assert.equal(keywordViewModel.rows.length, 2)
assert.equal(keywordViewModel.pagination.total, 2)
assert.equal(keywordViewModel.rows.every((row) => row.title.includes('网络')), true)

const multiFilterViewModel = createCoursewareWorkbenchViewModel({
  records: coursewareRecords,
  filters: {
    keyword: '第二章',
    course: '计算机网络',
    type: 'PPT',
  },
  page: 1,
  pageSize: 8,
})

assert.equal(multiFilterViewModel.rows.length, 1)
assert.equal(multiFilterViewModel.rows[0]?.title, '第二章 物理层')
assert.equal(multiFilterViewModel.rows[0]?.course, '计算机网络')
assert.equal(multiFilterViewModel.rows[0]?.type, 'PPT')
assert.equal(multiFilterViewModel.summaryItems[1]?.value, '1')

const filteredEmptyViewModel = createCoursewareWorkbenchViewModel({
  records: coursewareRecords,
  filters: {
    keyword: '不存在的课件',
    course: 'all',
    type: 'all',
  },
  page: 1,
  pageSize: 8,
})

assert.equal(filteredEmptyViewModel.rows.length, 0)
assert.deepEqual(filteredEmptyViewModel.emptyState, {
  title: '没有匹配的课件',
  description: '换一个关键词或筛选条件，看看其他课程下的课件资源。',
})

const pageTwoViewModel = createCoursewareWorkbenchViewModel({
  records: coursewareRecords,
  filters: defaultFilters,
  page: 2,
  pageSize: 8,
})

assert.equal(pageTwoViewModel.rows.length, coursewareRecords.length - 8)
assert.equal(pageTwoViewModel.pagination.from, 9)
assert.equal(pageTwoViewModel.pagination.to, coursewareRecords.length)

assert.equal(
  resolveCoursewarePageAfterDeletion({
    currentPage: 2,
    pageSize: 8,
    totalAfterDeletion: 8,
  }),
  1,
)
assert.equal(
  resolveCoursewarePageAfterDeletion({
    currentPage: 2,
    pageSize: 8,
    totalAfterDeletion: 9,
  }),
  2,
)

const nextDraft = createDefaultCoursewareDraft()
assert.equal(nextDraft.title, '')
assert.equal(nextDraft.course, '')
assert.equal(nextDraft.chapter, '')
assert.equal(nextDraft.type, 'PPT')
assert.equal(nextDraft.fileSize, '')
assert.equal(nextDraft.uploadedBy, currentCoursewareUploader)

assert.deepEqual(
  validateCoursewareDraft({
    ...nextDraft,
    uploadedBy: '',
  }),
  {
    title: '请填写课件标题。',
    course: '请选择课程。',
    chapter: '请填写章节。',
    fileSize: '请填写文件大小。',
    uploadedBy: '上传人不能为空。',
  },
)
