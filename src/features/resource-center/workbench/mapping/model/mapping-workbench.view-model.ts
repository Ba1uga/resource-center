import type {
  MappingCandidate,
  MappingConfidenceLevel,
  MappingEmptyState,
  MappingFilterState,
  MappingOverviewStatus,
  MappingPaginationState,
  MappingRecord,
  MappingResourceType,
  MappingReviewStatus,
  MappingSelectOption,
  MappingSummaryCard,
  MappingSummaryCardKey,
  MappingWorkbenchRow,
  MappingWorkbenchViewModel,
} from './mapping-workbench.types.ts'

const resourceTypeLabels: Record<MappingResourceType, string> = {
  article: '图文',
  courseware: '课件',
  question: '习题',
  video: '录屏',
  excerpt: '节选',
}

const reviewStatusLabels: Record<MappingReviewStatus, string> = {
  pending: '待复核',
  approved: '已通过',
  rejected: '已驳回',
}

const confidenceLevelLabels: Record<MappingConfidenceLevel, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const overviewStatusLabels: Record<MappingOverviewStatus, string> = {
  pending: '待处理',
  matched: '已匹配',
  'manual-review': '需人工复核',
  confirmed: '已确认',
  failed: '匹配失败',
}

const reviewStatusOptions: MappingWorkbenchViewModel['reviewStatusOptions'] = [
  { value: 'all', label: '全部复核状态' },
  { value: 'pending', label: reviewStatusLabels.pending },
  { value: 'approved', label: reviewStatusLabels.approved },
  { value: 'rejected', label: reviewStatusLabels.rejected },
]

const confidenceLevelOptions: MappingWorkbenchViewModel['confidenceLevelOptions'] = [
  { value: 'all', label: '全部置信度' },
  { value: 'high', label: '高置信度' },
  { value: 'medium', label: '中置信度' },
  { value: 'low', label: '低置信度' },
]

const overviewStatusOptions: MappingWorkbenchViewModel['overviewStatusOptions'] = [
  { value: 'all', label: '全部总览状态' },
  { value: 'pending', label: overviewStatusLabels.pending },
  { value: 'matched', label: overviewStatusLabels.matched },
  { value: 'manual-review', label: overviewStatusLabels['manual-review'] },
  { value: 'confirmed', label: overviewStatusLabels.confirmed },
  { value: 'failed', label: overviewStatusLabels.failed },
]

const summaryCardDefinitions: Array<{
  key: MappingSummaryCardKey
  label: string
  hint: string
}> = [
  { key: 'pending', label: '待处理', hint: '等待首次映射处理的资源' },
  { key: 'matched', label: '已匹配', hint: '系统已给出可用映射结果' },
  { key: 'manual-review', label: '人工复核', hint: '需要老师进一步确认的资源' },
  { key: 'confirmed', label: '已确认', hint: '映射结果已经确认可用' },
  { key: 'failed', label: '匹配失败', hint: '当前还未形成可用映射结果' },
  { key: 'low-confidence', label: '低置信度', hint: '优先关注低置信度资源' },
]

export function createDefaultMappingFilterState(): MappingFilterState {
  return {
    keyword: '',
    resourceType: 'all',
    course: 'all',
    chapter: 'all',
    batchId: 'all',
    reviewStatus: 'all',
    confidenceLevel: 'all',
    overviewStatus: 'all',
  }
}

