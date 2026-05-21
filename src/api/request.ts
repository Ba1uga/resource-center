const API_BASE_URL = '/api'

export type QueryValue = string | number | boolean | null | undefined

interface RequestOptions extends Omit<RequestInit, 'body'> {
  query?: Record<string, QueryValue>
  body?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, headers, ...init } = options
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080'
  const url = new URL(`${API_BASE_URL}${path}`, baseUrl)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') {
        continue
      }
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : `请求失败：${response.status}`
    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}
