const navigationDefinitions = [
  { key: 'home', label: '返回首页', icon: 'home' },
  { key: 'resourceOverview', label: '资源总览', icon: 'dashboard' },
  { key: 'outline', label: '大纲管理', icon: 'tree' },
  { key: 'textbook', label: '教材管理', icon: 'book' },
  { key: 'courseware', label: '课件管理', icon: 'layers' },
  { key: 'video', label: '视频管理', icon: 'play' },
  { key: 'question', label: '习题管理', icon: 'clipboard' },
  { key: 'mapping', label: '资源和知识点挂载', icon: 'link' },
]

export function createNavigationItems(activeKey = 'home') {
  return navigationDefinitions.map((item) => ({
    ...item,
    active: item.key === activeKey,
  }))
}

export const navigationItems = createNavigationItems()

export const heroMetrics = [
  {
    key: 'outlineNodes',
    label: '大纲节点',
    value: 128,
    unit: '个',
    delta: '+12',
    detail: '较上周新增 2 个章节骨架',
    tone: 'primary',
  },
  {
    key: 'textbooks',
    label: '教材资源',
    value: 54,
    unit: '份',
    delta: '+6%',
    detail: '已覆盖高一至高三核心专题',
    tone: 'neutral',
  },
  {
    key: 'courseware',
    label: '课件资源',
    value: 72,
    unit: '份',
    delta: '+9%',
    detail: '18 份课件待补充课后练习',
    tone: 'neutral',
  },
  {
    key: 'videos',
    label: '视频资源',
    value: 48,
    unit: '段',
    delta: '+4',
    detail: '本周新增 4 段微课视频',
    tone: 'neutral',
  },
  {
    key: 'questions',
    label: '习题总量',
    value: 126,
    unit: '题',
    delta: '+18',
    detail: '主观题知识点标注准确率 94%',
    tone: 'neutral',
  },
  {
    key: 'pendingMappings',
    label: '待处理挂载',
    value: 12,
    unit: '项',
    delta: '优先',
    detail: '其中 5 项为 AI 高置信建议',
    tone: 'warning',
  },
]

export const resourceModules = [
  {
    key: 'outline',
    label: '大纲管理',
    count: 86,
    completion: 93,
    description: '维护教学章节树、生成知识骨架与节点说明。',
    accent: 'ocean',
  },
  {
    key: 'textbook',
    label: '教材管理',
    count: 54,
    completion: 88,
    description: '整理教材版本、章节切片与配套讲义。',
    accent: 'sand',
  },
  {
    key: 'courseware',
    label: '课件管理',
    count: 72,
    completion: 84,
    description: '沉淀课件模板、课堂脚本与讲授备注。',
    accent: 'moss',
  },
  {
    key: 'video',
    label: '视频管理',
    count: 48,
    completion: 76,
    description: '按知识点整理微课、示范课与实验视频。',
    accent: 'ink',
  },
  {
    key: 'question',
    label: '习题管理',
    count: 126,
    completion: 81,
    description: '管理题型分类、难度标签与讲评素材。',
    accent: 'coral',
  },
  {
    key: 'mapping',
    label: '挂载台',
    count: 50,
    completion: 82,
    description: '集中完成资源挂载、核对与批量修正。',
    accent: 'violet',
  },
]

export const recentActivities = [
  {
    id: 1,
    actor: '林老师',
    initials: '林',
    accent: 'ocean',
    action: '上传了《函数单调性》课件',
    time: '8 分钟前',
    note: '自动关联到“导数应用”专题。',
  },
  {
    id: 2,
    actor: '周老师',
    initials: '周',
    accent: 'coral',
    action: '更新了“递归算法”视频标签',
    time: '26 分钟前',
    note: '补充了学习目标与课堂建议。',
  },
  {
    id: 3,
    actor: '陈老师',
    initials: '陈',
    accent: 'moss',
    action: '完成 8 道习题知识点标注',
    time: '1 小时前',
    note: '覆盖“数列求和”和“递推关系”。',
  },
  {
    id: 4,
    actor: '教研组',
    initials: '研',
    accent: 'ink',
    action: '确认了第二章资源挂载方案',
    time: '今天 09:20',
    note: '待同步到高一数学备课组。',
  },
]

