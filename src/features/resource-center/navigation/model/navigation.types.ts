export interface NavigationItem {
  key: string
  label: string
  icon: string
  isExternalEntry: boolean
  hasUnsavedChanges: boolean
  active: boolean
}
