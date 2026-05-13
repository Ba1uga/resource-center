<script setup lang="ts">
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'

import type {
  MappingConfidenceLevelFilter,
  MappingFilterState,
  MappingResourceTypeFilter,
  MappingReviewStatusFilter,
  MappingSelectOption,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

defineProps<{
  filters: MappingFilterState
  resourceTypeOptions: MappingSelectOption<MappingResourceTypeFilter>[]
  courseOptions: MappingSelectOption[]
  chapterOptions: MappingSelectOption[]
  batchOptions: MappingSelectOption[]
  reviewStatusOptions: MappingSelectOption<MappingReviewStatusFilter>[]
  confidenceLevelOptions: MappingSelectOption<MappingConfidenceLevelFilter>[]
}>()

const emit = defineEmits<{
  (event: 'update-keyword', value: string): void
  (event: 'update-resource-type', value: MappingResourceTypeFilter): void
  (event: 'update-course', value: string): void
  (event: 'update-chapter', value: string): void
  (event: 'update-batch', value: string): void
  (event: 'update-review-status', value: MappingReviewStatusFilter): void
  (event: 'update-confidence-level', value: MappingConfidenceLevelFilter): void
  (event: 'reset'): void
}>()

function handleKeywordInput(event: Event) {
  emit('update-keyword', (event.target as HTMLInputElement).value)
}

function handleResourceTypeChange(event: Event) {
  emit('update-resource-type', (event.target as HTMLSelectElement).value as MappingResourceTypeFilter)
}

function handleCourseChange(event: Event) {
  emit('update-course', (event.target as HTMLSelectElement).value)
}

function handleChapterChange(event: Event) {
  emit('update-chapter', (event.target as HTMLSelectElement).value)
}

function handleBatchChange(event: Event) {
  emit('update-batch', (event.target as HTMLSelectElement).value)
}

function handleReviewStatusChange(event: Event) {
  emit('update-review-status', (event.target as HTMLSelectElement).value as MappingReviewStatusFilter)
}

function handleConfidenceLevelChange(event: Event) {
  emit('update-confidence-level', (event.target as HTMLSelectElement).value as MappingConfidenceLevelFilter)
}
</script>

<template>
  <form class="mapping-management-filters" @submit.prevent>
    <label class="mapping-management-filters__search-field">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path :d="iconPaths.search"></path>
      </svg>
      <input
        :value="filters.keyword"
        type="search"
        placeholder="搜索资源标题、课程或知识点..."
        aria-label="搜索映射资源"
        @input="handleKeywordInput"
      />
    </label>

    <label class="mapping-management-filters__select-field">
      <select :value="filters.resourceType" aria-label="按资源类型筛选" @change="handleResourceTypeChange">
        <option v-for="option in resourceTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="mapping-management-filters__select-field">
      <select :value="filters.course" aria-label="按课程筛选" @change="handleCourseChange">
        <option v-for="option in courseOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="mapping-management-filters__select-field">
      <select :value="filters.chapter" aria-label="按章节筛选" @change="handleChapterChange">
        <option v-for="option in chapterOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="mapping-management-filters__select-field">
      <select :value="filters.batchId" aria-label="按批次筛选" @change="handleBatchChange">
        <option v-for="option in batchOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="mapping-management-filters__select-field">
      <select :value="filters.reviewStatus" aria-label="按复核状态筛选" @change="handleReviewStatusChange">
        <option v-for="option in reviewStatusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="mapping-management-filters__select-field">
      <select :value="filters.confidenceLevel" aria-label="按置信度筛选" @change="handleConfidenceLevelChange">
        <option v-for="option in confidenceLevelOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <button type="button" class="mapping-management-filters__reset-button" @click="emit('reset')">重置筛选</button>
  </form>
</template>
