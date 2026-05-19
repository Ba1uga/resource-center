import assert from 'node:assert/strict'

import { listOutlineCoursePage, listOutlineCourseVersions } from '../../../src/api/outline.ts'

const originalFetch = globalThis.fetch

const captured: Array<{ url: string; init?: RequestInit }> = []

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  captured.push({ url, init })

  if (url.includes('/outline/courses/1/versions')) {
    return new Response(
      JSON.stringify({
        code: 200,
        message: 'success',
        data: {
          records: [
            {
              id: 1,
              courseId: 1,
              versionName: '2026 春版',
              semester: '2026春',
              status: 'draft',
              archiveState: 'active',
              archivedAt: null,
              note: '测试',
              updatedBy: '林知夏',
              updatedAt: '2026-04-10 09:30:00',
              completionPercent: 83,
              completionIssueCount: 1,
              completionState: 'nearly-complete',
            },
          ],
          total: 1,
          size: 20,
          current: 1,
          pages: 1,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }

  return new Response(
    JSON.stringify({
      code: 200,
      message: 'success',
      data: {
        records: [
          {
            id: 1,
            title: '函数与导数',
            instructor: '林知夏',
            department: '数学教研组',
            matchedVersionCount: 2,
            totalVersionCount: 3,
            latestMatchedVersionUpdatedAt: '2026-04-10 09:30:00',
          },
        ],
        total: 1,
        size: 10,
        current: 2,
        pages: 1,
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

const coursePage = await listOutlineCoursePage({
  keyword: '函数',
  completionState: 'nearly-complete',
  archiveState: 'active',
  page: 2,
  pageSize: 10,
})

const versionPage = await listOutlineCourseVersions('1', {
  keyword: '函数',
  archiveState: 'active',
  page: 1,
  pageSize: 20,
})

const courseUrl = new URL(captured[0].url)
assert.equal(courseUrl.pathname, '/api/outline/courses')
assert.equal(courseUrl.searchParams.get('keyword'), '函数')
assert.equal(courseUrl.searchParams.get('completionState'), 'nearly-complete')
assert.equal(courseUrl.searchParams.get('page'), '2')
assert.equal(courseUrl.searchParams.get('pageSize'), '10')

const versionUrl = new URL(captured[1].url)
assert.equal(versionUrl.pathname, '/api/outline/courses/1/versions')
assert.equal(versionUrl.searchParams.get('archiveState'), 'active')
assert.equal(versionUrl.searchParams.get('pageSize'), '20')
assert.equal(versionPage.records[0]?.completionPercent, 83)
assert.equal(coursePage.records[0]?.matchedVersionCount, 2)

globalThis.fetch = originalFetch
