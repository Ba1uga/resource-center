import assert from 'node:assert/strict'

import {
  createOutlineVersionDraft,
  createOutlineVersionDraftFromVersion,
} from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.editor.ts'
import { createOutlineWorkbenchRepository } from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.repository.ts'

const repository = createOutlineWorkbenchRepository()
const sourceVersion = repository.getVersion('course-data-structure', 'outline-version-ds-2026-fall')

assert.ok(sourceVersion)

const copiedDraft = createOutlineVersionDraftFromVersion(sourceVersion!)
assert.equal(copiedDraft.versionName, sourceVersion!.versionName)
assert.equal(copiedDraft.sections.schedule.length, sourceVersion!.sections.schedule.length)

copiedDraft.sections.schedule[0]!.topic = '更新后的主题'
assert.notEqual(sourceVersion!.sections.schedule[0]!.topic, copiedDraft.sections.schedule[0]!.topic)

const blankDraft = createOutlineVersionDraft({
  courseId: 'course-discrete-mathematics',
  versionName: '2026 秋版',
  semester: '2026秋',
  updatedBy: '李老师',
})

assert.equal(blankDraft.sections.knowledgeGoals.length, 0)
assert.equal(blankDraft.sections.schedule.length, 0)
assert.equal(blankDraft.sections.materials.primary.length, 0)
