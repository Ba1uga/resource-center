import { createOutlineVersionDraft } from './outline-workbench.editor.ts'
import { outlineWorkbenchCourses } from './outline-workbench.fixtures.ts'
import { canExportOutlineVersion, validateOutlineVersionForExport } from './outline-workbench.validation.ts'

import type {
  CreateOutlineCourseInput,
  CreateOutlineVersionInput,
  DuplicateOutlineVersionInput,
  OutlineCourseRecord,
  OutlineExportResult,
  OutlineVersionSummaryRecord,
  OutlineVersionDraft,
  OutlineVersionRecord,
  OutlineVersionSectionState,
  PrintableOutlineDocument,
  PrintableOutlineSection,
} from './outline-workbench.types.ts'

export interface CreateOutlineWorkbenchRepositoryOptions {
  now?: () => string
  createId?: () => string
  initialCourses?: OutlineCourseRecord[]
}

export function createOutlineWorkbenchRepository(options: CreateOutlineWorkbenchRepositoryOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString())
  const createId = options.createId ?? createDefaultIdFactory()

  let courses = cloneCourses(options.initialCourses ?? outlineWorkbenchCourses)
  let versionDetails = new Map<string, OutlineVersionRecord>()
  let versionSummariesByCourseId = new Map<string, OutlineVersionSummaryRecord[]>()

  return {
    listCourses(): OutlineCourseRecord[] {
      return cloneCourses(courses)
    },
    replaceCourses(nextCourses: OutlineCourseRecord[]) {
      courses = cloneCourses(nextCourses)
    },
    getCourse(courseId: string): OutlineCourseRecord | undefined {
      const course = courses.find((item) => item.id === courseId)
      return course ? cloneCourse(course) : undefined
    },
    getVersion(courseId: string, versionId: string): OutlineVersionRecord | undefined {
      return this.getCourse(courseId)?.versions.find((version) => version.id === versionId)
    },
    replaceVersionDetail(version: OutlineVersionRecord) {
      versionDetails.set(version.id, cloneCourseVersion(version))
    },
    saveVersionDetail(version: OutlineVersionRecord) {
      versionDetails.set(version.id, cloneCourseVersion(version))
    },
    getVersionDetail(versionId: string): OutlineVersionRecord | undefined {
      const version = versionDetails.get(versionId)
      return version ? cloneCourseVersion(version) : undefined
    },
    upsertVersionSummary(courseId: string, summary: OutlineVersionSummaryRecord) {
      const current = versionSummariesByCourseId.get(courseId) ?? []
      const next = current.filter((item) => item.id !== summary.id)
      next.unshift(cloneVersionSummary(summary))
      versionSummariesByCourseId.set(courseId, next)
    },
    replaceVersionSummaries(courseId: string, summaries: OutlineVersionSummaryRecord[]) {
      versionSummariesByCourseId.set(courseId, summaries.map(cloneVersionSummary))
    },
    listVersionSummaries(courseId: string): OutlineVersionSummaryRecord[] {
      return (versionSummariesByCourseId.get(courseId) ?? []).map(cloneVersionSummary)
    },
    archiveVersionSummary(courseId: string, versionId: string, archivedAt: string) {
      const current = versionSummariesByCourseId.get(courseId) ?? []
      versionSummariesByCourseId.set(
        courseId,
        current.map((summary) =>
          summary.id === versionId
            ? {
                ...cloneVersionSummary(summary),
                archiveState: 'archived',
                archivedAt,
              }
            : cloneVersionSummary(summary),
        ),
      )
    },
    restoreVersionSummary(courseId: string, versionId: string) {
      const current = versionSummariesByCourseId.get(courseId) ?? []
      versionSummariesByCourseId.set(
        courseId,
        current.map((summary) =>
          summary.id === versionId
            ? {
                ...cloneVersionSummary(summary),
                archiveState: 'active',
                archivedAt: null,
              }
            : cloneVersionSummary(summary),
        ),
      )
    },
    createCourse(input: CreateOutlineCourseInput): OutlineCourseRecord {
      const created: OutlineCourseRecord = {
        id: createId(),
        title: input.title,
        instructor: input.instructor,
        department: input.department,
        versions: [],
      }

      courses = [created, ...courses]
      return cloneCourse(created)
    },
    createOutlineVersion(input: CreateOutlineVersionInput): OutlineVersionRecord {
      const course = courses.find((item) => item.id === input.courseId)

      if (!course) {
        throw new Error(`Outline course not found: ${input.courseId}`)
      }

      const created: OutlineVersionRecord = {
        id: createId(),
        courseId: input.courseId,
        versionName: input.versionName,
        semester: input.semester,
        status: 'draft',
        archiveState: 'active',
        archivedAt: null,
        note: input.note,
        createdBy: input.createdBy,
        updatedAt: now(),
        updatedBy: input.updatedBy,
        completionPercent: 0,
        completionIssueCount: 6,
        completionState: 'needs-completion',
        sections: createOutlineVersionDraft({
          courseId: input.courseId,
          versionName: input.versionName,
          semester: input.semester,
          updatedBy: input.updatedBy,
        }).sections,
      }

      course.versions = [created, ...course.versions]
      return cloneCourseVersion(created)
    },
    saveOutlineDraft(
      courseId: string,
      versionId: string,
      draftOrSections: OutlineVersionDraft | OutlineVersionSectionState | OutlineVersionRecord,
    ): OutlineVersionRecord {
      const version = findVersion(courses, courseId, versionId)
      if (!version) {
        throw new Error(`Outline version not found: ${courseId}/${versionId}`)
      }

      if ('sections' in draftOrSections) {
        version.versionName = draftOrSections.versionName
        version.semester = draftOrSections.semester
        version.status = draftOrSections.status
        version.note = draftOrSections.note
        version.updatedBy = draftOrSections.updatedBy || version.updatedBy
        version.sections = cloneSections(draftOrSections.sections)

        if ('archiveState' in draftOrSections) {
          version.archiveState = draftOrSections.archiveState
        }

        if ('archivedAt' in draftOrSections) {
          version.archivedAt = draftOrSections.archivedAt
        }
      } else {
        version.sections = cloneSections(draftOrSections)
      }

      version.updatedAt = now()

      return cloneCourseVersion(version)
    },
    duplicateOutlineVersion(input: DuplicateOutlineVersionInput): OutlineVersionRecord {
      const course = courses.find((item) => item.id === input.courseId)
      const sourceVersion = findVersion(courses, input.courseId, input.sourceVersionId)

      if (!course || !sourceVersion) {
        throw new Error(`Source outline version not found: ${input.courseId}/${input.sourceVersionId}`)
      }

      const duplicated: OutlineVersionRecord = {
        ...cloneCourseVersion(sourceVersion),
        id: createId(),
        versionName: input.versionName,
        semester: input.semester,
        status: 'draft',
        archiveState: 'active',
        archivedAt: null,
        note: input.note,
        createdBy: input.createdBy,
        updatedAt: now(),
        updatedBy: input.updatedBy,
      }

      course.versions = [duplicated, ...course.versions]
      return cloneCourseVersion(duplicated)
    },
    archiveOutlineVersion(courseId: string, versionId: string): OutlineVersionRecord {
      const version = findVersion(courses, courseId, versionId)
      if (!version) {
        throw new Error(`Outline version not found: ${courseId}/${versionId}`)
      }

      version.archiveState = 'archived'
      version.archivedAt = now()
      version.updatedAt = now()
      return cloneCourseVersion(version)
    },
    restoreOutlineVersion(courseId: string, versionId: string): OutlineVersionRecord {
      const version = findVersion(courses, courseId, versionId)
      if (!version) {
        throw new Error(`Outline version not found: ${courseId}/${versionId}`)
      }

      version.archiveState = 'active'
      version.archivedAt = null
      version.updatedAt = now()
      return cloneCourseVersion(version)
    },
    exportOutlineVersion(courseId: string, versionId: string): OutlineExportResult {
      const version = findVersion(courses, courseId, versionId)
      const course = courses.find((item) => item.id === courseId)

      if (!version || !course) {
        throw new Error(`Outline version not found: ${courseId}/${versionId}`)
      }

      const summary = validateOutlineVersionForExport(version)
      if (!canExportOutlineVersion(summary)) {
        return {
          issues: summary.issues,
        }
      }

      return {
        issues: [],
        document: createPrintableDocument(course, version),
      }
    },
  }
}

