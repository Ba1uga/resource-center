<script setup lang="ts">
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
}>()

function handleRowKeydown(event: KeyboardEvent, questionId: string) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('edit', questionId)
  }
}
</script>

<template>
  <table v-if="rows.length > 0" class="question-management-table">
    <thead>
      <tr>
        <th>题干摘要</th>
        <th>题型</th>
        <th>学科</th>
        <th>章节</th>
        <th>难度</th>
        <th>状态</th>
        <th>更新时间</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.id"
        class="question-management-table__row"
        tabindex="0"
        @click="emit('edit', row.id)"
        @keydown="handleRowKeydown($event, row.id)"
      >
        <td data-label="题干摘要">
          <div class="question-management-table__stem">
            <strong>{{ row.stem }}</strong>
            <span>{{ row.knowledgePoint }}</span>
          </div>
        </td>
        <td data-label="题型">
          <span class="question-tag" :class="`is-${row.type}`">{{ row.typeLabel }}</span>
        </td>
        <td data-label="学科">{{ row.subjectLabel }}</td>
        <td data-label="章节">{{ row.chapterLabel }}</td>
        <td data-label="难度">{{ row.difficultyLabel }}</td>
        <td data-label="状态">
          <span class="question-status" :class="`is-${row.status}`">{{ row.statusLabel }}</span>
        </td>
        <td data-label="更新时间">{{ row.updatedAtLabel }}</td>
        <td data-label="操作">
          <div class="question-management-table__actions">
            <button class="question-text-button" type="button" @click.stop="emit('edit', row.id)">编辑</button>
            <button class="question-text-button" type="button" @click.stop="emit('copy', row.id)">复制</button>
            <button class="question-text-button danger" type="button" @click.stop="emit('delete', row.id)">删除</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <div v-else class="question-management-table__empty">
    <strong>{{ emptyState?.title ?? '暂无数据' }}</strong>
    <p>{{ emptyState?.description ?? '请稍后再试。' }}</p>
  </div>
</template>
