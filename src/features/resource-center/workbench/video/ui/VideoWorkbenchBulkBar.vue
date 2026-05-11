<script setup lang="ts">
type VideoBulkAction = 'publish' | 'offline' | 'delete' | 'reassign-chapter' | 'tag'

defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (event: 'apply-action', action: VideoBulkAction): void
}>()
</script>

<template>
  <section class="video-management__bulk-bar" aria-label="批量操作">
    <strong class="video-management__bulk-count">已选 {{ selectedCount }} 条</strong>

    <div class="video-management__bulk-actions">
      <button type="button" @click="emit('apply-action', 'publish')">批量发布</button>
      <button type="button" @click="emit('apply-action', 'offline')">批量下架</button>
      <button type="button" @click="emit('apply-action', 'reassign-chapter')">批量改章节</button>
      <button type="button" @click="emit('apply-action', 'tag')">批量打标签</button>
      <button type="button" class="danger" @click="emit('apply-action', 'delete')">批量删除</button>
    </div>
  </section>
</template>
