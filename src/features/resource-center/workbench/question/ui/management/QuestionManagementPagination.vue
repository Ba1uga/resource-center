<script setup lang="ts">
import { computed } from 'vue'

import type { QuestionPaginationState } from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

const props = defineProps<{
  pagination: QuestionPaginationState
}>()

const emit = defineEmits<{
  (event: 'page-change', page: number): void
}>()

const pageNumbers = computed(() =>
  Array.from({ length: props.pagination.pageCount }, (_, index) => index + 1),
)
</script>

<template>
  <footer class="question-management__pagination">
    <div class="question-management__pagination-copy">
      <template v-if="pagination.total > 0">
        第 {{ pagination.from }}-{{ pagination.to }} 条，共 {{ pagination.total }} 条
      </template>
      <template v-else>暂无结果</template>
    </div>

    <div class="question-management__pagination-actions">
      <button
        class="question-button question-button--ghost"
        type="button"
        :disabled="!pagination.hasPrev"
        @click="emit('page-change', pagination.page - 1)"
      >
        上一页
      </button>

      <button
        v-for="pageNumber in pageNumbers"
        :key="pageNumber"
        class="question-page-button"
        :class="{ active: pageNumber === pagination.page }"
        type="button"
        @click="emit('page-change', pageNumber)"
      >
        {{ pageNumber }}
      </button>

      <button
        class="question-button question-button--ghost"
        type="button"
        :disabled="!pagination.hasNext"
        @click="emit('page-change', pagination.page + 1)"
      >
        下一页
      </button>
    </div>
  </footer>
</template>
