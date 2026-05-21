import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type {
  ChoiceQuestionPayload,
  CodingQuestionPayload,
  QuestionMutationInput,
  QuestionRecord,
  QuestionType,
  QuestionTypeFilter,
  ShortQuestionPayload,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface QuestionApiVO {
  id: number
  type: string
  subjectId: string
  chapterId: string
  difficulty: string
  status: string
  stem: string
  knowledgePoint: string
  analysis: string
  content: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface QuestionPageResult {
  records: QuestionApiVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface QuestionListParams {
  subjectId?: string
  chapterId?: string
  type?: string
  difficulty?: string
  keyword?: string
  page: number
  pageSize: number
}

export interface QuestionPageData {
  records: QuestionRecord[]
  total: number
  size: number
  current: number
  pages: number
}

function normalizeRecord(vo: QuestionApiVO): QuestionRecord {
  const base = {
    id: String(vo.id),
    type: vo.type as QuestionType,
    subjectId: vo.subjectId,
    chapterId: vo.chapterId,
    difficulty: vo.difficulty as QuestionRecord['difficulty'],
    status: vo.status as QuestionRecord['status'],
    stem: vo.stem,
    knowledgePoint: vo.knowledgePoint,
    analysis: vo.analysis,
    updatedAt: normalizeUpdatedAt(vo.updatedAt),
  }

  switch (vo.type) {
    case 'single':
    case 'multiple':
      return {
        ...base,
        type: vo.type as 'single' | 'multiple',
        content: vo.content as unknown as ChoiceQuestionPayload,
      }
    case 'short':
      return {
        ...base,
        type: 'short',
        content: vo.content as unknown as ShortQuestionPayload,
      }
    case 'coding':
      return {
        ...base,
        type: 'coding',
        content: vo.content as unknown as CodingQuestionPayload,
      }
    default:
      return {
        ...base,
        type: 'single',
        content: { options: [] },
      }
  }
}

function normalizeUpdatedAt(value: string): string {
  if (!value) {
    return ''
  }
  return value.replace(' ', 'T') + ':00.000Z'
}

function denormalizePayload(data: QuestionMutationInput): Record<string, unknown> {
  return {
    type: data.type,
    subjectId: data.subjectId,
    chapterId: data.chapterId,
    difficulty: data.difficulty,
    status: data.status,
    stem: data.stem,
    knowledgePoint: data.knowledgePoint,
    analysis: data.analysis,
    content: data.content,
  }
}

export async function listQuestions(params: QuestionListParams): Promise<QuestionPageData> {
  const query: Record<string, QueryValue> = {
    subjectId: params.subjectId || '',
    chapterId: params.chapterId || '',
    type: params.type === 'all' ? '' : params.type,
    difficulty: params.difficulty === 'all' ? '' : params.difficulty,
    keyword: params.keyword,
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<QuestionPageResult>>('/questions', {
    method: 'GET',
    query,
  })

  return {
    ...response.data,
    records: response.data.records.map(normalizeRecord),
  }
}

export async function getQuestion(id: number): Promise<QuestionRecord> {
  const response = await request<ApiResponse<QuestionApiVO>>(`/questions/${id}`, {
    method: 'GET',
  })
  return normalizeRecord(response.data)
}

export async function createQuestion(data: QuestionMutationInput): Promise<QuestionRecord> {
  const response = await request<ApiResponse<QuestionApiVO>>('/questions', {
    method: 'POST',
    body: denormalizePayload(data),
  })
  return normalizeRecord(response.data)
}

export async function updateQuestion(id: number, data: QuestionMutationInput): Promise<QuestionRecord> {
  const response = await request<ApiResponse<QuestionApiVO>>(`/questions/${id}`, {
    method: 'PUT',
    body: denormalizePayload(data),
  })
  return normalizeRecord(response.data)
}

export async function deleteQuestion(id: number): Promise<void> {
  await request<ApiResponse<null>>(`/questions/${id}`, {
    method: 'DELETE',
  })
}

export async function listAllQuestionsForFilters(params: {
  page?: number
  pageSize?: number
} = {}): Promise<QuestionPageData> {
  return listQuestions({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 200,
  })
}