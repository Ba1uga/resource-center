<script setup lang="ts">
import '../styles/workbench-table.css'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="workbench-table__empty">
    <strong>{{ title ?? '暂无数据' }}</strong>
    <p>{{ description ?? '请稍后再试。' }}</p>
  </div>
</template>
