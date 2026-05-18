<script setup lang="ts">
import WorkbenchBulkBar from '../../shared/ui/WorkbenchBulkBar.vue'

defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  (event: 'apply-action', action: 'confirm' | 'remap' | 'ignore' | 'rerun'): void
}>()
</script>

<template>
  <WorkbenchBulkBar :selected-count="selectedCount">
    <template #default>
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
    </template>
  </WorkbenchBulkBar>
</template>
