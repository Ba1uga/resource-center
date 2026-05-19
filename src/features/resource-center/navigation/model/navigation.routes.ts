import type { RouteComponent, RouteRecordRaw } from 'vue-router'

import {
  workbenchSectionKeys,
  type WorkbenchSectionKey,
} from '../../workbench/shared/model/workbench.registry.ts'

export const defaultWorkbenchSectionKey: WorkbenchSectionKey = 'outline'
export const resourceCenterSectionRouteName = 'resource-center-section'
export const resourceCenterRootRedirectPath = `/resource-center/${defaultWorkbenchSectionKey}`
export const resourceCenterSectionRoutePath = '/resource-center/:section'

export function isWorkbenchSectionKey(section: string): section is WorkbenchSectionKey {
  return (workbenchSectionKeys as readonly string[]).includes(section)
}

export function resolveWorkbenchSectionFromRouteParam(
  section: string | string[] | undefined,
): WorkbenchSectionKey {
  const normalizedSection = Array.isArray(section) ? section[0] : section

  if (normalizedSection && isWorkbenchSectionKey(normalizedSection)) {
    return normalizedSection
  }

  return defaultWorkbenchSectionKey
}

export function toResourceCenterSectionRoute(section: WorkbenchSectionKey) {
  return {
    name: resourceCenterSectionRouteName,
    params: { section },
  }
}

export function createResourceCenterRouteRecords(
  component: RouteComponent,
): readonly RouteRecordRaw[] {
  return [
    {
      path: '/',
      redirect: resourceCenterRootRedirectPath,
    },
    {
      path: resourceCenterSectionRoutePath,
      name: resourceCenterSectionRouteName,
      component,
    },
  ]
}
