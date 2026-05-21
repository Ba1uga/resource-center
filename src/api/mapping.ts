import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type {
  MappingCandidate,
  MappingRecord,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// --- API VO interfaces matching backend VO classes ---

interface MappingCandidateVO {
  id: number
  knowledgePointName: string
  confidenceLevel: string
  matchedBy: string
  note: string
}

interface MappingRecordVO {
  id: number
  resourceTitle: string
  resourceType: string
  courseName: string
  chapterName: string
  batchId: number
  batchLabel: string
  reviewStatus: string
  confidenceLevel: string
  primaryKnowledgePoint: string | null
  selectedCandidateId: number | null
  candidates: MappingCandidateVO[]
}

interface MappingRecordPageResult {
  records: MappingRecordVO[]
  total: number
  size: number
  current: number
  pages: number
}

interface MappingBatchVO {
  id: number
  label: string
  status: string
  totalResources: number
  matchedCount: number
  failedCount: number
  createdBy: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

interface MappingSummaryVO {
  pendingCount: number
  matchedCount: number
  manualReviewCount: number
  confirmedCount: number
  failedCount: number
  lowConfidenceCount: number
}

interface MappingFilterOptionsVO {
  resourceTypeOptions: Array<{ value: string; label: string }>
  courseOptions: Array<{ value: string; label: string }>
  chapterOptions: Array<{ value: string; label: string }>
  batchOptions: Array<{ value: string; label: string }>
}

interface KnowledgePointVO {
  id: number
  name: string
  course: string
  chapter: string
  description: string
}

// --- Normalization ---

function normalizeCandidate(vo: MappingCandidateVO): MappingCandidate {
  return {
    id: String(vo.id),
    knowledgePointName: vo.knowledgePointName,
    confidenceLevel: vo.confidenceLevel as MappingCandidate['confidenceLevel'],
    matchedBy: vo.matchedBy as MappingCandidate['matchedBy'],
    note: vo.note,
  }
}

function normalizeRecord(vo: MappingRecordVO): MappingRecord {
  return {
    id: String(vo.id),
    resourceTitle: vo.resourceTitle,
    resourceType: vo.resourceType as MappingRecord['resourceType'],
    courseName: vo.courseName,
    chapterName: vo.chapterName,
    batchId: String(vo.batchId),
    batchLabel: vo.batchLabel,
    reviewStatus: vo.reviewStatus as MappingRecord['reviewStatus'],
    confidenceLevel: vo.confidenceLevel as MappingRecord['confidenceLevel'],
    primaryKnowledgePoint: vo.primaryKnowledgePoint,
    selectedCandidateId: vo.selectedCandidateId != null ? String(vo.selectedCandidateId) : null,
    candidates: vo.candidates.map(normalizeCandidate),
  }
}

// --- API functions ---

export interface MappingRecordListParams {
  keyword?: string
  resourceType?: string
  course?: string
  chapter?: string
  batchId?: string
  reviewStatus?: string
  confidenceLevel?: string
  overviewStatus?: string
  page: number
  pageSize: number
}

export interface MappingPageData {
  records: MappingRecord[]
  total: number
  size: number
  current: number
  pages: number
}

export async function listMappingRecords(params: MappingRecordListParams): Promise<MappingPageData> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    resourceType: params.resourceType === 'all' ? '' : params.resourceType,
    course: params.course === 'all' ? '' : params.course,
    chapter: params.chapter === 'all' ? '' : params.chapter,
    batchId: params.batchId === 'all' ? '' : params.batchId,
    reviewStatus: params.reviewStatus === 'all' ? '' : params.reviewStatus,
    confidenceLevel: params.confidenceLevel === 'all' ? '' : params.confidenceLevel,
    overviewStatus: params.overviewStatus === 'all' ? '' : params.overviewStatus,
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<MappingRecordPageResult>>('/mapping/records', {
    method: 'GET',
    query,
  })

  return {
    ...response.data,
    records: response.data.records.map(normalizeRecord),
  }
}

export async function getMappingRecord(id: number): Promise<MappingRecord> {
  const response = await request<ApiResponse<MappingRecordVO>>(`/mapping/records/${id}`, {
    method: 'GET',
  })
  return normalizeRecord(response.data)
}

export async function reviewMappingRecord(id: number, action: 'approve' | 'reject'): Promise<MappingRecord> {
  const response = await request<ApiResponse<MappingRecordVO>>(`/mapping/records/${id}/review`, {
    method: 'PUT',
    body: { action },
  })
  return normalizeRecord(response.data)
}

export async function selectMappingCandidate(recordId: number, candidateId: number | null): Promise<MappingRecord> {
  const response = await request<ApiResponse<MappingRecordVO>>(`/mapping/records/${recordId}/select-candidate`, {
    method: 'PUT',
    body: { candidateId },
  })
  return normalizeRecord(response.data)
}

export async function getMappingSummary(params: {
  keyword?: string
  resourceType?: string
  course?: string
  chapter?: string
  batchId?: string
  reviewStatus?: string
  confidenceLevel?: string
}): Promise<MappingSummaryVO> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    resourceType: params.resourceType === 'all' ? '' : params.resourceType,
    course: params.course === 'all' ? '' : params.course,
    chapter: params.chapter === 'all' ? '' : params.chapter,
    batchId: params.batchId === 'all' ? '' : params.batchId,
    reviewStatus: params.reviewStatus === 'all' ? '' : params.reviewStatus,
    confidenceLevel: params.confidenceLevel === 'all' ? '' : params.confidenceLevel,
  }

  const response = await request<ApiResponse<MappingSummaryVO>>('/mapping/summary', {
    method: 'GET',
    query,
  })
  return response.data
}

export async function getMappingFilterOptions(): Promise<MappingFilterOptionsVO> {
  const response = await request<ApiResponse<MappingFilterOptionsVO>>('/mapping/filters', {
    method: 'GET',
  })
  return response.data
}

export async function createMappingBatch(data: {
  label: string
  course?: string
  resourceType?: string
  createdBy?: string
}): Promise<MappingBatchVO> {
  const response = await request<ApiResponse<MappingBatchVO>>('/mapping/batches', {
    method: 'POST',
    body: data,
  })
  return response.data
}

export async function runMappingBatch(batchId: number): Promise<MappingBatchVO> {
  const response = await request<ApiResponse<MappingBatchVO>>(`/mapping/batches/${batchId}/run`, {
    method: 'POST',
  })
  return response.data
}

export async function listMappingBatches(params: {
  keyword?: string
  page?: number
  pageSize?: number
} = {}): Promise<{ records: MappingBatchVO[]; total: number; size: number; current: number }> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  }

  const response = await request<ApiResponse<{
    records: MappingBatchVO[]
    total: number
    size: number
    current: number
  }>>('/mapping/batches', {
    method: 'GET',
    query,
  })
  return response.data
}

export async function batchRemapMappingRecords(batchId: number): Promise<{ resetCount: number }> {
  const response = await request<ApiResponse<{ resetCount: number }>>(`/mapping/batches/${batchId}/records/remap`, {
    method: 'POST',
  })
  return response.data
}
