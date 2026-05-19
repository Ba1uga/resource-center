import assert from 'node:assert/strict'

import { createOutlineWorkbenchRepository } from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.repository.ts'
import { outlineWorkbenchCourses } from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.fixtures.ts'

const emptyRepository = createOutlineWorkbenchRepository({
  initialCourses: [],
})

assert.deepEqual(emptyRepository.listCourses(), [])

emptyRepository.replaceCourses(outlineWorkbenchCourses)
assert.equal(emptyRepository.listCourses().length > 0, true)

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

const createdCourse = repository.createCourse({
  title: '离散数学',
  instructor: '沈砚',
  department: '计算机教研组',
})

assert.equal(createdCourse.title, '离散数学')
assert.equal(createdCourse.instructor, '沈砚')
assert.equal(createdCourse.department, '计算机教研组')
assert.equal(createdCourse.id, 'outline-version-501')
assert.deepEqual(createdCourse.versions, [])

const duplicatedVersion = repository.duplicateOutlineVersion({
  courseId: 'course-functions-and-derivatives',
  sourceVersionId: 'outline-version-fd-2025-fall',
  versionName: '2026 秋版',
  semester: '2026秋',
  note: '基于 2025 秋统整版复制并更新。',
  updatedBy: '林知夏',
  createdBy: '林知夏',
})

assert.equal(duplicatedVersion.id, 'outline-version-502')
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

repository.replaceVersionDetail({
  ...outlineWorkbenchCourses[0].versions[0],
  id: 'outline-version-fd-2026-spring',
})

assert.equal(repository.getVersionDetail('outline-version-fd-2026-spring')?.versionName, '2026 春版')

repository.upsertVersionSummary('course-functions-and-derivatives', {
  id: 'outline-version-fd-2026-spring',
  courseId: 'course-functions-and-derivatives',
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
})

assert.equal(repository.listVersionSummaries('course-functions-and-derivatives')[0]?.completionPercent, 83)

repository.archiveVersionSummary(
  'course-functions-and-derivatives',
  'outline-version-fd-2026-spring',
  '2026-04-11T09:30:00.000Z',
)
assert.equal(repository.listVersionSummaries('course-functions-and-derivatives')[0]?.archiveState, 'archived')

repository.restoreVersionSummary('course-functions-and-derivatives', 'outline-version-fd-2026-spring')
assert.equal(repository.listVersionSummaries('course-functions-and-derivatives')[0]?.archiveState, 'active')
