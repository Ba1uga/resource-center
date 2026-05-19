import {
  workbenchSectionKeys,
  type WorkbenchSectionKey,
} from '../../workbench/shared/model/workbench.registry.ts'

export const resourceCenterSectionRouteName = 'resource-center-section'

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

  return 'outline'
}

export function toResourceCenterSectionRoute(section: WorkbenchSectionKey) {
  return {
    name: resourceCenterSectionRouteName,
    params: { section },
  }
}
