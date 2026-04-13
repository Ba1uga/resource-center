import assert from 'node:assert/strict'

import { createOutlineVersionDraft } from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.editor.ts'
import {
  canExportOutlineVersion,
  validateOutlineVersionForExport,
} from '../../../../src/features/resource-center/workbench/outline/model/outline-workbench.validation.ts'

const invalidDraft = createOutlineVersionDraft({
  courseId: 'course-discrete-mathematics',
  versionName: '2026 秋版',
  semester: '2026秋',
  updatedBy: '李老师',
})

invalidDraft.sections.basicInfo.courseName = ''
invalidDraft.sections.assessment.usualPercentage = 35
invalidDraft.sections.assessment.midtermPercentage = 20
invalidDraft.sections.assessment.finalPercentage = 30

const invalidSummary = validateOutlineVersionForExport(invalidDraft)
assert.equal(canExportOutlineVersion(invalidSummary), false)
assert.equal(invalidSummary.totalSectionCount, 6)
assert.equal(invalidSummary.issues.some((issue) => issue.message.includes('课程基本信息')), true)
assert.equal(invalidSummary.issues.some((issue) => issue.message.includes('课程目标')), true)
assert.equal(invalidSummary.issues.some((issue) => issue.message.includes('教学进度')), true)
assert.equal(invalidSummary.issues.some((issue) => issue.message.includes('考核比例')), true)
assert.equal(invalidSummary.issues.some((issue) => issue.message.includes('主教材')), true)

const validDraft = createOutlineVersionDraft({
  courseId: 'course-discrete-mathematics',
  versionName: '2026 秋版',
  semester: '2026秋',
  updatedBy: '李老师',
})

validDraft.sections.basicInfo.courseName = '离散数学'
validDraft.sections.basicInfo.credits = 3
validDraft.sections.basicInfo.hours = 48
validDraft.sections.basicInfo.instructor = '李老师'
validDraft.sections.basicInfo.majors = ['软件工程']
validDraft.sections.knowledgeGoals.push({ id: 'g1', text: '理解命题逻辑与集合关系。' })
validDraft.sections.abilityGoals.push({ id: 'g2', text: '能用离散结构描述工程问题。' })
validDraft.sections.schedule.push({
  id: 'w1',
  weekLabel: '第1周',
  topic: '命题逻辑基础',
  hours: 4,
  teachingMethod: '讲授+讨论',
  notes: '完成章节导学。',
})
validDraft.sections.teachingMethods.selected = ['讲授', '讨论']
validDraft.sections.assessment.usualPercentage = 40
validDraft.sections.assessment.midtermPercentage = 20
validDraft.sections.assessment.finalPercentage = 40
validDraft.sections.assessment.usualItems.push({ id: 'u1', label: '作业', percentage: 20 })
validDraft.sections.materials.primary.push({
  id: 'm1',
  title: '离散数学导论',
  author: 'Kenneth Rosen',
  source: '机械工业出版社',
  note: '',
})

const validSummary = validateOutlineVersionForExport(validDraft)
assert.equal(canExportOutlineVersion(validSummary), true)
assert.equal(validSummary.issues.length, 0)
