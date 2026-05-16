<script setup lang="ts">
import { computed } from 'vue'
import type { WorkbenchSummaryCard } from '../model/workbench-summary-cards.ts'
import {
  createWorkbenchSummaryCardRows,
  isWorkbenchSummaryFilterCard,
} from '../model/workbench-summary-cards.ts'
import '../styles/workbench-summary-cards.css'

const props = defineProps<{
  items: WorkbenchSummaryCard[]
}>()

const emit = defineEmits<{
  (event: 'select', key: string): void
}>()

const rows = computed(() => createWorkbenchSummaryCardRows(props.items))

function handleSelect(item: WorkbenchSummaryCard) {
  if (!item.interactive || !isWorkbenchSummaryFilterCard(item)) {
    return
  }

  emit('select', item.key)
}
</script>

<template>
  <section class="workbench-summary-cards" aria-label="资源统计概览">
    <div
      v-for="(row, rowIndex) in rows"
      :key="`summary-row-${rowIndex}`"
      class="workbench-summary-cards__row"
    >
      <template
        v-for="item in row"
        :key="item.key"
      >
        <button
          v-if="isWorkbenchSummaryFilterCard(item)"
          type="button"
          class="workbench-summary-cards__card"
          :class="{
            'is-filter': true,
            'is-active': item.active,
            'is-disabled': !item.interactive,
          }"
          :disabled="!item.interactive"
          :aria-pressed="item.interactive ? (item.active ? 'true' : 'false') : undefined"
          @click="handleSelect(item)"
        >
          <strong class="workbench-summary-cards__card-heading">{{ item.label }}：{{ item.value }}</strong>
          <p class="workbench-summary-cards__card-hint">{{ item.hint }}</p>
          <span class="workbench-summary-cards__card-action">{{ item.interactive ? '筛选' : '不可筛选' }}</span>
        </button>
        <article v-else class="workbench-summary-cards__card is-info">
          <strong class="workbench-summary-cards__card-heading">{{ item.label }}：{{ item.value }}</strong>
          <p class="workbench-summary-cards__card-hint">{{ item.hint }}</p>
        </article>
      </template>
    </div>
  </section>
</template>
