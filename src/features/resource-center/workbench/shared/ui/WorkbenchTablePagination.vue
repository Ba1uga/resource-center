<script setup lang="ts">
import '../styles/workbench-pagination.css'

import { computed, ref, watch } from 'vue'

import { buildWorkbenchPaginationItems } from '@/features/resource-center/workbench/shared/model/workbench-pagination.ts'
import WorkbenchSelect from './WorkbenchSelect.vue'

interface WorkbenchPaginationState {
  page: number
  pageSize: number
  total: number
  pageCount: number
  from: number
  to: number
  hasPrev: boolean
  hasNext: boolean
}

const props = withDefaults(
  defineProps<{
    pagination: WorkbenchPaginationState
    showQuickJumper?: boolean
    emptyLabel?: string
    pageSize?: number
    pageSizeOptions?: number[]
    simple?: boolean
  }>(),
  {
    showQuickJumper: false,
    emptyLabel: '暂无结果',
    pageSizeOptions: () => [],
    simple: false,
  },
)

const emit = defineEmits<{
  (event: 'page-change', page: number): void
  (event: 'page-size-change', pageSize: number): void
}>()

const chevronLeftPath = 'M14.5 6.5 8.5 12l6 5.5'
const chevronRightPath = 'M9.5 6.5 15.5 12l-6 5.5'
const jumpPageInput = ref('')

const paginationItems = computed(() =>
  buildWorkbenchPaginationItems({
    page: props.pagination.page,
    pageCount: props.pagination.pageCount,
  }),
)

const showPageSizeSelector = computed(
  () => props.pageSizeOptions.length > 0 && typeof props.pageSize === 'number',
)

watch(
  () => [props.pagination.page, props.pagination.pageCount],
  () => {
    jumpPageInput.value = ''
  },
)

function applyJumpPage() {
  const targetPage = Number.parseInt(jumpPageInput.value, 10)
  if (!Number.isFinite(targetPage)) {
    jumpPageInput.value = ''
    return
  }

  emit('page-change', Math.min(props.pagination.pageCount, Math.max(1, targetPage)))
  jumpPageInput.value = ''
}

function handlePageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement | null
  const pageSize = Number.parseInt(target?.value ?? '', 10)

  if (!Number.isFinite(pageSize)) {
    return
  }

  emit('page-size-change', pageSize)
}
</script>

<template>
  <div class="workbench-pagination" :class="{ 'is-simple': simple }">
    <div class="workbench-pagination__summary">
      <strong v-if="!simple" class="workbench-pagination__page-status">第 {{ pagination.page }} / {{ pagination.pageCount }} 页</strong>
      <span v-if="pagination.total > 0">显示 {{ pagination.from }} - {{ pagination.to }} 条，共 {{ pagination.total }} 条</span>
      <span v-else>{{ emptyLabel }}</span>
      <label v-if="showPageSizeSelector && simple" class="workbench-pagination__page-size">
        <WorkbenchSelect
          :model-value="String(pageSize)"
          aria-label="设置每页条数"
          size="sm"
          drop-up
          :options="pageSizeOptions.map((option) => ({ value: String(option), label: `${option} 条/页` }))"
          @update:model-value="emit('page-size-change', Number($event))"
        />
      </label>
    </div>

    <div class="workbench-pagination__controls">
      <button
        type="button"
        class="workbench-pagination__button workbench-pagination__button--nav"
        :disabled="!pagination.hasPrev"
        aria-label="上一页"
        @click="emit('page-change', pagination.page - 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            :d="chevronLeftPath"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          ></path>
        </svg>
      </button>

      <template v-if="simple">
        <span class="workbench-pagination__page-indicator">第 {{ pagination.page }} / {{ pagination.pageCount }} 页</span>
      </template>
      <template v-else>
        <template v-for="(item, index) in paginationItems" :key="`${item}-${index}`">
          <span v-if="item === 'ellipsis'" class="workbench-pagination__ellipsis">...</span>
          <button
            v-else
            type="button"
            class="workbench-pagination__button"
            :class="{ 'is-active': item === pagination.page }"
            @click="emit('page-change', item)"
          >
            {{ item }}
          </button>
        </template>
      </template>

      <button
        type="button"
        class="workbench-pagination__button workbench-pagination__button--nav"
        :disabled="!pagination.hasNext"
        aria-label="下一页"
        @click="emit('page-change', pagination.page + 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            :d="chevronRightPath"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          ></path>
        </svg>
      </button>

      <label v-if="showPageSizeSelector && !simple" class="workbench-pagination__page-size">
        <WorkbenchSelect
          :model-value="String(pageSize)"
          aria-label="设置每页条数"
          size="sm"
          drop-up
          :options="pageSizeOptions.map((option) => ({ value: String(option), label: `${option} 条/页` }))"
          @update:model-value="emit('page-size-change', Number($event))"
        />
      </label>

      <label v-if="showQuickJumper" class="workbench-pagination__quick-jumper">
        <span>跳至</span>
        <input
          v-model="jumpPageInput"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          @blur="applyJumpPage"
          @keydown.enter.prevent="applyJumpPage"
        />
        <span>页</span>
      </label>
    </div>
  </div>
</template>
