import {
  getQuestionChapterLabel,
  getQuestionChapterOptions as resolveQuestionChapterOptions,
  getQuestionSubjectLabel,
  questionWorkbenchSubjectOptions,
} from './question-workbench.fixtures.ts'

import type {
  QuestionDifficulty,
  QuestionDifficultyFilter,
  QuestionFilterOption,
  QuestionListResult,
  QuestionListRow,
  QuestionPaginationState,
  QuestionQueryState,
  QuestionRecord,
  QuestionSelectOption,
  QuestionStatus,
  QuestionType,
  QuestionTypeFilter,
  QuestionWorkbenchViewModel,
} from './question-workbench.types.ts'

const questionTypeOptions: QuestionFilterOption<QuestionTypeFilter>[] = [
  { value: 'all', label: '全部题型' },
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'short', label: '简答题' },
  { value: 'coding', label: '编程题' },
]

const questionDifficultyOptions: QuestionFilterOption<QuestionDifficultyFilter>[] = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

export function createDefaultQuestionQueryState(): QuestionQueryState {
  return {
    subjectId: '',
    chapterId: '',
    type: 'all',
    difficulty: 'all',
    keyword: '',
    page: 1,
    pageSize: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  }
}

export function createQuestionWorkbenchViewModel(options: {
  query: QuestionQueryState
  result: QuestionListResult
}): QuestionWorkbenchViewModel {
  const { query, result } = options
  const rows = result.records.map((record) => mapQuestionRecordToListRow(record))
  const chapterOptions = getQuestionChapterOptions(query.subjectId)
  const activeFilterCount = countActiveFilters(query)

  return {
    subjectOptions: [{ id: '', label: '全部学科' }, ...questionWorkbenchSubjectOptions],
    chapterOptions,
    typeOptions: questionTypeOptions,
    difficultyOptions: questionDifficultyOptions,
    rows,
    records: result.records.map((record) => cloneQuestionRecord(record)),
    pagination: createPaginationState(result),
    summary: {
      totalLabel: `共 ${result.allTotal} 道习题`,
      filteredLabel:
        result.total === result.allTotal
          ? `当前展示 ${rows.length} 道`
          : `筛选命中 ${result.total} 道，当前页展示 ${rows.length} 道`,
      activeFilterCount,
      matchingTotal: result.total,
      publishedTotal: result.matchingPublishedTotal,
      latestUpdatedAtLabel: result.matchingLatestUpdatedAt
        ? formatQuestionUpdatedAt(result.matchingLatestUpdatedAt)
        : '暂无更新',
      latestUpdatedHint: result.matchingLatestUpdatedAt
        ? '最近更新以当前筛选结果为准'
        : '当前筛选下还没有可展示的习题',
    },
    chapterDisabled: query.subjectId.length === 0,
    emptyState: createEmptyState(result, activeFilterCount),
  }
}

function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'single':
      return '单选题'
    case 'multiple':
      return '多选题'
    case 'short':
      return '简答题'
    case 'coding':
      return '编程题'
  }
}

function getQuestionDifficultyLabel(difficulty: QuestionDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
  }
}

function getQuestionStatusLabel(status: QuestionStatus): string {
  return status === 'published' ? '已发布' : '草稿'
}

export function getQuestionChapterOptions(subjectId: string): QuestionSelectOption[] {
  return resolveQuestionChapterOptions(subjectId)
}

export function resolveQuestionPageAfterDeletion(options: {
  currentPage: number
  pageSize: number
  totalAfterDeletion: number
}): number {
  const { currentPage, pageSize, totalAfterDeletion } = options
  const pageCount = Math.max(1, Math.ceil(totalAfterDeletion / pageSize))
  return Math.min(currentPage, pageCount)
}

function mapQuestionRecordToListRow(record: QuestionRecord): QuestionListRow {
  return {
    id: record.id,
    type: record.type,
    typeLabel: getQuestionTypeLabel(record.type),
    subjectLabel: getQuestionSubjectLabel(record.subjectId),
    chapterLabel: getQuestionChapterLabel(record.chapterId),
    difficulty: record.difficulty,
    difficultyLabel: getQuestionDifficultyLabel(record.difficulty),
    status: record.status,
    statusLabel: getQuestionStatusLabel(record.status),
    stem: record.stem,
    knowledgePoint: record.knowledgePoint,
    updatedAt: record.updatedAt,
    updatedAtLabel: formatQuestionUpdatedAt(record.updatedAt),
  }
}

function createPaginationState(result: QuestionListResult): QuestionPaginationState {
  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize))
  const hasRecords = result.total > 0
  const from = hasRecords ? (result.page - 1) * result.pageSize + 1 : 0
  const to = hasRecords ? Math.min(result.page * result.pageSize, result.total) : 0

  return {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
    pageCount,
    hasPrev: result.page > 1,
    hasNext: result.page < pageCount,
    from,
    to,
  }
}

function createEmptyState(
  result: QuestionListResult,
  activeFilterCount: number,
): QuestionWorkbenchViewModel['emptyState'] {
  if (result.allTotal === 0) {
    return {
      kind: 'empty',
      title: '题库里还没有习题',
      description: '先新增习题，再继续配置章节、题型和难度。',
    }
  }

  if (result.total === 0 && activeFilterCount > 0) {
    return {
      kind: 'filtered',
      title: '没有匹配到习题',
      description: '换一组筛选条件，或点击重置恢复默认查询。',
    }
  }

  return null
}

function countActiveFilters(query: QuestionQueryState): number {
  return [
    query.subjectId.length > 0,
    query.chapterId.length > 0,
    query.type !== 'all',
    query.difficulty !== 'all',
    query.keyword.trim().length > 0,
  ].filter(Boolean).length
}

function formatQuestionUpdatedAt(value: string): string {
  return value.replace('T', ' ').slice(0, 16)
}

function cloneQuestionRecord(record: QuestionRecord): QuestionRecord {
  switch (record.type) {
    case 'single':
    case 'multiple':
      return {
        ...record,
        content: {
          options: record.content.options.map((option) => ({ ...option })),
        },
      }
    case 'short':
      return {
        ...record,
        content: {
          answer: record.content.answer,
          scoringPoints: [...record.content.scoringPoints],
        },
      }
    case 'coding':
      return {
        ...record,
        content: {
          prompt: record.content.prompt,
          inputDescription: record.content.inputDescription,
          outputDescription: record.content.outputDescription,
          examples: record.content.examples.map((example) => ({ ...example })),
          testCases: record.content.testCases.map((testCase) => ({ ...testCase })),
          referenceSolution: record.content.referenceSolution,
        },
      }
  }
}
