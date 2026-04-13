import type { NavigationItem } from './navigation.types'

const navigationDefinitions: Array<Pick<NavigationItem, 'key' | 'label' | 'icon'>> = [
  { key: 'home', label: '返回首页', icon: 'home' },
  { key: 'resourceOverview', label: '资源总览', icon: 'dashboard' },
  { key: 'outline', label: '大纲管理', icon: 'tree' },
  { key: 'textbook', label: '教材管理', icon: 'book' },
  { key: 'courseware', label: '课件管理', icon: 'layers' },
  { key: 'video', label: '视频管理', icon: 'play' },
  { key: 'question', label: '习题管理', icon: 'clipboard' },
  { key: 'mapping', label: '资源和知识点挂载', icon: 'link' },
]

const externalEntryKeys = new Set(['home'])
const unsavedNavigationKeys = new Set(['courseware'])

export function createNavigationItems(activeKey = 'resourceOverview'): NavigationItem[] {
  return navigationDefinitions.map((item) => ({
    ...item,
    isExternalEntry: externalEntryKeys.has(item.key),
    hasUnsavedChanges: unsavedNavigationKeys.has(item.key),
    active: item.key === activeKey,
  }))
}
