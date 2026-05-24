import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type { MappingRecord } from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// --- Mount Preview ---

interface MountDecisionVO {
  nodeId: number
  nodeName: string
  nodeType: string
  nodeLevel: number
  mountPath: string
  fusionScore: number
  topStrategy: string
  confidence: string
  evidence: string
  contributingStrategies: string[]
  confidenceLabel: string
  autoApprovable: boolean
  needsReview: boolean
  confidenceDecimal: number
}

export interface MountPreviewVO {
  resourceId: number
  resourceType: string
  resourceTitle: string
  courseMatches: MountDecisionVO[]
  chapterMatches: MountDecisionVO[]
  knowledgePointMatches: MountDecisionVO[]
  overallConfidence: string
  summary: string
}

export interface MountPreview {
  resourceId: string
  resourceType: string
  resourceTitle: string
  courseMatches: MountDecision[]
  chapterMatches: MountDecision[]
  knowledgePointMatches: MountDecision[]
  overallConfidence: 'high' | 'medium' | 'low'
  summary: string
}

export interface MountDecision {
  nodeId: string
  nodeName: string
  nodeType: string
  nodeLevel: number
  mountPath: string
  fusionScore: number
  topStrategy: string
  confidence: string
  evidence: string
  contributingStrategies: string[]
  autoApprovable: boolean
  needsReview: boolean
}

function normalizeDecision(vo: MountDecisionVO): MountDecision {
  return {
    nodeId: String(vo.nodeId),
    nodeName: vo.nodeName,
    nodeType: vo.nodeType,
    nodeLevel: vo.nodeLevel,
    mountPath: vo.mountPath,
    fusionScore: vo.fusionScore,
    topStrategy: vo.topStrategy,
    confidence: vo.confidence,
    evidence: vo.evidence || '',
    contributingStrategies: vo.contributingStrategies || [],
    autoApprovable: vo.autoApprovable || vo.fusionScore >= 0.85,
    needsReview: vo.needsReview || (vo.fusionScore >= 0.4 && vo.fusionScore < 0.85),
  }
}

export async function previewMount(params: {
  resourceType: string
  resourceId: number
  course?: string
}): Promise<MountPreview> {
  const response = await request<ApiResponse<MountPreviewVO>>('/mount/intelligence/preview', {
    method: 'POST',
    body: params,
  })

  const vo = response.data
  return {
    resourceId: String(vo.resourceId),
    resourceType: vo.resourceType,
    resourceTitle: vo.resourceTitle,
    courseMatches: (vo.courseMatches || []).map(normalizeDecision),
    chapterMatches: (vo.chapterMatches || []).map(normalizeDecision),
    knowledgePointMatches: (vo.knowledgePointMatches || []).map(normalizeDecision),
    overallConfidence: (vo.overallConfidence || 'low') as 'high' | 'medium' | 'low',
    summary: vo.summary || '',
  }
}

// --- Mount Tasks ---

