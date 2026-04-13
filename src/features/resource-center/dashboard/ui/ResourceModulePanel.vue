<script setup lang="ts">
import type { DashboardViewModel } from '@/features/resource-center/dashboard/model/dashboard.types'

defineProps<{
  dashboard: DashboardViewModel
}>()
</script>

<template>
  <article class="panel module-panel">
    <div class="panel-head">
      <div>
        <p class="panel-kicker">快捷入口</p>
        <h3>资源模块一览</h3>
      </div>
      <span class="panel-pill">{{ dashboard.summary.coverageLabel }}</span>
    </div>

    <div class="module-grid">
      <article
        v-for="module in dashboard.modules"
        :key="module.key"
        class="module-card"
        :data-accent="module.accent"
      >
        <div class="module-card-head">
          <h4>{{ module.label }}</h4>
          <span>{{ module.count }} 项</span>
        </div>
        <p>{{ module.description }}</p>
        <div class="module-progress">
          <span>完成度</span>
          <strong>{{ module.completion }}%</strong>
        </div>
      </article>
    </div>
  </article>
</template>
