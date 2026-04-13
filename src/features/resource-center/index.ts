export { createNavigationItems } from './navigation/model/navigation.config.ts'
export { createDashboardViewModel } from './dashboard/model/dashboard.view-model.ts'
export { teacherProfile } from './profile/model/profile.fixture.ts'
export { iconPaths } from './shared/config/icons.ts'
export {
  workbenchSectionKeys,
  workbenchSectionByKey,
  resolveWorkbenchSectionMeta,
} from './workbench/model/workbench.registry.ts'

export type { NavigationItem, NavigationKey } from './navigation/model/navigation.types'
export type { DashboardViewModel } from './dashboard/model/dashboard.types'
export type { TeacherProfile } from './profile/model/profile.types'
export type { WorkbenchSectionKey, WorkbenchSectionMeta } from './workbench/model/workbench.registry.ts'
