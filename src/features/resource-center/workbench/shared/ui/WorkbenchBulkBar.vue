<script setup lang="ts">
import '../styles/workbench-bulk-bar.css'

import type { WorkbenchDensity } from '../model/workbench-table.ts'

withDefaults(
  defineProps<{
    selectedCount: number
    density?: WorkbenchDensity
  }>(),
  {
    density: 'comfortable',
  },
)

const emit = defineEmits<{
  (event: 'clear'): void
}>()
</script>

<template>
  <section class="workbench-bulk-bar" :class="{ 'is-compact': density === 'compact' }" aria-label="批量操作">
    <div class="workbench-bulk-bar__summary">
      <strong>已选择当前页 {{ selectedCount }} 项</strong>
      <button type="button" class="workbench-bulk-bar__clear" @click="emit('clear')">清空选择</button>
    </div>

    <div class="workbench-bulk-bar__actions">
      <slot />
    </div>
  </section>
</template>
