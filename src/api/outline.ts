import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type {
  CreateOutlineVersionInput,
  DuplicateOutlineVersionInput,
  OutlineCourseRecord,
  OutlineVersionDraft,
  OutlineVersionRecord,
  OutlineVersionSectionState,
} from '@/features/resource-center/workbench/outline/model/outline-workbench.types.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface OutlineCourseApiVO {
  id: number
  title: string
  instructor: string
  department: string
  versionCount: number
  versions: OutlineVersionApiVO[]
}

interface OutlineVersionApiVO {
  id: number
  courseId: number
  courseTitle?: string
  versionName: string
  semester: string
  status: 'draft' | 'final'
  archiveState: 'active' | 'archived'
  archivedAt: string | null
  note: string
  createdBy: string
  updatedBy: string
  createdAt?: string
  updatedAt: string
  sections: OutlineVersionSectionState
}

export interface OutlineListParams {
  keyword?: string
  semester?: string
  versionStatus?: 'draft' | 'final' | 'all'
  archiveState?: 'active' | 'archived' | 'all'
}

function normalizeVersion(version: OutlineVersionApiVO): OutlineVersionRecord {
  return {
    id: String(version.id),
    courseId: String(version.courseId),
    versionName: version.versionName,
    semester: version.semester,
    status: version.status,
    archiveState: version.archiveState,
    archivedAt: version.archivedAt,
    note: version.note,
    createdBy: version.createdBy,
    updatedAt: version.updatedAt,
    updatedBy: version.updatedBy,
    sections: version.sections,
  }
}

function normalizeCourse(course: OutlineCourseApiVO): OutlineCourseRecord {
  return {
    id: String(course.id),
    title: course.title,
    instructor: course.instructor,
    department: course.department,
    versions: course.versions.map(normalizeVersion),
  }
}

function normalizeCreatePayload(data: CreateOutlineVersionInput) {
  return {
    courseId: Number(data.courseId),
    versionName: data.versionName,
    semester: data.semester,
    note: data.note,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  }
}

function normalizeDuplicatePayload(data: DuplicateOutlineVersionInput) {
  return {
    courseId: Number(data.courseId),
    sourceVersionId: Number(data.sourceVersionId),
    versionName: data.versionName,
    semester: data.semester,
    note: data.note,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
  }
}

function normalizeSavePayload(data: OutlineVersionDraft) {
  return {
    versionName: data.versionName,
    semester: data.semester,
    status: data.status,
    note: data.note,
    updatedBy: data.updatedBy,
    sections: data.sections,
  }
}

export async function listOutlineCourses(params: OutlineListParams = {}): Promise<OutlineCourseRecord[]> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    semester: params.semester,
    versionStatus: params.versionStatus === 'all' ? '' : params.versionStatus,
    archiveState: params.archiveState ?? 'active',
  }

  const response = await request<ApiResponse<OutlineCourseApiVO[]>>('/outline/courses', {
    method: 'GET',
    query,
  })

  return response.data.map(normalizeCourse)
}

export async function getOutlineVersion(id: number): Promise<OutlineVersionRecord> {
  const response = await request<ApiResponse<OutlineVersionApiVO>>(`/outline/versions/${id}`, {
    method: 'GET',
  })

  return normalizeVersion(response.data)
}

export async function createOutlineVersion(data: CreateOutlineVersionInput): Promise<OutlineVersionRecord> {
  const response = await request<ApiResponse<OutlineVersionApiVO>>('/outline/versions', {
    method: 'POST',
    body: normalizeCreatePayload(data),
  })

  return normalizeVersion(response.data)
}

export async function duplicateOutlineVersion(data: DuplicateOutlineVersionInput): Promise<OutlineVersionRecord> {
  const response = await request<ApiResponse<OutlineVersionApiVO>>('/outline/versions/duplicate', {
    method: 'POST',
    body: normalizeDuplicatePayload(data),
  })

  return normalizeVersion(response.data)
}

export async function saveOutlineVersion(id: number, data: OutlineVersionDraft): Promise<OutlineVersionRecord> {
  const response = await request<ApiResponse<OutlineVersionApiVO>>(`/outline/versions/${id}`, {
    method: 'PUT',
    body: normalizeSavePayload(data),
  })

  return normalizeVersion(response.data)
}

export async function archiveOutlineVersion(id: number): Promise<void> {
  await request<ApiResponse<null>>(`/outline/versions/${id}/archive`, {
    method: 'PUT',
  })
}

export async function restoreOutlineVersion(id: number): Promise<void> {
  await request<ApiResponse<null>>(`/outline/versions/${id}/restore`, {
    method: 'PUT',
  })
}