function createDefaultIdFactory() {
  let index = 900
  return () => `outline-version-${index++}`
}

function cloneCourses(courses: OutlineCourseRecord[]): OutlineCourseRecord[] {
  return courses.map((course) => cloneCourse(course))
}

function cloneCourse(course: OutlineCourseRecord): OutlineCourseRecord {
  return {
    ...course,
    versions: course.versions.map((version) => cloneCourseVersion(version)),
  }
}

function cloneCourseVersion(version: OutlineVersionRecord): OutlineVersionRecord {
  return {
    id: version.id,
    courseId: version.courseId,
    versionName: version.versionName,
    semester: version.semester,
    status: version.status,
    archiveState: version.archiveState,
    archivedAt: version.archivedAt,
    note: version.note,
    createdBy: version.createdBy,
    updatedAt: version.updatedAt,
    updatedBy: version.updatedBy,
    completionPercent: version.completionPercent,
    completionIssueCount: version.completionIssueCount,
    completionState: version.completionState,
    sections: cloneSections(version.sections),
  }
}

function cloneVersionSummary(version: OutlineVersionSummaryRecord): OutlineVersionSummaryRecord {
  return {
    id: version.id,
    courseId: version.courseId,
    versionName: version.versionName,
    semester: version.semester,
    status: version.status,
    archiveState: version.archiveState,
    archivedAt: version.archivedAt,
    note: version.note,
    updatedBy: version.updatedBy,
    updatedAt: version.updatedAt,
    completionPercent: version.completionPercent,
    completionIssueCount: version.completionIssueCount,
    completionState: version.completionState,
  }
}

