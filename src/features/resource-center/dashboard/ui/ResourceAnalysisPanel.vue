<script setup lang="ts">
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import type { DashboardViewModel } from '@/features/resource-center/dashboard/model/dashboard.types'

defineProps<{
  dashboard: DashboardViewModel
}>()
</script>

<template>
  <article class="panel analysis-panel">
    <div class="panel-head">
      <div>
        <p class="panel-kicker">资源分析</p>
        <h3>知识点挂载概况</h3>
      </div>
      <span class="panel-pill">{{ dashboard.summary.totalResources }} 份资源</span>
    </div>

    <div class="analysis-overview">
      <div class="overview-copy">
        <strong>{{ dashboard.summary.topModule.label }}</strong>
        <p>当前资源量最高，建议优先同步讲评资源与视频讲解。</p>
      </div>
      <div class="overview-trend">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="iconPaths.arrowTrend"></path>
        </svg>
        <span>资源增长稳步上升</span>
      </div>
    </div>

    <div class="distribution-chart">
      <div v-for="item in dashboard.distribution" :key="item.label" class="distribution-row">
        <div class="distribution-meta">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
        <div class="distribution-bar">
          <span :style="{ width: `${item.ratio}%` }"></span>
        </div>
      </div>
    </div>

    <div class="chapter-list">
      <article v-for="chapter in dashboard.chapters" :key="chapter.chapter" class="chapter-item">
        <div>
          <strong>{{ chapter.chapter }}</strong>
          <span>{{ chapter.focus }}</span>
        </div>
        <div class="chapter-progress">
          <span :style="{ width: `${chapter.completion}%` }"></span>
        </div>
        <em>{{ chapter.completion }}%</em>
      </article>
    </div>

    <div class="action-strip">
      <button v-for="action in dashboard.actions" :key="action.key" class="action-chip" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="iconPaths[action.icon]"></path>
        </svg>
        <span>
          <strong>{{ action.label }}</strong>
          <small>{{ action.caption }}</small>
        </span>
      </button>
    </div>
  </article>
</template>
