import type {
  OutlineMaterialsState,
  OutlineVersionDraft,
  OutlineVersionRecord,
  OutlineVersionSectionState,
  OutlineVersionStatus,
} from './outline-workbench.types.ts'

export interface CreateOutlineVersionDraftOptions {
  courseId?: string
  versionName?: string
  semester?: string
  status?: OutlineVersionStatus
  note?: string
  updatedBy?: string
  sections?: Partial<OutlineVersionSectionState>
}

function createEmptyOutlineSections(): OutlineVersionSectionState {
  return {
    basicInfo: {
      courseName: '',
      credits: 0,
      hours: 0,
      instructor: '',
      majors: [],
    },
    knowledgeGoals: [],
    abilityGoals: [],
    schedule: [],
    teachingMethods: {
      selected: [],
      notes: '',
    },
    assessment: {
      usualPercentage: 0,
      midtermPercentage: 0,
      finalPercentage: 0,
      usualItems: [],
      notes: '',
    },
    materials: createEmptyMaterials(),
  }
}

export function createOutlineVersionDraft(
  options: CreateOutlineVersionDraftOptions = {},
): OutlineVersionDraft {
  const sections = cloneSections(options.sections ? mergeSections(createEmptyOutlineSections(), options.sections) : createEmptyOutlineSections())

  return {
    courseId: options.courseId ?? '',
    versionName: options.versionName ?? '',
    semester: options.semester ?? '',
    status: options.status ?? 'draft',
    note: options.note ?? '',
    updatedBy: options.updatedBy ?? '',
    sections,
  }
}

export function createOutlineVersionDraftFromVersion(version: OutlineVersionRecord): OutlineVersionDraft {
  return {
    courseId: version.courseId,
    versionName: version.versionName,
    semester: version.semester,
    status: version.status,
    note: version.note,
    updatedBy: version.updatedBy,
    sections: cloneSections(version.sections),
  }
}

function createEmptyMaterials(): OutlineMaterialsState {
  return {
    primary: [],
    references: [],
  }
}

function mergeSections(
  base: OutlineVersionSectionState,
  overrides: Partial<OutlineVersionSectionState>,
): OutlineVersionSectionState {
  return {
    ...base,
    ...overrides,
    basicInfo: {
      ...base.basicInfo,
      ...overrides.basicInfo,
    },
    knowledgeGoals: overrides.knowledgeGoals ?? base.knowledgeGoals,
    abilityGoals: overrides.abilityGoals ?? base.abilityGoals,
    schedule: overrides.schedule ?? base.schedule,
    teachingMethods: {
      ...base.teachingMethods,
      ...overrides.teachingMethods,
    },
    assessment: {
      ...base.assessment,
      ...overrides.assessment,
    },
    materials: {
      ...base.materials,
      ...overrides.materials,
    },
  }
}

function cloneSections(sections: OutlineVersionSectionState): OutlineVersionSectionState {
  return {
    basicInfo: {
      ...sections.basicInfo,
      majors: [...sections.basicInfo.majors],
    },
    knowledgeGoals: sections.knowledgeGoals.map((goal) => ({ ...goal })),
    abilityGoals: sections.abilityGoals.map((goal) => ({ ...goal })),
    schedule: sections.schedule.map((item) => ({ ...item })),
    teachingMethods: {
      ...sections.teachingMethods,
      selected: [...sections.teachingMethods.selected],
    },
    assessment: {
      ...sections.assessment,
      usualItems: sections.assessment.usualItems.map((item) => ({ ...item })),
    },
    materials: {
      primary: sections.materials.primary.map((item) => ({ ...item })),
      references: sections.materials.references.map((item) => ({ ...item })),
    },
  }
}
