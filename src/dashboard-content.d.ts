export interface NavigationItem {
  key: string
  label: string
  icon: string
  active: boolean
}

export interface HomeHighlight {
  key: string
  label: string
  value: string
  detail: string
}

export interface MetricCard {
  key: string
  label: string
  value: number
  unit: string
  delta: string
  detail: string
  tone: string
}

export interface ResourceModule {
  key: string
  label: string
  count: number
  completion: number
  description: string
  accent: string
}

export interface ActivityItem {
  id: number
  actor: string
  initials: string
  accent: string
  action: string
  time: string
  note: string
}

export interface SuggestionItem {
  id: number
  level: string
  title: string
  description: string
  action: string
}

export interface QuickAction {
  key: string
  label: string
  caption: string
  icon: string
}

export interface DistributionItem {
  label: string
  value: number
  ratio: number
}

export interface ChapterCoverageItem {
  chapter: string
  completion: number
  focus: string
}

export interface TeacherProfile {
  name: string
  role: string
  campus: string
}

export interface DashboardSummary {
  totalResources: number
  averageCoverage: number
  topModule: ResourceModule
  coverageLabel: string
}

export interface DashboardViewModel {
  navigation: NavigationItem[]
  metrics: MetricCard[]
  modules: ResourceModule[]
  activities: ActivityItem[]
  suggestions: SuggestionItem[]
  actions: QuickAction[]
  distribution: DistributionItem[]
  chapters: ChapterCoverageItem[]
  profile: TeacherProfile
  homeHighlights: HomeHighlight[]
  activeNavigation?: NavigationItem
  summary: DashboardSummary
}

export const navigationItems: NavigationItem[]
export const homeHighlights: HomeHighlight[]
export const heroMetrics: MetricCard[]
export const resourceModules: ResourceModule[]
export const recentActivities: ActivityItem[]
export const aiSuggestions: SuggestionItem[]
export const quickActions: QuickAction[]
export const resourceDistribution: Array<{ label: string; value: number }>
export const chapterCoverage: ChapterCoverageItem[]
export const teacherProfile: TeacherProfile

export function createNavigationItems(activeKey?: string): NavigationItem[]
export function summarizeResourceModules(modules: ResourceModule[]): DashboardSummary
export function createDashboardViewModel(activeKey?: string): DashboardViewModel
