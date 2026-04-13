import type {
  DashboardSummary,
  DistributionItem,
  DistributionSourceItem,
  ResourceModule,
} from './dashboard.types'

export function summarizeResourceModules(modules: ResourceModule[]): DashboardSummary {
  const totalResources = modules.reduce((sum, module) => sum + module.count, 0)
  const averageCoverage = Math.round(
    modules.reduce((sum, module) => sum + module.completion, 0) / modules.length,
  )
  const topModule = [...modules].sort((left, right) => right.count - left.count)[0]!

  return {
    totalResources,
    averageCoverage,
    topModule,
    coverageLabel: `挂载完成率 ${averageCoverage}%`,
  }
}

export function createDistributionItems(items: DistributionSourceItem[]): DistributionItem[] {
  const max = Math.max(...items.map((item) => item.value))
  return items.map((item) => ({
    ...item,
    ratio: Math.round((item.value / max) * 100),
  }))
}
