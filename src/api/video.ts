import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type { VideoRecord } from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface VideoApiVO {
  id: number
  title: string
  course: string
  chapter: string
  duration: string
  resolution: string
  viewCount: number
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  lastEditedAt: string
  coverLabel: string
  knowledgePoint: string
  tags: string[]
  description: string
  processingStatus: string
  publishStatus: string
  resourceAlert: string | null
  visibility: string
  scheduledPublishAt: string | null
  createdAt: string
  updatedAt: string
}

interface VideoPageResult {
  records: VideoApiVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface VideoListParams {
  keyword?: string
  course?: string
  chapter?: string
  processingStatus?: string
  publishStatus?: string
  uploadedBy?: string
  uploadedFrom?: string
  uploadedTo?: string
  page: number
  pageSize: number
}

export interface VideoPageData {
  records: VideoRecord[]
  total: number
  size: number
  current: number
  pages: number
}

export interface VideoCreatePayload {
  title: string
  course: string
  chapter: string
  duration?: string
  resolution?: string
  viewCount?: number
  uploadedBy: string
  fileSize?: string
  knowledgePoint?: string
  tags?: string[]
  description?: string
  processingStatus?: string
  publishStatus?: string
  visibility?: string
  scheduledPublishAt?: string
  assetId?: number | null
  coverAssetId?: number | null
}

export interface VideoUpdatePayload {
  title: string
  course: string
  chapter: string
  duration?: string
  resolution?: string
  viewCount?: number
  fileSize?: string
  knowledgePoint?: string
  tags?: string[]
  description?: string
  processingStatus?: string
  publishStatus?: string
  visibility?: string
  scheduledPublishAt?: string
  assetId?: number | null
  coverAssetId?: number | null
}

export interface VideoBatchPayload {
  ids: number[]
  action: 'publish' | 'offline' | 'delete'
}

function normalizeRecord(vo: VideoApiVO): VideoRecord {
  return {
    id: String(vo.id),
    title: vo.title,
    course: vo.course,
    chapter: vo.chapter,
    duration: vo.duration === '00:00' ? '' : vo.duration,
    resolution: vo.resolution,
    viewCount: vo.viewCount,
    uploadedBy: vo.uploadedBy,
    uploadedAt: vo.uploadedAt,
    fileSize: vo.fileSize,
    lastEditedAt: vo.lastEditedAt?.replace('T', ' ').slice(0, 16) ?? '',
    coverLabel: vo.coverLabel,
    knowledgePoint: vo.knowledgePoint,
    tags: vo.tags ?? [],
    description: vo.description,
    processingStatus: vo.processingStatus as VideoRecord['processingStatus'],
    publishStatus: vo.publishStatus as VideoRecord['publishStatus'],
    assetId: vo.assetId ?? null,
    coverAssetId: vo.coverAssetId ?? null,
    resourceAlert: vo.resourceAlert,
    visibility: vo.visibility as VideoRecord['visibility'],
    scheduledPublishAt: vo.scheduledPublishAt?.replace('T', ' ').slice(0, 16) ?? null,
  }
}

export async function listVideos(params: VideoListParams): Promise<VideoPageData> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    course: params.course === 'all' ? '' : params.course,
    chapter: params.chapter === 'all' ? '' : params.chapter,
    processingStatus: params.processingStatus === 'all' ? '' : params.processingStatus,
    publishStatus: params.publishStatus === 'all' ? '' : params.publishStatus,
    uploadedBy: params.uploadedBy === 'all' ? '' : params.uploadedBy,
    uploadedFrom: params.uploadedFrom || '',
    uploadedTo: params.uploadedTo || '',
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<VideoPageResult>>('/videos', {
    method: 'GET',
    query,
  })

  return {
    ...response.data,
    records: response.data.records.map(normalizeRecord),
  }
}

export async function getVideo(id: number): Promise<VideoRecord> {
  const response = await request<ApiResponse<VideoApiVO>>(`/videos/${id}`, {
    method: 'GET',
  })
  return normalizeRecord(response.data)
}

export async function createVideo(data: VideoCreatePayload): Promise<VideoRecord> {
  const response = await request<ApiResponse<VideoApiVO>>('/videos', {
    method: 'POST',
    body: data,
  })
  return normalizeRecord(response.data)
}

export async function updateVideo(id: number, data: VideoUpdatePayload): Promise<VideoRecord> {
  const response = await request<ApiResponse<VideoApiVO>>(`/videos/${id}`, {
    method: 'PUT',
    body: data,
  })
  return normalizeRecord(response.data)
}

export async function deleteVideo(id: number): Promise<void> {
  await request<ApiResponse<null>>(`/videos/${id}`, {
    method: 'DELETE',
  })
}

export async function batchUpdateVideos(data: VideoBatchPayload): Promise<void> {
  await request<ApiResponse<null>>('/videos/batch', {
    method: 'POST',
    body: data,
  })
}