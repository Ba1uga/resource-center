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
  <section class="overview-shell workbench-surface">
    <DashboardMetricsGrid :dashboard="dashboard" />

    <section class="content-grid">
      <RecentActivityPanel :dashboard="dashboard" />
      <AiSuggestionPanel :dashboard="dashboard" />
    </section>

    <section class="analysis-row">
      <ResourceAnalysisPanel :dashboard="dashboard" />
    </section>
  </section>

  <section class="module-section">
    <ResourceModulePanel :dashboard="dashboard" />
  </section>
</template>
