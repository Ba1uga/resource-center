<script setup lang="ts" generic="Row">
import '../styles/workbench-table.css'

import { computed } from 'vue'

import WorkbenchTableEmptyState from './WorkbenchTableEmptyState.vue'

import type {
  WorkbenchDensity,
  WorkbenchMobileMode,
  WorkbenchSelectionMode,
  WorkbenchTableColumn,
  WorkbenchTableEmptyState as WorkbenchTableEmptyStateModel,
} from '../model/workbench-table.ts'

const props = withDefaults(
  defineProps<{
    rows: Row[]
    columns: WorkbenchTableColumn<Row>[]
    rowKey: keyof Row | ((row: Row) => string)
    density?: WorkbenchDensity
    mobileMode?: WorkbenchMobileMode
    selectable?: boolean
    selectedRowKeys?: string[]
    allVisibleSelected?: boolean
    selectionMode?: WorkbenchSelectionMode
    rowClickable?: boolean
    emptyState?: WorkbenchTableEmptyStateModel | null
  }>(),
  {
    density: 'comfortable',
    mobileMode: 'auto',
    selectable: false,
    selectedRowKeys: () => [],
    allVisibleSelected: false,
    selectionMode: 'page-only',
    rowClickable: false,
    emptyState: null,
  },
)

const emit = defineEmits<{
  (event: 'row-click', row: Row): void
  (event: 'toggle-row', row: Row): void
  (event: 'toggle-all-visible'): void
}>()

const showMobileCards = computed(() => props.mobileMode === 'cards')

function resolveRowKey(row: Row) {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }

  return String((row as Record<string, unknown>)[props.rowKey as string])
}

function resolveCellClassName(column: WorkbenchTableColumn<Row>, row: Row) {
  if (typeof column.cellClassName === 'function') {
    return column.cellClassName(row)
  }

  return column.cellClassName
}

function handleRowClick(row: Row) {
  if (!props.rowClickable) {
    return
  }

  emit('row-click', row)
}

function handleRowKeydown(event: KeyboardEvent, row: Row) {
  if (!props.rowClickable) {
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('row-click', row)
  }
}
</script>

<template>
  <div class="workbench-table-shell" :class="{ 'is-compact': density === 'compact' }">
    <div v-if="rows.length > 0 && !showMobileCards" class="workbench-table-shell__scroll">
      <table class="workbench-table">
        <thead>
          <tr>
            <th v-if="selectable" class="workbench-table__selection-column">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                :disabled="selectionMode !== 'page-only' && rows.length === 0"
                aria-label="全选当前页记录"
                @change="emit('toggle-all-visible')"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="column.headerClassName"
              :style="column.width ? { width: column.width } : undefined"
            >
              {{ column.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="resolveRowKey(row)"
            class="workbench-table__row"
            :class="{ 'is-clickable': rowClickable }"
            :tabindex="rowClickable ? 0 : undefined"
            @click="handleRowClick(row)"
            @keydown="handleRowKeydown($event, row)"
          >
            <td v-if="selectable" class="workbench-table__selection-column">
              <input
                type="checkbox"
                :checked="selectedRowKeys.includes(resolveRowKey(row))"
                aria-label="选择当前行"
                @click.stop
                @change="emit('toggle-row', row)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="resolveCellClassName(column, row)"
              :style="column.align ? { textAlign: column.align } : undefined"
            >
              <slot :name="`cell-${column.key}`" :row="row" :column="column">
                {{ (row as Record<string, unknown>)[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="rows.length > 0" class="workbench-table__mobile-cards">
      <template v-for="row in rows" :key="resolveRowKey(row)">
        <slot name="card" :row="row">
          <article class="workbench-table__mobile-card">
            <div
              v-for="column in columns.filter((item) => !item.hideOnMobile)"
              :key="column.key"
              class="workbench-table__mobile-card-row"
            >
              <span class="workbench-table__mobile-card-label">{{ column.mobileLabel ?? column.title }}</span>
              <div>
                <slot :name="`cell-${column.key}`" :row="row" :column="column">
                  {{ (row as Record<string, unknown>)[column.key] }}
                </slot>
              </div>
            </div>
          </article>
        </slot>
      </template>
    </div>

    <WorkbenchTableEmptyState
      v-else
      :title="emptyState?.title"
      :description="emptyState?.description"
    />
  </div>
</template>
