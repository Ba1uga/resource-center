<script setup lang="ts">
import WorkbenchTable from '../../../shared/ui/WorkbenchTable.vue'

import type {
  QuestionEmptyState,
  QuestionListRow,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

defineProps<{
  rows: QuestionListRow[]
  emptyState: QuestionEmptyState | null
}>()

const emit = defineEmits<{
  (event: 'edit', questionId: string): void
  (event: 'copy', questionId: string): void
  (event: 'delete', questionId: string): void
  (event: 'row-click', questionId: string): void
}>()
</script>

<template>
  <WorkbenchTable
    :rows="rows"
    :columns="[
      { key: 'stem', title: '题干摘要', mobileLabel: '题干摘要' },
      { key: 'typeLabel', title: '题型', mobileLabel: '题型' },
      { key: 'subjectLabel', title: '学科', mobileLabel: '学科' },
      { key: 'chapterLabel', title: '章节', mobileLabel: '章节' },
      { key: 'difficultyLabel', title: '难度', mobileLabel: '难度' },
      { key: 'status', title: '状态', mobileLabel: '状态' },
      { key: 'updatedAtLabel', title: '更新时间', mobileLabel: '更新时间' },
      { key: 'actions', title: '操作', mobileLabel: '操作' },
    ]"
    row-key="id"
    row-clickable
    :empty-state="emptyState"
    @row-click="emit('row-click', $event.id)"
  >
    <template v-slot:cell-stem="{ row }">
      <div class="question-management-table__stem">
        <strong>{{ row.stem }}</strong>
        <span>{{ row.knowledgePoint }}</span>
      </div>
    </template>

    <template v-slot:cell-typeLabel="{ row }">
      <span class="question-tag" :class="`is-${row.type}`">{{ row.typeLabel }}</span>
    </template>

    <template v-slot:cell-status="{ row }">
      <span class="question-status" :class="`is-${row.status}`">{{ row.statusLabel }}</span>
    </template>

    <template v-slot:cell-actions="{ row }">
      <div class="question-management-table__actions">
        <button class="question-text-button" type="button" @click.stop="emit('edit', row.id)">编辑</button>
        <button class="question-text-button" type="button" @click.stop="emit('copy', row.id)">复制</button>
        <button class="question-text-button danger" type="button" @click.stop="emit('delete', row.id)">删除</button>
      </div>
    </template>
  </WorkbenchTable>
</template>
