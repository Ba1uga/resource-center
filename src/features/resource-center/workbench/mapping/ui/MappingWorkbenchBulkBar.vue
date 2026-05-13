<script setup lang="ts">
defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (event: 'apply-action', action: 'confirm' | 'remap' | 'ignore' | 'rerun'): void
}>()
</script>

<template>
  <div class="mapping-management__bulk-bar" role="region" aria-label="批量操作栏">
    <strong>已选中 {{ selectedCount }} 条记录</strong>

    <div class="mapping-management__bulk-actions">
      <button type="button" class="mapping-management__bulk-button is-primary" @click="emit('apply-action', 'confirm')">
        批量确认
      </button>
      <button type="button" class="mapping-management__bulk-button" @click="emit('apply-action', 'remap')">
        重新挂载
      </button>
      <button type="button" class="mapping-management__bulk-button" @click="emit('apply-action', 'ignore')">
        忽略记录
      </button>
      <button type="button" class="mapping-management__bulk-button" @click="emit('apply-action', 'rerun')">
        重新运行
      </button>
    </div>
  </div>
</template>
