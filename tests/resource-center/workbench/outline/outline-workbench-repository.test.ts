import assert from 'node:assert/strict'

import { createOutlineWorkbenchRepository } from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.repository.ts'

const repository = createOutlineWorkbenchRepository({
  now: () => '2026-04-11T09:30:00.000Z',
  createId: (() => {
    let index = 500
    return () => `outline-version-${index++}`
  })(),
})

const createdBlankVersion = repository.createOutlineVersion({
  courseId: 'course-data-structure',
  versionName: '2027 春版',
  semester: '2027春',
  note: '为新学期准备的空白大纲。',
  updatedBy: '张老师',
  createdBy: '张老师',
})

assert.equal(createdBlankVersion.id, 'outline-version-500')
assert.equal(createdBlankVersion.status, 'draft')
assert.equal(createdBlankVersion.archiveState, 'active')
assert.equal(createdBlankVersion.archivedAt, null)
assert.equal(createdBlankVersion.createdBy, '张老师')
assert.equal(createdBlankVersion.sections.schedule.length, 0)

const duplicatedVersion = repository.duplicateOutlineVersion({
  courseId: 'course-functions-and-derivatives',
  sourceVersionId: 'outline-version-fd-2025-fall',
  versionName: '2026 秋版',
  semester: '2026秋',
  note: '基于 2025 秋统整版复制并更新。',
  updatedBy: '林知夏',
  createdBy: '林知夏',
})

assert.equal(duplicatedVersion.id, 'outline-version-501')
assert.equal(duplicatedVersion.archiveState, 'active')
assert.equal(duplicatedVersion.archivedAt, null)
assert.equal(duplicatedVersion.createdBy, '林知夏')
assert.equal(duplicatedVersion.sections.schedule.length, 4)

const archivedVersion = repository.archiveOutlineVersion('course-functions-and-derivatives', 'outline-version-fd-2026-spring')

assert.equal(archivedVersion.archiveState, 'archived')
assert.equal(archivedVersion.archivedAt, '2026-04-11T09:30:00.000Z')

const restoredVersion = repository.restoreOutlineVersion('course-functions-and-derivatives', 'outline-version-fd-2026-spring')

assert.equal(restoredVersion.archiveState, 'active')
assert.equal(restoredVersion.archivedAt, null)

const currentVersion = repository.getVersion('course-functions-and-derivatives', 'outline-version-fd-2026-spring')
assert.ok(currentVersion)

const savedVersion = repository.saveOutlineDraft('course-functions-and-derivatives', 'outline-version-fd-2026-spring', {
  ...currentVersion,
  sections: {
    ...currentVersion.sections,
    basicInfo: {
      ...currentVersion.sections.basicInfo,
      credits: 6,
    },
  },
})

assert.equal(savedVersion.updatedAt, '2026-04-11T09:30:00.000Z')
assert.equal(savedVersion.archiveState, 'active')
assert.equal(savedVersion.createdBy, currentVersion.createdBy)
assert.equal(savedVersion.sections.basicInfo.credits, 6)
