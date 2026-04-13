import type { NavigationItem } from './navigation.types'
import {
  workbenchSectionByKey,
  workbenchSectionKeys,
  type WorkbenchSectionKey,
} from '../../workbench/shared/model/workbench.registry.ts'

const baseNavigationDefinitions: Array<Pick<NavigationItem, 'key' | 'label' | 'icon'>> = [
  { key: 'home', label: '返回首页', icon: 'home' },
]

const workbenchNavigationDefinitions: Array<Pick<NavigationItem, 'key' | 'label' | 'icon'>> = workbenchSectionKeys.map(
  (key) => ({
    key,
    label: workbenchSectionByKey[key].navigationLabel,
    icon: workbenchSectionByKey[key].icon,
  }),
)

const navigationDefinitions = [...baseNavigationDefinitions, ...workbenchNavigationDefinitions]
const externalEntryKeys = new Set<NavigationItem['key']>(['home'])

function isWorkbenchSectionKey(key: NavigationItem['key']): key is WorkbenchSectionKey {
  return (workbenchSectionKeys as readonly string[]).includes(key)
}

export function createNavigationItems(activeKey: NavigationItem['key'] = 'outline'): NavigationItem[] {
  return navigationDefinitions.map((item) => ({
    ...item,
    isExternalEntry: externalEntryKeys.has(item.key),
    hasUnsavedChanges: isWorkbenchSectionKey(item.key) ? workbenchSectionByKey[item.key].hasUnsavedChanges : false,
    active: item.key === activeKey,
  }))
}
