<script setup lang="ts">
import type { DashboardViewModel } from '@/features/resource-center/dashboard/model/dashboard.types'

defineProps<{
  dashboard: DashboardViewModel
}>()
</script>

<template>
  <section class="metrics-grid">
    <article
      v-for="metric in dashboard.metrics"
      :key="metric.key"
      class="metric-card"
      :class="[`tone-${metric.tone}`, { featured: metric.key === 'outlineNodes' }]"
    >
      <div class="metric-head">
        <span>{{ metric.label }}</span>
        <span class="metric-chip">{{ metric.delta }}</span>
      </div>
      <div class="metric-value">
        {{ metric.value }}
        <small>{{ metric.unit }}</small>
      </div>
      <p>{{ metric.detail }}</p>
    </article>
  </section>
</template>
