import { request } from './request.ts'

import type { QueryValue } from './request.ts'
import type {
  CreateOutlineCourseInput,
  CreateOutlineVersionInput,
  DuplicateOutlineVersionInput,
  OutlineCourseSummaryRecord,
  OutlinePageResult,
  OutlineCourseRecord,
  OutlineVersionDraft,
  OutlineVersionRecord,
  OutlineVersionSummaryRecord,
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

interface OutlineCourseSummaryApiVO {
  id: number
  title: string
  instructor: string
  department: string
  matchedVersionCount: number
  totalVersionCount: number
  latestMatchedVersionUpdatedAt: string
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
  completionPercent?: number
  completionIssueCount?: number
  completionState?: 'needs-completion' | 'nearly-complete' | 'complete'
  sections: OutlineVersionSectionState
}

interface OutlineVersionSummaryApiVO {
  id: number
  courseId: number
  versionName: string
  semester: string
  status: 'draft' | 'final'
  archiveState: 'active' | 'archived'
  archivedAt: string | null
  note: string
  updatedBy: string
  updatedAt: string
  completionPercent: number
  completionIssueCount: number
  completionState: 'needs-completion' | 'nearly-complete' | 'complete'
}

export interface OutlineListParams {
  keyword?: string
  semester?: string
  versionStatus?: 'draft' | 'final' | 'all'
  completionState?: 'all' | 'needs-completion' | 'nearly-complete' | 'complete'
  archiveState?: 'active' | 'archived' | 'all'
  page?: number
  pageSize?: number
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
    completionPercent: version.completionPercent ?? 0,
    completionIssueCount: version.completionIssueCount ?? 0,
    completionState: version.completionState ?? 'needs-completion',
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

function normalizeCourseSummary(course: OutlineCourseSummaryApiVO): OutlineCourseSummaryRecord {
  return {
    id: String(course.id),
    title: course.title,
    instructor: course.instructor,
    department: course.department,
    matchedVersionCount: course.matchedVersionCount,
    totalVersionCount: course.totalVersionCount,
    latestMatchedVersionUpdatedAt: course.latestMatchedVersionUpdatedAt,
  }
}

function normalizeVersionSummary(version: OutlineVersionSummaryApiVO): OutlineVersionSummaryRecord {
  return {
    id: String(version.id),
    courseId: String(version.courseId),
    versionName: version.versionName,
    semester: version.semester,
    status: version.status,
    archiveState: version.archiveState,
    archivedAt: version.archivedAt,
    note: version.note,
    updatedBy: version.updatedBy,
    updatedAt: version.updatedAt,
    completionPercent: version.completionPercent,
    completionIssueCount: version.completionIssueCount,
    completionState: version.completionState,
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

function normalizeCreateCoursePayload(data: CreateOutlineCourseInput) {
  return {
    title: data.title,
    instructor: data.instructor,
    department: data.department,
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

export async function listOutlineCoursePage(
  params: OutlineListParams,
): Promise<OutlinePageResult<OutlineCourseSummaryRecord>> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    semester: params.semester,
    versionStatus: params.versionStatus === 'all' ? '' : params.versionStatus,
    completionState: params.completionState === 'all' ? '' : params.completionState,
    archiveState: params.archiveState ?? 'active',
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<OutlinePageResult<OutlineCourseSummaryApiVO>>>('/outline/courses', {
    method: 'GET',
    query,
  })

  return {
    ...response.data,
    records: response.data.records.map(normalizeCourseSummary),
  }
}

export async function listOutlineCourseVersions(
  courseId: string,
  params: OutlineListParams,
): Promise<OutlinePageResult<OutlineVersionSummaryRecord>> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    semester: params.semester,
    versionStatus: params.versionStatus === 'all' ? '' : params.versionStatus,
    completionState: params.completionState === 'all' ? '' : params.completionState,
    archiveState: params.archiveState ?? 'active',
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<OutlinePageResult<OutlineVersionSummaryApiVO>>>(
    `/outline/courses/${courseId}/versions`,
    {
      method: 'GET',
      query,
    },
  )

  if (!response.data || !Array.isArray(response.data.records)) {
    throw new Error('outline course version page payload is invalid')
  }

  return {
    ...response.data,
    records: response.data.records.map(normalizeVersionSummary),
  }
}

export async function getOutlineVersion(id: number): Promise<OutlineVersionRecord> {
  const response = await request<ApiResponse<OutlineVersionApiVO>>(`/outline/versions/${id}`, {
    method: 'GET',
  })

  return normalizeVersion(response.data)
}

export async function createOutlineCourse(data: CreateOutlineCourseInput): Promise<OutlineCourseRecord> {
  const response = await request<ApiResponse<OutlineCourseApiVO>>('/outline/courses', {
    method: 'POST',
    body: normalizeCreateCoursePayload(data),
  })

  return normalizeCourse(response.data)
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
