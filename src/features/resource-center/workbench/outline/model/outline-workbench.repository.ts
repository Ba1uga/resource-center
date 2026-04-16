import { createOutlineVersionDraft } from './outline-workbench.editor.ts'
import { outlineWorkbenchCourses } from './outline-workbench.fixtures.ts'
import { canExportOutlineVersion, validateOutlineVersionForExport } from './outline-workbench.validation.ts'

import type {
  CreateOutlineVersionInput,
  DuplicateOutlineVersionInput,
  OutlineCourseRecord,
  OutlineExportResult,
  OutlineVersionDraft,
  OutlineVersionRecord,
  OutlineVersionSectionState,
  PrintableOutlineDocument,
  PrintableOutlineSection,
} from './outline-workbench.types.ts'

export interface CreateOutlineWorkbenchRepositoryOptions {
  now?: () => string
  createId?: () => string
}

export function createOutlineWorkbenchRepository(options: CreateOutlineWorkbenchRepositoryOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString())
  const createId = options.createId ?? createDefaultIdFactory()

  let courses = cloneCourses(outlineWorkbenchCourses)

  return {
    listCourses(): OutlineCourseRecord[] {
      return cloneCourses(courses)
    },
    getCourse(courseId: string): OutlineCourseRecord | undefined {
      return cloneCourses(courses).find((course) => course.id === courseId)
    },
    getVersion(courseId: string, versionId: string): OutlineVersionRecord | undefined {
      return this.getCourse(courseId)?.versions.find((version) => version.id === versionId)
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
  return courses.map((course) => ({
    ...course,
    versions: course.versions.map((version) => cloneCourseVersion(version)),
  }))
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
    sections: cloneSections(version.sections),
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
