<script setup lang="ts">
import type { DashboardViewModel } from '@/features/resource-center/dashboard/model/dashboard.types'

defineProps<{
  dashboard: DashboardViewModel
}>()
</script>

<template>
  <article class="panel recent-panel">
    <div class="panel-head">
      <div>
        <p class="panel-kicker">最近动态</p>
        <h3>教师最近操作</h3>
      </div>
      <span class="panel-pill">今日 {{ dashboard.activities.length }} 条</span>
    </div>

    <ul class="activity-list">
      <li v-for="activity in dashboard.activities" :key="activity.id" class="activity-item">
        <div class="avatar-chip" :data-accent="activity.accent">{{ activity.initials }}</div>
        <div class="activity-main">
          <strong>{{ activity.actor }}</strong>
          <p>{{ activity.action }}</p>
          <span>{{ activity.note }}</span>
        </div>
        <time>{{ activity.time }}</time>
      </li>
    </ul>
  </article>
</template>
