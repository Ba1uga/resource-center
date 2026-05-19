import assert from 'node:assert/strict'

import { request } from '../../../src/api/request.ts'

const originalFetch = globalThis.fetch

let capturedUrl = ''
let capturedInit: RequestInit | undefined

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  capturedUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  capturedInit = init

  return new Response(JSON.stringify({ code: 200, message: 'success', data: [] }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}) as typeof fetch

try {
  const payload = await request<{ code: number; message: string; data: unknown[] }>('/textbooks', {
    method: 'GET',
    query: {
      page: 1,
      pageSize: 10,
      keyword: '网络',
    },
  })

  assert.equal(payload.code, 200)
  assert.equal(capturedUrl, 'http://localhost:8080/api/textbooks?page=1&pageSize=10&keyword=%E7%BD%91%E7%BB%9C')
  assert.equal(capturedInit?.method, 'GET')
  assert.equal(capturedInit?.cache, 'no-store')
} finally {
  globalThis.fetch = originalFetch
}
