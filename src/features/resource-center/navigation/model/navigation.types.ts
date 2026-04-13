import type { WorkbenchSectionKey } from '../../workbench/model/workbench.registry.ts'

export type NavigationKey = 'home' | 'resourceOverview' | WorkbenchSectionKey
export type NavigationIcon = 'home' | 'dashboard' | 'tree' | 'book' | 'layers' | 'play' | 'clipboard' | 'link'

export interface NavigationItem {
  key: NavigationKey
  label: string
  icon: NavigationIcon
  isExternalEntry: boolean
  hasUnsavedChanges: boolean
  active: boolean
}
