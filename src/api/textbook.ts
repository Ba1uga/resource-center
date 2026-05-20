import { request } from './request.ts'

import type { QueryValue } from './request.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface TextbookRecord {
  id: number
  name: string
  author: string
  publisher: string
  edition: string
  isbn: string
  course: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface TextbookListParams {
  keyword?: string
  course?: string
  page: number
  pageSize: number
}

export interface TextbookPageResult {
  records: TextbookRecord[]
  total: number
  size: number
  current: number
  pages: number
}

export interface TextbookCreatePayload {
  name: string
  author: string
  publisher: string
  edition: string
  isbn: string
  course: string
  ownerId: string
}

export interface TextbookUpdatePayload {
  name: string
  author: string
  publisher: string
  edition: string
  isbn: string
  course: string
}

export async function listTextbooks(params: TextbookListParams): Promise<TextbookPageResult> {
  const query: Record<string, QueryValue> = {
    keyword: params.keyword,
    course: params.course,
    page: params.page,
    pageSize: params.pageSize,
  }

  const response = await request<ApiResponse<TextbookPageResult>>('/textbooks', {
    method: 'GET',
    query,
  })
  return response.data
}

export async function getTextbook(id: number): Promise<TextbookRecord> {
  const response = await request<ApiResponse<TextbookRecord>>(`/textbooks/${id}`, {
    method: 'GET',
  })
  return response.data
}

export async function createTextbook(data: TextbookCreatePayload): Promise<TextbookRecord> {
  const response = await request<ApiResponse<TextbookRecord>>('/textbooks', {
    method: 'POST',
    body: data,
  })
  return response.data
}

export async function updateTextbook(id: number, data: TextbookUpdatePayload): Promise<TextbookRecord> {
  const response = await request<ApiResponse<TextbookRecord>>(`/textbooks/${id}`, {
    method: 'PUT',
    body: data,
  })
  return response.data
}

export async function deleteTextbook(id: number): Promise<void> {
  await request<ApiResponse<null>>(`/textbooks/${id}`, {
    method: 'DELETE',
  })
}
