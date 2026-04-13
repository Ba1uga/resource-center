<script setup lang="ts">
import './styles/resource-center-page.css'

import { computed, ref } from 'vue'

import {
  createDashboardViewModel,
  resolveWorkbenchSectionMeta,
  teacherProfile,
  type NavigationItem,
} from '@/features/resource-center/index.ts'
import ResourceCenterSidebar from '@/features/resource-center/navigation/ui/ResourceCenterSidebar.vue'
import ResourceCenterTopbar from '@/views/resource-center/layout/ResourceCenterTopbar.vue'
import ResourceOverviewSection from '@/views/resource-center/sections/ResourceOverviewSection.vue'
import WorkbenchSection from '@/views/resource-center/sections/WorkbenchSection.vue'

const activeSection = ref<NavigationItem['key']>('resourceOverview')
const dashboard = computed(() => createDashboardViewModel(activeSection.value))
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
      <ResourceCenterSidebar :items="dashboard.navigation" @select="handleNavigationClick" />

      <main class="dashboard-main">
        <ResourceCenterTopbar :profile="teacherProfile" />

        <ResourceOverviewSection v-if="activeSection === 'resourceOverview'" :dashboard="dashboard" />

        <WorkbenchSection v-else :section="activeWorkbenchSection" />
      </main>
    </div>
  </div>
</template>
