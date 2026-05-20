import type {
  VideoFilterState,
  VideoPaginationState,
  VideoRecord,
  VideoSelectOption,
  VideoSummaryCard,
  VideoWorkbenchViewModel,
  VideoEmptyState,
} from './video-workbench.types.ts'

export function createDefaultVideoFilterState(): VideoFilterState {
  return {
    keyword: '',
    course: 'all',
    chapter: 'all',
    overviewStatus: 'all',
    processingStatus: 'all',
    publishStatus: 'all',
    uploadedBy: 'all',
    uploadedFrom: '',
    uploadedTo: '',
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
  const summaryCards = createSummaryCards(options.records, options.filters.overviewStatus)

  return {
    rows:
      filteredRecords.length > 0
        ? filteredRecords.slice(pagination.from - 1, pagination.to).map((record) => ({ ...record }))
        : [],
    courseOptions: createCourseOptions(options.records),
    chapterOptions: createChapterOptions(options.records, options.filters.course),
    uploaderOptions: createUploaderOptions(options.records),
    summaryCards,
    pagination,
    emptyState: createEmptyState(options.records.length, filteredRecords.length, options.filters),
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
  const matchesChapter = filters.chapter === 'all' || record.chapter === filters.chapter
  const matchesOverviewStatus = filters.overviewStatus === 'all' || resolveOverviewStatus(record) === filters.overviewStatus
  const matchesProcessingStatus = filters.processingStatus === 'all' || record.processingStatus === filters.processingStatus
  const matchesPublishStatus = filters.publishStatus === 'all' || record.publishStatus === filters.publishStatus
  const matchesUploader = filters.uploadedBy === 'all' || record.uploadedBy === filters.uploadedBy
  const matchesUploadedFrom = !filters.uploadedFrom || record.uploadedAt >= filters.uploadedFrom
  const matchesUploadedTo = !filters.uploadedTo || record.uploadedAt <= filters.uploadedTo

  return (
    matchesKeyword &&
    matchesCourse &&
    matchesChapter &&
    matchesOverviewStatus &&
    matchesProcessingStatus &&
    matchesPublishStatus &&
    matchesUploader &&
    matchesUploadedFrom &&
    matchesUploadedTo
  )
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

function createChapterOptions(records: VideoRecord[], selectedCourse: string): VideoSelectOption[] {
  const seen = new Set<string>()
  const options: VideoSelectOption[] = [{ value: 'all', label: '全部章节' }]

  for (const record of records) {
    if (selectedCourse !== 'all' && record.course !== selectedCourse) {
      continue
    }

    if (seen.has(record.chapter)) {
      continue
    }

    seen.add(record.chapter)
    options.push({
      value: record.chapter,
      label: record.chapter,
    })
  }

  return options
}

function createUploaderOptions(records: VideoRecord[]): VideoSelectOption[] {
  const seen = new Set<string>()
  const options: VideoSelectOption[] = [{ value: 'all', label: '全部上传者' }]

  for (const record of records) {
    if (seen.has(record.uploadedBy)) {
      continue
    }

    seen.add(record.uploadedBy)
    options.push({
      value: record.uploadedBy,
      label: record.uploadedBy,
    })
  }

  return options
}

function createSummaryCards(records: VideoRecord[], activeStatus: VideoFilterState['overviewStatus']): VideoSummaryCard[] {
  const order: VideoSummaryCard['key'][] = ['draft', 'uploading', 'transcoding', 'published', 'offline', 'failed']
  const counts = new Map<VideoSummaryCard['key'], number>(order.map((key) => [key, 0]))
  const labels: Record<VideoSummaryCard['key'], string> = {
    draft: '草稿',
    uploading: '上传中',
    transcoding: '转码中',
    published: '已发布',
    offline: '已下架',
    failed: '转码失败',
  }

  for (const record of records) {
    const key = resolveOverviewStatus(record)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return order.map((key) => ({
    key,
    label: labels[key],
    count: counts.get(key) ?? 0,
    isActive: activeStatus === key,
  }))
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

function createEmptyState(totalRecords: number, filteredRecords: number, filters: VideoFilterState): VideoEmptyState | null {
  if (totalRecords === 0) {
    return {
      kind: 'initial',
      title: '还没有视频',
      description: '点击上传视频，先把教学视频资源整理进来。',
      actionLabel: '上传视频',
    }
  }

  if (filteredRecords === 0) {
    return {
      kind: isStatusDrivenEmptyState(filters) ? 'status' : 'filtered',
      title: '没有匹配的视频',
      description: createEmptyStateDescription(filters),
      actionLabel: '查看全部视频',
    }
  }

  return null
}

function resolveOverviewStatus(record: VideoRecord): Exclude<VideoSummaryCard['key'], 'all'> {
  if (record.processingStatus === 'uploading') {
    return 'uploading'
  }

  if (record.processingStatus === 'transcoding') {
    return 'transcoding'
  }

  if (record.processingStatus === 'failed') {
    return 'failed'
  }

  if (record.publishStatus === 'draft') {
    return 'draft'
  }

  if (record.publishStatus === 'offline') {
    return 'offline'
  }

  return 'published'
}

function createEmptyStateDescription(filters: VideoFilterState): string {
  if (isStatusDrivenEmptyState(filters)) {
    return '当前状态筛选下没有找到视频，尝试切回全部状态后重新查看。'
  }

  return '换一个标题关键词或课程筛选条件，继续查找教学视频资源。'
}

function isStatusDrivenEmptyState(filters: VideoFilterState): boolean {
  return (
    filters.overviewStatus !== 'all' ||
    filters.processingStatus !== 'all' ||
    filters.publishStatus !== 'all'
  )
}
