<script setup lang="ts">
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'

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
      <WorkbenchSelect
        :model-value="filters.resourceType"
        aria-label="按资源类型筛选"
        :options="resourceTypeOptions"
        @update:model-value="emit('update-resource-type', $event as MappingResourceTypeFilter)"
      />
    </label>

    <label class="mapping-management-filters__select-field">
      <WorkbenchSelect
        :model-value="filters.course"
        aria-label="按课程筛选"
        :options="courseOptions"
        @update:model-value="emit('update-course', $event)"
      />
    </label>

    <label class="mapping-management-filters__select-field">
      <WorkbenchSelect
        :model-value="filters.chapter"
        aria-label="按章节筛选"
        :options="chapterOptions"
        @update:model-value="emit('update-chapter', $event)"
      />
    </label>

    <label class="mapping-management-filters__select-field">
      <WorkbenchSelect
        :model-value="filters.batchId"
        aria-label="按批次筛选"
        :options="batchOptions"
        @update:model-value="emit('update-batch', $event)"
      />
    </label>

    <label class="mapping-management-filters__select-field">
      <WorkbenchSelect
        :model-value="filters.reviewStatus"
        aria-label="按复核状态筛选"
        :options="reviewStatusOptions"
        @update:model-value="emit('update-review-status', $event as MappingReviewStatusFilter)"
      />
    </label>

    <label class="mapping-management-filters__select-field">
      <WorkbenchSelect
        :model-value="filters.confidenceLevel"
        aria-label="按置信度筛选"
        :options="confidenceLevelOptions"
        @update:model-value="emit('update-confidence-level', $event as MappingConfidenceLevelFilter)"
      />
    </label>

    <button type="button" class="mapping-management-filters__reset-button" @click="emit('reset')">重置筛选</button>
  </form>
</template>
