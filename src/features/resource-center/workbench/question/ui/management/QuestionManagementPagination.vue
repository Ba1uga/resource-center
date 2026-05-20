<script setup lang="ts">
import WorkbenchTablePagination from '@/features/resource-center/workbench/shared/ui/WorkbenchTablePagination.vue'

import type { QuestionPaginationState } from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

defineProps<{
  pagination: QuestionPaginationState
}>()

const emit = defineEmits<{
  (event: 'page-change', page: number): void
}>()
</script>

<template>
  <footer class="question-management__pagination">
    <WorkbenchTablePagination :pagination="pagination" show-quick-jumper @page-change="emit('page-change', $event)" />
  </footer>
</template>
