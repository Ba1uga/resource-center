import type { NavigationItem } from '../../navigation/model/navigation.types'

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

export interface DistributionSourceItem {
  label: string
  value: number
}

export interface DistributionItem extends DistributionSourceItem {
  ratio: number
}

export interface ChapterCoverageItem {
  chapter: string
  completion: number
  focus: string
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
  homeHighlights: HomeHighlight[]
  activeNavigation?: NavigationItem
  summary: DashboardSummary
}