export function createMappingWorkbenchViewModel(options: {
  records: MappingRecord[]
  filters: MappingFilterState
  page: number
  pageSize: number
}): MappingWorkbenchViewModel {
  const scopedRecords = options.records.filter((record) =>
    matchesMappingFiltersWithoutOverviewStatus(record, options.filters),
  )
  const filteredRecords = scopedRecords.filter((record) => matchesMappingOverviewStatus(record, options.filters))
  const pagination = createPaginationState({
    total: filteredRecords.length,
    page: options.page,
    pageSize: options.pageSize,
  })

  return {
    rows:
      filteredRecords.length > 0
        ? filteredRecords.slice(pagination.from - 1, pagination.to).map((record) => mapRecordToRow(record))
        : [],
    summaryCards: createSummaryCards(scopedRecords, options.filters),
    resourceTypeOptions: createResourceTypeOptions(options.records),
    courseOptions: createCourseOptions(options.records),
    chapterOptions: createChapterOptions(options.records, options.filters.course),
    batchOptions: createBatchOptions(options.records),
    reviewStatusOptions,
    confidenceLevelOptions,
    overviewStatusOptions,
    pagination,
    emptyState: createEmptyState(options.records.length, filteredRecords.length),
  }
}

export function matchesMappingFilters(record: MappingRecord, filters: MappingFilterState): boolean {
  return matchesMappingFiltersWithoutOverviewStatus(record, filters) && matchesMappingOverviewStatus(record, filters)
}

function matchesMappingFiltersWithoutOverviewStatus(record: MappingRecord, filters: MappingFilterState): boolean {
  const normalizedKeyword = filters.keyword.trim().toLowerCase()
  const matchesKeyword =
    normalizedKeyword.length === 0 ||
    [
      record.resourceTitle,
      record.courseName,
      record.chapterName,
      record.primaryKnowledgePoint,
    ].some((value) => value?.toLowerCase().includes(normalizedKeyword) ?? false)

  const matchesResourceType = filters.resourceType === 'all' || record.resourceType === filters.resourceType
  const matchesCourse = filters.course === 'all' || record.courseName === filters.course
  const matchesChapter = filters.chapter === 'all' || record.chapterName === filters.chapter
  const matchesBatch = filters.batchId === 'all' || record.batchId === filters.batchId
  const matchesReviewStatus = filters.reviewStatus === 'all' || record.reviewStatus === filters.reviewStatus
  const matchesConfidence = filters.confidenceLevel === 'all' || record.confidenceLevel === filters.confidenceLevel

  return (
    matchesKeyword &&
    matchesResourceType &&
    matchesCourse &&
    matchesChapter &&
    matchesBatch &&
    matchesReviewStatus &&
    matchesConfidence
  )
}

export function resolveMappingPageAfterMutation(options: {
  currentPage: number
  pageSize: number
  totalAfterMutation: number
}): number {
  const pageCount = Math.max(1, Math.ceil(options.totalAfterMutation / options.pageSize))
  return Math.min(options.currentPage, pageCount)
}

export function resolveSelectedOrFirstCandidate(record: MappingRecord): MappingCandidate | null {
  return record.candidates.find((candidate) => candidate.id === record.selectedCandidateId) ?? record.candidates[0] ?? null
}

function mapRecordToRow(record: MappingRecord): MappingWorkbenchRow {
  const candidates = record.candidates.map((candidate) => ({ ...candidate }))
  const overviewStatus = resolveOverviewStatus(record)
  const selectedCandidate = findSelectedCandidate(candidates, record.selectedCandidateId)

  return {
    ...record,
    candidates,
    overviewStatus,
    resourceTypeLabel: resourceTypeLabels[record.resourceType],
    reviewStatusLabel: reviewStatusLabels[record.reviewStatus],
    confidenceLevelLabel: confidenceLevelLabels[record.confidenceLevel],
    overviewStatusLabel: overviewStatusLabels[overviewStatus],
    selectedCandidate,
    riskTags: createRiskTags(record, selectedCandidate),
  }
}

function createSummaryCards(records: MappingRecord[], filters: MappingFilterState): MappingSummaryCard[] {
  return summaryCardDefinitions.map((definition) => ({
    key: definition.key,
    label: definition.label,
    hint: definition.hint,
    value:
      definition.key === 'low-confidence'
        ? records.filter((record) => record.confidenceLevel === 'low').length
        : records.filter((record) => resolveOverviewStatus(record) === definition.key).length,
    isActive: isSummaryCardActive(definition.key, filters),
  }))
}

