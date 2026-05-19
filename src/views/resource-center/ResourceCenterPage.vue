<script setup lang="ts">
import './resource-center-page.css'

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createNavigationItems } from '@/features/resource-center/navigation/model/navigation.config.ts'
import {
  resolveWorkbenchSectionFromRouteParam,
  toResourceCenterSectionRoute,
} from '@/features/resource-center/navigation/model/navigation.routes.ts'
import type { NavigationItem } from '@/features/resource-center/navigation/model/navigation.types.ts'
import { adminProfile } from '@/features/resource-center/profile/model/profile.fixture.ts'
import { resolveWorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import ResourceCenterSidebar from '@/features/resource-center/navigation/ui/ResourceCenterSidebar.vue'
import WorkbenchSection from '@/features/resource-center/workbench/shared/ui/WorkbenchSection.vue'

const route = useRoute()
const router = useRouter()

const activeSection = computed(() => resolveWorkbenchSectionFromRouteParam(route.params.section))
const navigationItems = computed(() => createNavigationItems(activeSection.value))
const activeWorkbenchSection = computed(() => resolveWorkbenchSectionMeta(activeSection.value))

function handleNavigationClick(item: NavigationItem) {
  if (item.isExternalEntry || item.key === 'home') {
    // Placeholder for a future real homepage route or external jump target.
    return
  }

  router.push(toResourceCenterSectionRoute(item.key))
}
</script>

<template>
  <div class="page-shell">
    <div class="page-glow page-glow-left"></div>
    <div class="page-glow page-glow-right"></div>

    <div class="dashboard-frame">
      <ResourceCenterSidebar :items="navigationItems" :profile="adminProfile" @select="handleNavigationClick" />

      <main class="dashboard-main">
        <WorkbenchSection :section="activeWorkbenchSection" :current-admin-name="adminProfile.name" />
      </main>
    </div>
  </div>
</template>
