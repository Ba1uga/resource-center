import { createNavigationItems } from '../../navigation/model/navigation.config.ts'
import type { NavigationKey } from '../../navigation/model/navigation.types'

import {
  aiSuggestions,
  chapterCoverage,
  heroMetrics,
  homeHighlights,
  quickActions,
  recentActivities,
  resourceDistribution,
  resourceModules,
} from './dashboard.fixtures.ts'
import { createDistributionItems, summarizeResourceModules } from './dashboard.selectors.ts'
import type { DashboardViewModel } from './dashboard.types'

export function createDashboardViewModel(activeKey: NavigationKey = 'resourceOverview'): DashboardViewModel {
  const navigation = createNavigationItems(activeKey)

  return {
    navigation,
    metrics: heroMetrics,
    modules: resourceModules,
    activities: recentActivities,
    suggestions: aiSuggestions,
    actions: quickActions,
    distribution: createDistributionItems(resourceDistribution),
    chapters: chapterCoverage,
    homeHighlights,
    activeNavigation: navigation.find((item) => item.active),
    summary: summarizeResourceModules(resourceModules),
  }
}
