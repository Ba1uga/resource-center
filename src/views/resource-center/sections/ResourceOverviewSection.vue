<script setup lang="ts">
import '@/features/resource-center/dashboard/ui/dashboard-overview.css'

import type { DashboardViewModel } from '@/features/resource-center/dashboard/model/dashboard.types'
import AiSuggestionPanel from '@/features/resource-center/dashboard/ui/AiSuggestionPanel.vue'
import DashboardMetricsGrid from '@/features/resource-center/dashboard/ui/DashboardMetricsGrid.vue'
import RecentActivityPanel from '@/features/resource-center/dashboard/ui/RecentActivityPanel.vue'
import ResourceAnalysisPanel from '@/features/resource-center/dashboard/ui/ResourceAnalysisPanel.vue'
import ResourceModulePanel from '@/features/resource-center/dashboard/ui/ResourceModulePanel.vue'

defineProps<{
  dashboard: DashboardViewModel
}>()
</script>

<template>
  <DashboardMetricsGrid :dashboard="dashboard" />

  <section class="content-grid">
    <RecentActivityPanel :dashboard="dashboard" />
    <AiSuggestionPanel :dashboard="dashboard" />
  </section>

  <section class="bottom-grid">
    <ResourceModulePanel :dashboard="dashboard" />
    <ResourceAnalysisPanel :dashboard="dashboard" />
  </section>
</template>