function createResourceTypeOptions(records: MappingRecord[]): MappingWorkbenchViewModel['resourceTypeOptions'] {
  const options: MappingWorkbenchViewModel['resourceTypeOptions'] = [{ value: 'all', label: '全部资源类型' }]

  for (const record of records) {
    if (options.some((option) => option.value === record.resourceType)) {
      continue
    }

    options.push({
      value: record.resourceType,
      label: resourceTypeLabels[record.resourceType],
    })
  }

  return options
}

function createCourseOptions(records: MappingRecord[]): MappingSelectOption[] {
  return createDistinctOptions(records, {
    allLabel: '全部课程',
    getValue: (record) => record.courseName,
    getLabel: (record) => record.courseName,
  })
}

function createChapterOptions(records: MappingRecord[], selectedCourse: string): MappingSelectOption[] {
  const scopedRecords =
    selectedCourse === 'all' ? records : records.filter((record) => record.courseName === selectedCourse)

  return createDistinctOptions(scopedRecords, {
    allLabel: '全部章节',
    getValue: (record) => record.chapterName,
    getLabel: (record) => record.chapterName,
  })
}

function createBatchOptions(records: MappingRecord[]): MappingSelectOption[] {
  return createDistinctOptions(records, {
    allLabel: '全部批次',
    getValue: (record) => record.batchId,
    getLabel: (record) => record.batchLabel,
  })
}

function createDistinctOptions(
  records: MappingRecord[],
  config: {
    allLabel: string
    getValue: (record: MappingRecord) => string
    getLabel: (record: MappingRecord) => string
  },
): MappingSelectOption[] {
  const seen = new Set<string>()
  const options: MappingSelectOption[] = [{ value: 'all', label: config.allLabel }]

  for (const record of records) {
    const value = config.getValue(record)
    if (seen.has(value)) {
      continue
    }

    seen.add(value)
    options.push({
      value,
      label: config.getLabel(record),
    })
  }

  return options
}

function createPaginationState(options: {
  total: number
  page: number
  pageSize: number
}): MappingPaginationState {
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

function createEmptyState(totalRecords: number, filteredRecords: number): MappingEmptyState | null {
  if (totalRecords === 0) {
    return {
      kind: 'initial',
      title: '还没有映射记录',
      description: '先导入资源，再开始整理知识点映射关系。',
    }
  }

  if (filteredRecords === 0) {
    return {
      kind: 'filtered',
      title: '没有匹配的映射记录',
      description: '换一个关键词或筛选条件，继续查找资源映射结果。',
    }
  }

  return null
}

function matchesMappingOverviewStatus(record: MappingRecord, filters: MappingFilterState): boolean {
  return filters.overviewStatus === 'all' || resolveOverviewStatus(record) === filters.overviewStatus
}

function resolveOverviewStatus(record: MappingRecord): MappingOverviewStatus {
  if (record.reviewStatus === 'rejected') {
    return 'failed'
  }

  if (record.reviewStatus === 'approved' && record.selectedCandidateId) {
    return 'confirmed'
  }

  if (record.confidenceLevel === 'low') {
    return 'manual-review'
  }

  if (record.selectedCandidateId) {
    return 'matched'
  }

  return 'pending'
}

function findSelectedCandidate(
  candidates: MappingCandidate[],
  selectedCandidateId: string | null,
): MappingCandidate | null {
  if (!selectedCandidateId) {
    return null
  }

  return candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null
}

function createRiskTags(record: MappingRecord, selectedCandidate: MappingCandidate | null): string[] {
  const tags: string[] = []

  if (record.confidenceLevel === 'low') {
    tags.push('低置信度')
  }

  if (record.reviewStatus === 'pending') {
    tags.push('待复核')
  }

  if (!selectedCandidate) {
    tags.push('缺少主挂载点')
  }

  return tags
}

function isSummaryCardActive(key: MappingSummaryCardKey, filters: MappingFilterState): boolean {
  if (key === 'low-confidence') {
    return filters.confidenceLevel === 'low'
  }

  return filters.overviewStatus === key
}