interface AiMountTaskVO {
  id: number
  taskType: string
  resourceType: string
  resourceId: number
  batchId: number | null
  status: string
  priority: number
  progress: number
  currentPhase: string
  phaseDetail: string
  totalItems: number
  completedItems: number
  failedItems: number
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface MountTask {
  id: string
  taskType: string
  resourceType: string
  resourceId: string
  status: string
  priority: number
  progress: number
  currentPhase: string
  phaseDetail: string
  totalItems: number
  completedItems: number
  failedItems: number
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

function normalizeTask(vo: AiMountTaskVO): MountTask {
  return {
    id: String(vo.id),
    taskType: vo.taskType,
    resourceType: vo.resourceType,
    resourceId: String(vo.resourceId),
    status: vo.status,
    priority: vo.priority,
    progress: vo.progress,
    currentPhase: vo.currentPhase,
    phaseDetail: vo.phaseDetail,
    totalItems: vo.totalItems,
    completedItems: vo.completedItems,
    failedItems: vo.failedItems,
    errorMessage: vo.errorMessage,
    startedAt: vo.startedAt,
    completedAt: vo.completedAt,
    createdAt: vo.createdAt,
  }
}

export async function listMountTasks(params: {
  status?: string
  page?: number
  pageSize?: number
} = {}): Promise<{ records: MountTask[]; total: number }> {
  const query: Record<string, QueryValue> = {
    status: params.status,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
  }
  const response = await request<ApiResponse<{
    records: AiMountTaskVO[]
    total: number
  }>>('/mount/tasks', { method: 'GET', query })
  return {
    ...response.data,
    records: response.data.records.map(normalizeTask),
  }
}

export async function getMountTask(taskId: number): Promise<MountTask> {
  const response = await request<ApiResponse<AiMountTaskVO>>(`/mount/tasks/${taskId}`, {
    method: 'GET',
  })
  return normalizeTask(response.data)
}

export async function createMountTask(data: {
  taskType: string
  resourceType?: string
  resourceId?: number
  batchId?: number
  priority?: number
}): Promise<MountTask> {
  const response = await request<ApiResponse<AiMountTaskVO>>('/mount/tasks', {
    method: 'POST',
    body: data,
  })
  return normalizeTask(response.data)
}

export async function cancelMountTask(taskId: number): Promise<void> {
  await request(`/mount/tasks/${taskId}/cancel`, { method: 'POST' })
}

export async function retryMountTask(taskId: number): Promise<void> {
  await request(`/mount/tasks/${taskId}/retry`, { method: 'POST' })
}

// --- Mount Reviews ---

interface MountReviewRecordVO {
  id: number
  taskId: number | null
  mappingRecordId: number | null
  mountRelationId: number | null
  reviewAction: string
  originalNodeId: number | null
  originalNodeName: string
  reviewedNodeId: number | null
  reviewedNodeName: string
  reviewComment: string
  reviewReason: string
  aiConfidence: number | null
  reviewedBy: string
  reviewedAt: string
  feedbackUsed: number
}

export interface MountReview {
  id: string
  taskId: string | null
  mappingRecordId: string | null
  mountRelationId: string | null
  reviewAction: string
  originalNodeId: string | null
  originalNodeName: string
  reviewedNodeId: string | null
  reviewedNodeName: string
  reviewComment: string
  reviewReason: string
  aiConfidence: number | null
  reviewedBy: string
  reviewedAt: string
  feedbackUsed: boolean
}

function normalizeReview(vo: MountReviewRecordVO): MountReview {
  return {
    id: String(vo.id),
    taskId: vo.taskId != null ? String(vo.taskId) : null,
    mappingRecordId: vo.mappingRecordId != null ? String(vo.mappingRecordId) : null,
    mountRelationId: vo.mountRelationId != null ? String(vo.mountRelationId) : null,
    reviewAction: vo.reviewAction,
    originalNodeId: vo.originalNodeId != null ? String(vo.originalNodeId) : null,
    originalNodeName: vo.originalNodeName,
    reviewedNodeId: vo.reviewedNodeId != null ? String(vo.reviewedNodeId) : null,
    reviewedNodeName: vo.reviewedNodeName,
    reviewComment: vo.reviewComment,
    reviewReason: vo.reviewReason,
    aiConfidence: vo.aiConfidence,
    reviewedBy: vo.reviewedBy,
    reviewedAt: vo.reviewedAt,
    feedbackUsed: vo.feedbackUsed === 1,
  }
}

export interface ReviewStatistics {
  totalPending: number
  totalApproved: number
  totalModified: number
  totalRejected: number
  totalFeedbackReady: number
  aiAccuracyRate: number
}

export async function listMountReviews(params: {
  action?: string
  page?: number
  pageSize?: number
} = {}): Promise<{ records: MountReview[]; total: number }> {
  const query: Record<string, QueryValue> = {
    action: params.action,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
  }
  const response = await request<ApiResponse<{
    records: MountReviewRecordVO[]
    total: number
  }>>('/mount/reviews', { method: 'GET', query })
  return {
    ...response.data,
    records: response.data.records.map(normalizeReview),
  }
}

export async function approveReview(reviewId: number, body?: {
  reviewComment?: string
}): Promise<MountReview> {
  const response = await request<ApiResponse<MountReviewRecordVO>>(
    `/mount/reviews/${reviewId}/approve`, { method: 'POST', body })
  return normalizeReview(response.data)
}

export async function modifyReview(reviewId: number, body: {
  reviewedNodeId: number
  reviewedNodeName?: string
  reviewComment?: string
  reviewReason?: string
}): Promise<MountReview> {
  const response = await request<ApiResponse<MountReviewRecordVO>>(
    `/mount/reviews/${reviewId}/modify`, { method: 'POST', body })
  return normalizeReview(response.data)
}

export async function rejectReview(reviewId: number, body?: {
  reviewComment?: string
  reviewReason?: string
}): Promise<MountReview> {
  const response = await request<ApiResponse<MountReviewRecordVO>>(
    `/mount/reviews/${reviewId}/reject`, { method: 'POST', body })
  return normalizeReview(response.data)
}

export async function getReviewStatistics(): Promise<ReviewStatistics> {
  const response = await request<ApiResponse<ReviewStatistics>>('/mount/reviews/stats', {
    method: 'GET',
  })
  return response.data
}
