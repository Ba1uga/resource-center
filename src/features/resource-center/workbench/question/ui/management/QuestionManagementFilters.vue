<script setup lang="ts">
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
  (event: 'search'): void
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
  <form class="question-management-filters" @submit.prevent="emit('search')">
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
      <select :value="query.subjectId" @change="handleSubjectChange">
        <option v-for="option in subjectOptions" :key="option.id || 'all-subject'" :value="option.id">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="question-management-filters__select-field">
      <select :value="query.chapterId" :disabled="chapterDisabled" @change="handleChapterChange">
        <option value="">{{ chapterDisabled ? '请先选择学科' : '全部章节' }}</option>
        <option v-for="option in chapterOptions" :key="option.id" :value="option.id">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="question-management-filters__select-field">
      <select :value="query.type" @change="handleTypeChange">
        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="question-management-filters__select-field">
      <select :value="query.difficulty" @change="handleDifficultyChange">
        <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <button class="question-management-filters__query-button question-button question-button--ghost" type="submit">
      查询
    </button>

    <button class="question-button question-button--ghost" type="button" @click="emit('reset')">重置</button>

    <button class="question-management-filters__create-button question-button question-button--solid" type="button" @click="emit('create')">
      新增习题
    </button>
  </form>
</template>
