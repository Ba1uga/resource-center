<script setup lang="ts">
import './resource-center-page.css'

import { computed, ref } from 'vue'

import { createNavigationItems } from '@/features/resource-center/navigation/model/navigation.config.ts'
import type { NavigationItem } from '@/features/resource-center/navigation/model/navigation.types.ts'
import { teacherProfile } from '@/features/resource-center/profile/model/profile.fixture.ts'
import { resolveWorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import ResourceCenterSidebar from '@/features/resource-center/navigation/ui/ResourceCenterSidebar.vue'
import WorkbenchSection from '@/features/resource-center/workbench/shared/ui/WorkbenchSection.vue'

const activeSection = ref<NavigationItem['key']>('outline')
const navigationItems = computed(() => createNavigationItems(activeSection.value))
const activeWorkbenchSection = computed(() => resolveWorkbenchSectionMeta(activeSection.value))

function handleNavigationClick(item: NavigationItem) {
  if (item.isExternalEntry) {
    // Placeholder for a future real homepage route or external jump target.
    return
  }

  activeSection.value = item.key
}
</script>

<template>
  <div class="page-shell">
    <div class="page-glow page-glow-left"></div>
    <div class="page-glow page-glow-right"></div>

    <div class="dashboard-frame">
      <ResourceCenterSidebar :items="navigationItems" :profile="teacherProfile" @select="handleNavigationClick" />

      <main class="dashboard-main">
        <WorkbenchSection :section="activeWorkbenchSection" />
      </main>
    </div>
  </div>
</template>
