import type {
  OutlineCompletionSummary,
  OutlineDirectoryItem,
  OutlineSectionId,
  OutlineVersionDraft,
  OutlineVersionRecord,
} from './outline-workbench.types.ts'

const outlineDocumentSections: Array<{ id: OutlineSectionId; label: string }> = [
  { id: 'basic-info', label: '课程基本信息' },
  { id: 'goals', label: '课程目标' },
  { id: 'schedule', label: '教学内容与进度' },
  { id: 'methods', label: '教学方法' },
  { id: 'assessment', label: '考核方式' },
  { id: 'materials', label: '教材与参考资料' },
]

export function validateOutlineVersionForExport(
  version: OutlineVersionDraft | OutlineVersionRecord,
): OutlineCompletionSummary {
  const issues = []
  const sectionStates: Record<OutlineSectionId, boolean> = {
    'basic-info': false,
    goals: false,
    schedule: false,
    methods: false,
    assessment: false,
    materials: false,
  }

  const basicInfo = version.sections.basicInfo
  sectionStates['basic-info'] =
    basicInfo.courseName.trim().length > 0 &&
    basicInfo.credits > 0 &&
    basicInfo.hours > 0 &&
    basicInfo.instructor.trim().length > 0 &&
    basicInfo.majors.length > 0
  if (!sectionStates['basic-info']) {
    issues.push({
      sectionId: 'basic-info' as const,
      message: '课程基本信息未填写完整。',
      severity: 'error' as const,
    })
  }

  sectionStates.goals =
    version.sections.knowledgeGoals.some((goal) => goal.text.trim().length > 0) &&
    version.sections.abilityGoals.some((goal) => goal.text.trim().length > 0)
  if (!sectionStates.goals) {
    issues.push({
      sectionId: 'goals' as const,
      message: '课程目标至少需要填写一条知识目标和一条能力目标。',
      severity: 'error' as const,
    })
  }

  sectionStates.schedule = version.sections.schedule.length > 0
  if (!sectionStates.schedule) {
    issues.push({
      sectionId: 'schedule' as const,
      message: '教学进度至少需要安排一条周次记录。',
      severity: 'error' as const,
    })
  }

  sectionStates.methods =
    version.sections.teachingMethods.selected.length > 0 || version.sections.teachingMethods.notes.trim().length > 0
  if (!sectionStates.methods) {
    issues.push({
      sectionId: 'methods' as const,
      message: '教学方法尚未填写。',
      severity: 'warning' as const,
    })
  }

  const assessment = version.sections.assessment
  const assessmentTotal = assessment.usualPercentage + assessment.midtermPercentage + assessment.finalPercentage
  sectionStates.assessment = assessmentTotal === 100
  if (!sectionStates.assessment) {
    issues.push({
      sectionId: 'assessment' as const,
      message: '考核比例合计必须等于 100%。',
      severity: 'error' as const,
    })
  }

  sectionStates.materials = version.sections.materials.primary.length > 0
  if (!sectionStates.materials) {
    issues.push({
      sectionId: 'materials' as const,
      message: '主教材至少需要填写一条。',
      severity: 'error' as const,
    })
  }

  const completedSectionCount = Object.values(sectionStates).filter(Boolean).length

  return {
    completedSectionCount,
    totalSectionCount: outlineDocumentSections.length,
    percent: Math.round((completedSectionCount / outlineDocumentSections.length) * 100),
    issues,
    sectionStates,
  }
}

export function canExportOutlineVersion(summary: OutlineCompletionSummary): boolean {
  return summary.issues.every((issue) => issue.severity !== 'error')
}

export function createOutlineDirectoryItems(summary: OutlineCompletionSummary): OutlineDirectoryItem[] {
  return outlineDocumentSections.map((section) => ({
    id: section.id,
    label: section.label,
    complete: summary.sectionStates[section.id],
  }))
}
