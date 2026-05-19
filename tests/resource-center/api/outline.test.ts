import assert from 'node:assert/strict'

import { createOutlineCourse } from '../../../src/api/outline.ts'

const originalFetch = globalThis.fetch

let capturedUrl = ''
let capturedInit: RequestInit | undefined

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  capturedUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  capturedInit = init

  return new Response(
    JSON.stringify({
      code: 200,
      message: 'success',
      data: {
        id: 12,
        title: '数据结构',
        instructor: '张老师',
        department: '计算机教研组',
        versionCount: 0,
        versions: [],
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}) as typeof fetch

try {
  const createdCourse = await createOutlineCourse({
    title: '数据结构',
    instructor: '张老师',
    department: '计算机教研组',
  })

  assert.equal(capturedUrl, 'http://localhost:8080/api/outline/courses')
  assert.equal(capturedInit?.method, 'POST')
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    title: '数据结构',
    instructor: '张老师',
    department: '计算机教研组',
  })
  assert.deepEqual(createdCourse, {
    id: '12',
    title: '数据结构',
    instructor: '张老师',
    department: '计算机教研组',
    versions: [],
  })
} finally {
  globalThis.fetch = originalFetch
}
