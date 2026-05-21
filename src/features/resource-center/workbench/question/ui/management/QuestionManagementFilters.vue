<script setup lang="ts">
import WorkbenchSelect from '../../../shared/ui/WorkbenchSelect.vue'

import type {
  QuestionDifficultyFilter,
  QuestionFilterOption,
  QuestionQueryState,
  QuestionSelectOption,
  QuestionTypeFilter,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

defineProps<{
  query: QuestionQueryState
  subjectOptions: QuestionSelectOption[]
  chapterOptions: QuestionSelectOption[]
  typeOptions: QuestionFilterOption<QuestionTypeFilter>[]
  difficultyOptions: QuestionFilterOption<QuestionDifficultyFilter>[]
  chapterDisabled: boolean
}>()

const emit = defineEmits<{
  (event: 'update-subject', value: string): void
  (event: 'update-chapter', value: string): void
  (event: 'update-type', value: QuestionTypeFilter): void
  (event: 'update-difficulty', value: QuestionDifficultyFilter): void
  (event: 'update-keyword', value: string): void
  (event: 'reset'): void
  (event: 'create'): void
}>()

function handleSubjectChange(event: Event) {
  emit('update-subject', (event.target as HTMLSelectElement).value)
}

function handleChapterChange(event: Event) {
  emit('update-chapter', (event.target as HTMLSelectElement).value)
}

function handleTypeChange(event: Event) {
  emit('update-type', (event.target as HTMLSelectElement).value as QuestionTypeFilter)
}

function handleDifficultyChange(event: Event) {
  emit('update-difficulty', (event.target as HTMLSelectElement).value as QuestionDifficultyFilter)
}

function handleKeywordInput(event: Event) {
  emit('update-keyword', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <form class="question-management-filters" @submit.prevent>
    <label class="question-management-filters__search-field">
      <input
        :value="query.keyword"
        type="search"
        placeholder="搜索题干、知识点或题目内容..."
        aria-label="搜索关键词"
        @input="handleKeywordInput"
      />
    </label>

    <label class="question-management-filters__select-field">
      <WorkbenchSelect
        :model-value="query.subjectId"
        aria-label="按学科筛选"
        :options="subjectOptions.map((option) => ({ value: option.id, label: option.label }))"
        @update:model-value="emit('update-subject', $event)"
      />
    </label>

    <label class="question-management-filters__select-field">
      <WorkbenchSelect
        :model-value="query.chapterId"
        aria-label="按章节筛选"
        :disabled="chapterDisabled"
        :options="[
          { value: '', label: chapterDisabled ? '请先选择学科' : '全部章节' },
          ...chapterOptions.map((option) => ({ value: option.id, label: option.label })),
        ]"
        @update:model-value="emit('update-chapter', $event)"
      />
    </label>

    <label class="question-management-filters__select-field">
      <WorkbenchSelect
        :model-value="query.type"
        aria-label="按题型筛选"
        :options="typeOptions"
        @update:model-value="emit('update-type', $event as QuestionTypeFilter)"
      />
    </label>

    <label class="question-management-filters__select-field">
      <WorkbenchSelect
        :model-value="query.difficulty"
        aria-label="按难度筛选"
        :options="difficultyOptions"
        @update:model-value="emit('update-difficulty', $event as QuestionDifficultyFilter)"
      />
    </label>

    <button class="question-management-filters__reset-button question-button question-button--ghost" type="button" @click="emit('reset')">重置</button>

    <button class="question-management-filters__create-button question-button question-button--solid" type="button" @click="emit('create')">
      新增习题
    </button>
  </form>
</template>
