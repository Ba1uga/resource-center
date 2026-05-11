<script setup lang="ts">
import type {
  VideoOverviewStatus,
  VideoSummaryCard,
} from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'

defineProps<{
  items: VideoSummaryCard[]
}>()

const emit = defineEmits<{
  (event: 'select-status', status: VideoOverviewStatus): void
}>()
</script>

<template>
  <section class="video-management__status-overview" aria-label="视频状态总览">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="video-management__status-card"
      :class="{ 'is-active': item.isActive }"
      @click="emit('select-status', item.key)"
    >
      <span class="video-management__status-label">{{ item.label }}</span>
      <strong class="video-management__status-count">{{ item.count }}</strong>
    </button>
  </section>
</template>