export const aiSuggestions = [
  {
    id: 1,
    level: '高优先',
    title: '为 3.2 函数极值补充 2 个视频资源',
    description: '检测到该节点下课件完整，但视频讲解仍为空缺。',
    action: '查看推荐',
  },
  {
    id: 2,
    level: '待确认',
    title: '12 道习题尚未绑定知识点',
    description: '建议批量标注到“导数综合应用”和“切线方程”。',
    action: '批量处理',
  },
  {
    id: 3,
    level: '可生成',
    title: '本章大纲草稿可一键生成',
    description: '根据教材目录与近三次备课内容生成初稿。',
    action: '立即生成',
  },
]

export const quickActions = [
  { key: 'generate', label: 'AI 生成大纲', caption: '根据教材章节生成骨架', icon: 'spark' },
  { key: 'inspect', label: '检查未挂载资源', caption: '快速定位缺失关联', icon: 'radar' },
  { key: 'mapping', label: '进入挂载台', caption: '处理今日待确认建议', icon: 'arrowUp' },
]

export const resourceDistribution = [
  { label: '教材', value: 54 },
  { label: '课件', value: 72 },
  { label: '视频', value: 48 },
  { label: '习题', value: 126 },
  { label: '大纲附件', value: 36 },
]

export const chapterCoverage = [
  { chapter: '第一章 集合与函数', completion: 96, focus: '资源完备' },
  { chapter: '第二章 导数应用', completion: 88, focus: '待补视频' },
  { chapter: '第三章 数列', completion: 82, focus: '习题待标注' },
  { chapter: '第四章 立体几何', completion: 74, focus: '需新增课件' },
]

export const teacherProfile = {
  name: '林知夏',
  role: '高中数学教研员',
  campus: '苏州校区',
}

export const homeHighlights = [
  {
    key: 'pace',
    label: '今日节奏',
    value: '82%',
    detail: '资源挂载建议正在持续学习你的教学节奏。',
  },
  {
    key: 'focus',
    label: '当前聚焦',
    value: '导数应用',
    detail: '本周优先补齐视频讲解和综合题讲评素材。',
  },
  {
    key: 'next',
    label: '下一步动作',
    value: '进入资源总览',
    detail: '查看统计、最近动态与 AI 建议后再进入具体模块。',
  },
]

export function summarizeResourceModules(modules) {
  const totalResources = modules.reduce((sum, module) => sum + module.count, 0)
  const averageCoverage = Math.round(
    modules.reduce((sum, module) => sum + module.completion, 0) / modules.length,
  )
  const topModule = [...modules].sort((left, right) => right.count - left.count)[0]

  return {
    totalResources,
    averageCoverage,
    topModule,
    coverageLabel: `挂载完成率 ${averageCoverage}%`,
  }
}

export function createDashboardViewModel(activeKey = 'home') {
  const summary = summarizeResourceModules(resourceModules)
  const distributionMax = Math.max(...resourceDistribution.map((item) => item.value))
  const activeNavigation = createNavigationItems(activeKey).find((item) => item.active)

  return {
    navigation: createNavigationItems(activeKey),
    metrics: heroMetrics,
    modules: resourceModules,
    activities: recentActivities,
    suggestions: aiSuggestions,
    actions: quickActions,
    distribution: resourceDistribution.map((item) => ({
      ...item,
      ratio: Math.round((item.value / distributionMax) * 100),
    })),
    chapters: chapterCoverage,
    profile: teacherProfile,
    homeHighlights,
    activeNavigation,
    summary,
  }
}
