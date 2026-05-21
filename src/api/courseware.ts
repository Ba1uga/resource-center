import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type {
  CoursewareRecord,
  CoursewareType,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.types.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface CoursewareApiVO {
  id: number
  title: string
  course: string
  chapter: string
  type: string
  fileSize: string
  uploadedBy: string
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

interface CoursewarePageResult {
  records: CoursewareApiVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface CoursewareListParams {
  keyword?: string
  course?: string
  type?: string
  page: number
  pageSize: number
}

export interface CoursewarePageData {
  records: CoursewareRecord[]
  total: number
  size: number
  current: number
  pages: number
}

export interface CoursewareCreatePayload {
  title: string
  course: string
  chapter: string
  type: CoursewareType
  fileSize: string
  uploadedBy: string
}

export interface CoursewareUpdatePayload {
  title: string
  course: string
  chapter: string
  type: CoursewareType
  fileSize: string
}

function normalizeRecord(vo: CoursewareApiVO): CoursewareRecord {
  return {
    id: String(vo.id),
    title: vo.title,
    course: vo.course,
    chapter: vo.chapter,
    type: vo.type as CoursewareType,
    fileSize: vo.fileSize,
    uploadedBy: vo.uploadedBy,
    uploadedAt: vo.uploadedAt,
  }
}

export async function listCoursewares(params: CoursewareListParams): Promise<CoursewarePageData> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    course: params.course === 'all' ? '' : params.course,
    type: params.type === 'all' ? '' : params.type,
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<CoursewarePageResult>>('/courseware', {
    method: 'GET',
    query,
  })

  return {
    ...response.data,
    records: response.data.records.map(normalizeRecord),
  }
}

export async function getCourseware(id: number): Promise<CoursewareRecord> {
  const response = await request<ApiResponse<CoursewareApiVO>>(`/courseware/${id}`, {
    method: 'GET',
  })
  return normalizeRecord(response.data)
}

export async function createCourseware(data: CoursewareCreatePayload): Promise<CoursewareRecord> {
  const response = await request<ApiResponse<CoursewareApiVO>>('/courseware', {
    method: 'POST',
    body: data,
  })
  return normalizeRecord(response.data)
}

export async function updateCourseware(id: number, data: CoursewareUpdatePayload): Promise<CoursewareRecord> {
  const response = await request<ApiResponse<CoursewareApiVO>>(`/courseware/${id}`, {
    method: 'PUT',
    body: data,
  })
  return normalizeRecord(response.data)
}

export async function deleteCourseware(id: number): Promise<void> {
  await request<ApiResponse<null>>(`/courseware/${id}`, {
    method: 'DELETE',
  })
}