function findVersion(
  courses: OutlineCourseRecord[],
  courseId: string,
  versionId: string,
): OutlineVersionRecord | undefined {
  return courses.find((course) => course.id === courseId)?.versions.find((version) => version.id === versionId)
}

function cloneSections(versionLike: OutlineVersionDraft['sections']): OutlineVersionDraft['sections'] {
  return {
    basicInfo: {
      ...versionLike.basicInfo,
      majors: [...versionLike.basicInfo.majors],
    },
    knowledgeGoals: versionLike.knowledgeGoals.map((goal) => ({ ...goal })),
    abilityGoals: versionLike.abilityGoals.map((goal) => ({ ...goal })),
    schedule: versionLike.schedule.map((item) => ({ ...item })),
    teachingMethods: {
      ...versionLike.teachingMethods,
      selected: [...versionLike.teachingMethods.selected],
    },
    assessment: {
      ...versionLike.assessment,
      usualItems: versionLike.assessment.usualItems.map((item) => ({ ...item })),
    },
    materials: {
      primary: versionLike.materials.primary.map((item) => ({ ...item })),
      references: versionLike.materials.references.map((item) => ({ ...item })),
    },
  }
}

function createPrintableDocument(
  course: OutlineCourseRecord,
  version: OutlineVersionRecord,
): PrintableOutlineDocument {
  const { sections } = version

  const printableSections: PrintableOutlineSection[] = [
    {
      id: 'basic-info',
      label: '课程基本信息',
      lines: [
        `课程名：${sections.basicInfo.courseName}`,
        `学分：${sections.basicInfo.credits}`,
        `学时：${sections.basicInfo.hours}`,
        `授课教师：${sections.basicInfo.instructor}`,
        `适用专业：${sections.basicInfo.majors.join('、')}`,
      ],
    },
    {
      id: 'goals',
      label: '课程目标',
      lines: [
        '知识目标：',
        ...sections.knowledgeGoals.map((goal) => `- ${goal.text}`),
        '能力目标：',
        ...sections.abilityGoals.map((goal) => `- ${goal.text}`),
      ],
    },
    {
      id: 'schedule',
      label: '教学内容与进度',
      lines: sections.schedule.map(
        (item) => `${item.weekLabel} - ${item.topic} - ${item.hours} 学时 - ${item.teachingMethod} - ${item.notes}`,
      ),
    },
    {
      id: 'methods',
      label: '教学方法',
      lines: [
        `教学方式：${sections.teachingMethods.selected.join('、')}`,
        sections.teachingMethods.notes || '无补充说明。',
      ],
    },
    {
      id: 'assessment',
      label: '考核方式',
      lines: [
        `平时：${sections.assessment.usualPercentage}%`,
        `期中：${sections.assessment.midtermPercentage}%`,
        `期末：${sections.assessment.finalPercentage}%`,
        ...sections.assessment.usualItems.map((item) => `- ${item.label}：${item.percentage}%`),
        sections.assessment.notes || '无补充说明。',
      ],
    },
    {
      id: 'materials',
      label: '教材与参考资料',
      lines: [
        '主教材：',
        ...sections.materials.primary.map((item) => `- ${item.title} / ${item.author} / ${item.source}`),
        '参考资料：',
        ...sections.materials.references.map((item) => `- ${item.title} / ${item.author} / ${item.source}`),
      ],
    },
  ]

  return {
    title: `${course.title}课程大纲`,
    versionLabel: `${version.versionName} · ${version.semester}`,
    metaLines: [
      `课程负责人：${course.instructor}`,
      `所属教研室：${course.department}`,
      `最近修改：${version.updatedAt.slice(0, 10)} · ${version.updatedBy}`,
    ],
    sections: printableSections,
  }
}
