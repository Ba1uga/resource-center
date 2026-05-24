<script setup lang="ts">
import { computed } from 'vue'

import type { MountTask } from '@/api/mount.ts'

const props = defineProps<{
  task: MountTask | null
  loading: boolean
}>()

const phaseLabel = computed(() => {
  if (!props.task) return ''
  const labels: Record<string, string> = {
    queued: '排队中',
    parsing: '解析文档',
    chunking: '智能分块',
    embedding: '向量化',
    matching: 'AI 匹配',
    deciding: '置信度评估',
    reviewing: '等待审核',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return labels[props.task.status] || props.task.status
})

const statusClass = computed(() => {
  if (!props.task) return ''
  if (props.task.status === 'completed') return 'is-success'
  if (props.task.status === 'failed') return 'is-error'
  return 'is-running'
})

const progressPercent = computed(() => {
  if (!props.task) return 0
  return Math.round((props.task.progress || 0) * 100)
})
</script>

<template>
  <div v-if="loading" class="mount-task-progress">
    <div class="mount-task-progress__bar">
      <div class="mount-task-progress__track mount-task-progress__track--indeterminate" />
    </div>
    <span class="mount-task-progress__label">加载中...</span>
  </div>

  <div v-else-if="task" class="mount-task-progress" :class="statusClass">
    <div class="mount-task-progress__bar">
      <div
        class="mount-task-progress__track"
        :style="{ width: progressPercent + '%' }"
        :class="statusClass"
      />
    </div>
    <div class="mount-task-progress__info">
      <span class="mount-task-progress__label">{{ phaseLabel }}</span>
      <span class="mount-task-progress__detail">{{ task.phaseDetail }}</span>
      <span class="mount-task-progress__percent">{{ progressPercent }}%</span>
    </div>
    <div v-if="task.status === 'failed' && task.errorMessage" class="mount-task-progress__error">
      {{ task.errorMessage }}
    </div>
  </div>
</template>
