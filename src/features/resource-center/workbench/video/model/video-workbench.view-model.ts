import type {
  VideoFilterState,
  VideoPaginationState,
  VideoRecord,
  VideoSelectOption,
  VideoWorkbenchViewModel,
} from './video-workbench.types.ts'

export function createDefaultVideoFilterState(): VideoFilterState {
  return {
    keyword: '',
    course: 'all',
  }
}

export function createVideoWorkbenchViewModel(options: {
  records: VideoRecord[]
  filters: VideoFilterState
  page: number
  pageSize: number
}): VideoWorkbenchViewModel {
  const filteredRecords = options.records.filter((record) => matchesVideoFilters(record, options.filters))
  const pagination = createPaginationState({
    total: filteredRecords.length,
    page: options.page,
    pageSize: options.pageSize,
  })

  return {
    rows:
      filteredRecords.length > 0
        ? filteredRecords.slice(pagination.from - 1, pagination.to).map((record) => ({ ...record }))
        : [],
    courseOptions: createCourseOptions(options.records),
    pagination,
    emptyState: createEmptyState(options.records.length, filteredRecords.length),
  }
}

export function resolveVideoPageAfterDeletion(options: {
  currentPage: number
  pageSize: number
  totalAfterDeletion: number
}): number {
  const pageCount = Math.max(1, Math.ceil(options.totalAfterDeletion / options.pageSize))
  return Math.min(options.currentPage, pageCount)
}

export function matchesVideoFilters(record: VideoRecord, filters: VideoFilterState): boolean {
  const normalizedKeyword = filters.keyword.trim().toLowerCase()
  const matchesKeyword = normalizedKeyword.length === 0 || record.title.toLowerCase().includes(normalizedKeyword)
  const matchesCourse = filters.course === 'all' || record.course === filters.course

  return matchesKeyword && matchesCourse
}

function createCourseOptions(records: VideoRecord[]): VideoSelectOption[] {
  const seen = new Set<string>()
  const options: VideoSelectOption[] = [{ value: 'all', label: '全部课程' }]

  for (const record of records) {
    if (seen.has(record.course)) {
      continue
    }

    seen.add(record.course)
    options.push({
      value: record.course,
      label: record.course,
    })
  }

  return options
}

function createPaginationState(options: {
  total: number
  page: number
  pageSize: number
}): VideoPaginationState {
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
      title: '还没有视频',
      description: '点击上传视频，先把教学视频资源整理进来。',
    }
  }

  if (filteredRecords === 0) {
    return {
      title: '没有匹配的视频',
      description: '换一个标题关键词或课程筛选条件，继续查找教学视频资源。',
    }
  }

  return null
}
