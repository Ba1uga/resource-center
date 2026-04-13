<script setup lang="ts">
import './styles/resource-center-page.css'

import { computed, ref } from 'vue'

import { createDashboardViewModel, teacherProfile, type NavigationItem } from '@/features/resource-center/index.ts'
import ResourceCenterSidebar from '@/features/resource-center/navigation/ui/ResourceCenterSidebar.vue'
import ResourceCenterTopbar from '@/views/resource-center/layout/ResourceCenterTopbar.vue'
import ResourceOverviewSection from '@/views/resource-center/sections/ResourceOverviewSection.vue'
import ResourcePlaceholderSection from '@/views/resource-center/sections/ResourcePlaceholderSection.vue'

const activeSection = ref('resourceOverview')
const dashboard = computed(() => createDashboardViewModel(activeSection.value))

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

        <template v-if="activeSection === 'resourceOverview'">
          <ResourceOverviewSection :dashboard="dashboard" />
        </template>

        <ResourcePlaceholderSection v-else :active-navigation="dashboard.activeNavigation" />
      </main>
    </div>
  </div>
</template>
