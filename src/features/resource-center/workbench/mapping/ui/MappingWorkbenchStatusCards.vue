<script setup lang="ts">
import type {
  MappingSummaryCard,
  MappingSummaryCardKey,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

defineProps<{
  items: MappingSummaryCard[]
}>()

const emit = defineEmits<{
  (event: 'select-status', status: MappingSummaryCardKey): void
}>()
</script>

<template>
  <div class="mapping-management__status-overview">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      class="mapping-management__summary-card"
      :class="{ 'is-active': item.isActive }"
      :aria-pressed="item.isActive ? 'true' : 'false'"
      @click="emit('select-status', item.key)"
    >
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
      <p>{{ item.hint }}</p>
    </button>
  </div>
</template>
