<script setup lang="ts">
import type { DashboardViewModel } from '@/features/resource-center/dashboard/model/dashboard.types'

defineProps<{
  dashboard: DashboardViewModel
}>()
</script>

<template>
  <article class="panel signal-panel">
    <div class="panel-head">
      <div>
        <p class="panel-kicker">AI 智能建议</p>
        <h3>今日优先事项</h3>
      </div>
      <span class="panel-pill solid">建议驱动</span>
    </div>

    <div class="suggestion-stack">
      <article v-for="suggestion in dashboard.suggestions" :key="suggestion.id" class="suggestion-card">
        <span class="suggestion-level">{{ suggestion.level }}</span>
        <h4>{{ suggestion.title }}</h4>
        <p>{{ suggestion.description }}</p>
        <button type="button">{{ suggestion.action }}</button>
      </article>
    </div>
  </article>
</template>
