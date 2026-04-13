import { coursewareTypeOptions, currentCoursewareUploader } from './courseware-workbench.fixtures.ts'

import type {
  CoursewareDraft,
  CoursewareFilterState,
  CoursewarePaginationState,
  CoursewareRecord,
  CoursewareSelectOption,
  CoursewareWorkbenchViewModel,
} from './courseware-workbench.types.ts'

export function createDefaultCoursewareFilterState(): CoursewareFilterState {
  return {
    keyword: '',
    course: 'all',
    type: 'all',
  }
}

export function createDefaultCoursewareDraft(): CoursewareDraft {
  return {
    title: '',
    course: '',
    chapter: '',
    type: 'PPT',
    fileSize: '',
    uploadedBy: currentCoursewareUploader,
  }
}

export function createCoursewareWorkbenchViewModel(options: {
  records: CoursewareRecord[]
  filters: CoursewareFilterState
  page: number
  pageSize: number
}): CoursewareWorkbenchViewModel {
  const sortedRecords = sortCoursewareRecords(options.records)
  const filteredRecords = sortedRecords.filter((record) => matchesCoursewareFilters(record, options.filters))
  const pagination = createPaginationState({
    total: filteredRecords.length,
    page: options.page,
    pageSize: options.pageSize,
  })
  const rows =
    filteredRecords.length > 0
      ? filteredRecords.slice(pagination.from - 1, pagination.to)
      : []
  const latestRecord = sortedRecords[0]

  return {
    rows: rows.map((record) => ({ ...record })),
    courseOptions: createCourseOptions(sortedRecords),
    typeOptions: coursewareTypeOptions,
    pagination,
    summaryItems: [
      {
        label: '总课件数',
        value: String(sortedRecords.length),
        hint: '当前工作台内的全部课件资源',
      },
      {
        label: '当前结果数',
        value: String(filteredRecords.length),
        hint: '已按搜索与筛选条件联动更新',
      },
      {
        label: '最近上传',
        value: latestRecord?.title ?? '暂无课件',
        hint: latestRecord ? `${latestRecord.uploadedBy} · ${latestRecord.uploadedAt}` : '上传后会显示在这里',
      },
    ],
    emptyState: createEmptyState(sortedRecords.length, filteredRecords.length),
  }
}

export function resolveCoursewarePageAfterDeletion(options: {
  currentPage: number
  pageSize: number
  totalAfterDeletion: number
}): number {
  const pageCount = Math.max(1, Math.ceil(options.totalAfterDeletion / options.pageSize))
  return Math.min(options.currentPage, pageCount)
}

export function matchesCoursewareFilters(record: CoursewareRecord, filters: CoursewareFilterState): boolean {
  const normalizedKeyword = filters.keyword.trim().toLowerCase()
  const matchesKeyword = normalizedKeyword.length === 0 || record.title.toLowerCase().includes(normalizedKeyword)
  const matchesCourse = filters.course === 'all' || record.course === filters.course
  const matchesType = filters.type === 'all' || record.type === filters.type

  return matchesKeyword && matchesCourse && matchesType
}

function createCourseOptions(records: CoursewareRecord[]): CoursewareSelectOption[] {
  const seen = new Set<string>()
  const options: CoursewareSelectOption[] = [{ value: 'all', label: '全部课程' }]

  for (const record of records) {
    if (!seen.has(record.course)) {
      seen.add(record.course)
      options.push({
        value: record.course,
        label: record.course,
      })
    }
  }

  return options
}

function createPaginationState(options: {
  total: number
  page: number
  pageSize: number
}): CoursewarePaginationState {
  const pageCount = Math.max(1, Math.ceil(options.total / options.pageSize))
  const safePage = Math.min(Math.max(options.page, 1), pageCount)
  const hasRecords = options.total > 0
  const from = hasRecords ? (safePage - 1) * options.pageSize + 1 : 0
  const to = hasRecords ? Math.min(safePage * options.pageSize, options.total) : 0

  return {
    page: safePage,
    pageSize: options.pageSize,
    total: options.total,
    pageCount,
    from,
    to,
    hasPrev: safePage > 1,
    hasNext: safePage < pageCount,
  }
}

function createEmptyState(totalRecords: number, filteredRecords: number) {
  if (totalRecords === 0) {
    return {
      title: '还没有课件',
      description: '点击上传课件，先把常用的课堂资源整理进来。',
    }
  }

  if (filteredRecords === 0) {
    return {
      title: '没有匹配的课件',
      description: '换一个关键词或筛选条件，看看其他课程下的课件资源。',
    }
  }

  return null
}

function sortCoursewareRecords(records: CoursewareRecord[]): CoursewareRecord[] {
  return [...records].sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
}
