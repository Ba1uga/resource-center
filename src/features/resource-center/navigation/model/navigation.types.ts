import type { WorkbenchSectionKey } from '../../workbench/shared/model/workbench.registry.ts'

export type NavigationKey = 'home' | WorkbenchSectionKey
export type NavigationIcon = 'home' | 'tree' | 'book' | 'layers' | 'play' | 'clipboard' | 'link'

export interface NavigationItem {
  key: NavigationKey
  label: string
  icon: NavigationIcon
  isExternalEntry: boolean
  hasUnsavedChanges: boolean
  active: boolean
}
