export const workbenchSectionKeys = [
  'outline',
  'textbook',
  'courseware',
  'video',
  'question',
  'mapping',
] as const

export type WorkbenchSectionKey = (typeof workbenchSectionKeys)[number]

export interface WorkbenchSectionMeta {
  key: WorkbenchSectionKey
  icon: 'tree' | 'book' | 'layers' | 'play' | 'clipboard' | 'link'
  navigationLabel: string
  title: string
  description: string
  kicker: string
  status: string
  placeholderTitle: string
  placeholderDescription: string
  hasUnsavedChanges: boolean
}

export const workbenchSectionByKey: Record<WorkbenchSectionKey, WorkbenchSectionMeta> = {
  outline: {
    key: 'outline',
    icon: 'tree',
    navigationLabel: '大纲管理',
    title: '大纲管理',
    description: '维护章节树、生成知识骨架与节点说明。',
    kicker: '模块工作台',
    status: '课件资源台',
    placeholderTitle: '大纲编辑入口将在这里展开',
    placeholderDescription: '后续这里会承接大纲节点维护、结构调整与骨架生成流程。',
    hasUnsavedChanges: false,
  },
  textbook: {
    key: 'textbook',
    icon: 'book',
    navigationLabel: '教材管理',
    title: '教材管理',
    description: '整理教材版本、章节切片与配套讲义。',
    kicker: '模块工作台',
    status: '工作台骨架',
    placeholderTitle: '教材资源入口将在这里展开',
    placeholderDescription: '后续这里会承接教材版本整理、章节切片与讲义归档入口。',
    hasUnsavedChanges: false,
  },
  courseware: {
    key: 'courseware',
    icon: 'layers',
    navigationLabel: '课件管理',
    title: '课件管理',
    description: '沉淀课件模板、课堂脚本与讲授备注。',
    kicker: '模块工作台',
    status: '工作台骨架',
    placeholderTitle: '课件工作台入口将在这里展开',
    placeholderDescription: '后续这里会承接课件模板沉淀、脚本维护与讲授备注整理。',
    hasUnsavedChanges: false,
  },
  video: {
    key: 'video',
    icon: 'play',
    navigationLabel: '视频管理',
    title: '视频管理',
    description: '按知识点整理微课、示范课与实验视频。',
    kicker: '模块工作台',
    status: '工作台骨架',
    placeholderTitle: '视频整理入口将在这里展开',
    placeholderDescription: '后续这里会承接视频归档、标签整理与内容补全工作。',
    hasUnsavedChanges: false,
  },
  question: {
    key: 'question',
    icon: 'clipboard',
    navigationLabel: '习题管理',
    title: '习题管理',
    description: '管理题型分类、难度标签与讲评素材。',
    kicker: '模块工作台',
    status: '工作台骨架',
    placeholderTitle: '习题编排入口将在这里展开',
    placeholderDescription: '后续这里会承接习题编排、标签维护与知识点标注流程。',
    hasUnsavedChanges: false,
  },
  mapping: {
    key: 'mapping',
    icon: 'link',
    navigationLabel: '资源和知识点挂载',
    title: '资源和知识点挂载',
    description: '集中完成资源挂载、核对与批量修正。',
    kicker: '模块工作台',
    status: '工作台骨架',
    placeholderTitle: '挂载工作台入口将在这里展开',
    placeholderDescription: '后续这里会承接资源关联核对、缺失修正与批量挂载流程。',
    hasUnsavedChanges: false,
  },
}

export function resolveWorkbenchSectionMeta(sectionKey: string): WorkbenchSectionMeta {
  if ((workbenchSectionKeys as readonly string[]).includes(sectionKey)) {
    return workbenchSectionByKey[sectionKey as WorkbenchSectionKey]
  }

  return workbenchSectionByKey.outline
}
