<script setup lang="ts">
import '../styles/mapping-workbench.css'

import { computed, reactive, ref, watch } from 'vue'

import { mappingRecords } from '@/features/resource-center/workbench/mapping/model/mapping-workbench.fixtures.ts'
import {
  createDefaultMappingFilterState,
  createMappingWorkbenchViewModel,
  matchesMappingFilters,
  resolveMappingPageAfterMutation,
  resolveSelectedOrFirstCandidate,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'
import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'
import MappingWorkbenchBulkBar from './MappingWorkbenchBulkBar.vue'
import MappingWorkbenchFilters from './MappingWorkbenchFilters.vue'
import MappingWorkbenchReviewDrawer from './MappingWorkbenchReviewDrawer.vue'
import MappingWorkbenchTable from './MappingWorkbenchTable.vue'

import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import type {
  MappingRecord,
  MappingSummaryCardKey,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

type FeedbackTone = 'info' | 'success'
type BulkAction = 'confirm' | 'remap' | 'ignore' | 'rerun'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const pageSize = 8

const records = ref<MappingRecord[]>(createLocalRecords())
const filters = reactive(createDefaultMappingFilterState())
const page = ref(1)
const selectedIds = ref<string[]>([])
const drawerOpen = ref(false)
const activeRecordId = ref<string | null>(null)
const feedback = ref<{
  tone: FeedbackTone
  text: string
} | null>(null)

const viewModel = computed(() =>
  createMappingWorkbenchViewModel({
    records: records.value,
    filters: {
      ...filters,
    },
    page: page.value,
    pageSize,
  }),
)

const visibleIds = computed(() => viewModel.value.rows.map((row) => row.id))
const allVisibleSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => selectedIds.value.includes(id)),
)
const activeRecord = computed(() => records.value.find((record) => record.id === activeRecordId.value) ?? null)

watch(
  () => ({ ...filters }),
  () => {
    page.value = 1
    selectedIds.value = []
  },
)

function handleLaunchBatch() {
  feedback.value = {
    tone: 'info',
    text: 'AI 挂载批次入口已预留，接入批次创建流程后即可开始新的映射任务。',
  }
}

function handleStatusSelect(status: MappingSummaryCardKey) {
  page.value = 1
  selectedIds.value = []

  if (status === 'low-confidence') {
    filters.overviewStatus = 'all'
    filters.confidenceLevel = filters.confidenceLevel === 'low' ? 'all' : 'low'
    return
  }

  filters.confidenceLevel = 'all'
  filters.overviewStatus = filters.overviewStatus === status ? 'all' : status
}

function handleResetFilters() {
  Object.assign(filters, createDefaultMappingFilterState())
  page.value = 1
  selectedIds.value = []
  feedback.value = null
}

function handleCourseUpdate(course: string) {
  filters.course = course
  filters.chapter = 'all'
}

function toggleRowSelection(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function toggleVisibleSelection() {
  const visibleIdSet = new Set(visibleIds.value)

  if (allVisibleSelected.value) {
    selectedIds.value = selectedIds.value.filter((id) => !visibleIdSet.has(id))
    return
  }

  const nextSelectedIds = new Set(selectedIds.value)
  for (const id of visibleIds.value) {
    nextSelectedIds.add(id)
  }
  selectedIds.value = [...nextSelectedIds]
}

function handleBulkAction(action: BulkAction) {
  if (selectedIds.value.length === 0) {
    return
  }

  const selectedIdSet = new Set(selectedIds.value)
  const selectedCount = selectedIds.value.length

  if (action === 'confirm') {
    records.value = records.value.map((record) => {
      if (!selectedIdSet.has(record.id)) {
        return record
      }

      const selectedCandidate = resolveSelectedOrFirstCandidate(record)

      return {
        ...record,
        reviewStatus: 'approved',
        selectedCandidateId: selectedCandidate?.id ?? record.selectedCandidateId,
        primaryKnowledgePoint: selectedCandidate?.knowledgePointName ?? record.primaryKnowledgePoint,
      }
    })
    feedback.value = {
      tone: 'success',
      text: `已确认 ${selectedCount} 条映射结果。`,
    }
    syncPageAfterMutation()
  }

  if (action === 'ignore') {
    records.value = records.value.map((record) =>
      selectedIdSet.has(record.id)
        ? {
            ...record,
            reviewStatus: 'rejected',
            selectedCandidateId: null,
            primaryKnowledgePoint: null,
          }
        : record,
    )
    feedback.value = {
      tone: 'info',
      text: `已忽略 ${selectedCount} 条映射结果。`,
    }
    syncPageAfterMutation()
  }

  if (action === 'rerun') {
    feedback.value = {
      tone: 'info',
      text: `已标记 ${selectedCount} 条记录重新执行 AI 挂载。`,
    }
  }

  if (action === 'remap') {
    feedback.value = {
      tone: 'info',
      text: `已选 ${selectedCount} 条记录，重新挂载将在线索详情流中处理。`,
    }
  }

  selectedIds.value = []
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  page.value = nextPage
}

function handleReview(recordId: string) {
  if (!records.value.some((record) => record.id === recordId)) {
    return
  }

  activeRecordId.value = recordId
  drawerOpen.value = true
  feedback.value = null
}

function closeDrawer() {
  drawerOpen.value = false
  activeRecordId.value = null
}

function handleSwitchPrimary(candidateId: string) {
  if (!activeRecord.value) {
    return
  }

  const selectedCandidate = activeRecord.value.candidates.find((candidate) => candidate.id === candidateId)
  if (!selectedCandidate) {
    return
  }

  records.value = records.value.map((record) =>
    record.id === activeRecord.value?.id
      ? {
          ...record,
          selectedCandidateId: selectedCandidate.id,
          primaryKnowledgePoint: selectedCandidate.knowledgePointName,
        }
      : record,
  )
}

function handleConfirmRecord() {
  const currentRecord = activeRecord.value
  if (!currentRecord) {
    return
  }

  const selectedCandidate =
    resolveSelectedOrFirstCandidate(currentRecord)

  records.value = records.value.map((record) =>
    record.id === currentRecord.id
      ? {
          ...record,
          reviewStatus: 'approved',
          selectedCandidateId: selectedCandidate?.id ?? record.selectedCandidateId,
          primaryKnowledgePoint: selectedCandidate?.knowledgePointName ?? record.primaryKnowledgePoint,
        }
      : record,
  )

  feedback.value = {
    tone: 'success',
    text: `已确认“${currentRecord.resourceTitle}”的知识点挂载结果。`,
  }
  selectedIds.value = selectedIds.value.filter((id) => id !== currentRecord.id)
  closeDrawer()
  syncPageAfterMutation()
}

function handleIgnoreRecord() {
  const currentRecord = activeRecord.value
  if (!currentRecord) {
    return
  }

  records.value = records.value.map((record) =>
    record.id === currentRecord.id
      ? {
          ...record,
          reviewStatus: 'rejected',
          selectedCandidateId: null,
          primaryKnowledgePoint: null,
        }
      : record,
  )

  feedback.value = {
    tone: 'info',
    text: `已忽略“${currentRecord.resourceTitle}”的映射记录。`,
  }
  selectedIds.value = selectedIds.value.filter((id) => id !== currentRecord.id)
  closeDrawer()
  syncPageAfterMutation()
}

function syncPageAfterMutation() {
  page.value = resolveMappingPageAfterMutation({
    currentPage: page.value,
    pageSize,
    totalAfterMutation: records.value.filter((record) =>
      matchesMappingFilters(record, {
        ...filters,
      }),
    ).length,
  })
}

function createLocalRecords(): MappingRecord[] {
  return mappingRecords.map((record) => ({
    ...record,
    candidates: record.candidates.map((candidate) => ({ ...candidate })),
  }))
}
</script>

<template>
  <WorkbenchDataView class="mapping-management" :data-section="props.section.key" :selected-count="selectedIds.length">
    <template #summary>
      <header class="mapping-management__head">
        <div class="mapping-management__copy">
          <h2>{{ props.section.title }}</h2>
          <p>优先处理待复核和低置信度资源，快速完成 AI 知识点挂载确认。</p>
        </div>

        <button type="button" class="mapping-management__launch-button" @click="handleLaunchBatch">
          发起 AI 挂载批次
        </button>
      </header>

      <div class="mapping-management__summary">
        <WorkbenchSummaryCards :items="viewModel.summaryCards" @select="(key) => handleStatusSelect(key as MappingSummaryCardKey)" />
      </div>
    </template>

    <template #feedback>
      <div
        v-if="feedback"
        class="mapping-management__feedback"
        :class="`is-${feedback.tone}`"
        role="status"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>
    </template>

    <template #toolbar>
      <MappingWorkbenchFilters
        class="mapping-management__toolbar"
        :filters="filters"
        :resource-type-options="viewModel.resourceTypeOptions"
        :course-options="viewModel.courseOptions"
        :chapter-options="viewModel.chapterOptions"
        :batch-options="viewModel.batchOptions"
        :review-status-options="viewModel.reviewStatusOptions"
        :confidence-level-options="viewModel.confidenceLevelOptions"
        @update-keyword="filters.keyword = $event"
        @update-resource-type="filters.resourceType = $event"
        @update-course="handleCourseUpdate"
        @update-chapter="filters.chapter = $event"
        @update-batch="filters.batchId = $event"
        @update-review-status="filters.reviewStatus = $event"
        @update-confidence-level="filters.confidenceLevel = $event"
        @reset="handleResetFilters"
      />
    </template>

    <template #bulk>
      <MappingWorkbenchBulkBar :selected-count="selectedIds.length" @apply-action="handleBulkAction" />
    </template>

    <template #table>
      <MappingWorkbenchTable
        :rows="viewModel.rows"
        :empty-state="viewModel.emptyState"
        :selected-ids="selectedIds"
        :all-visible-selected="allVisibleSelected"
        :pagination="viewModel.pagination"
        @toggle-row="toggleRowSelection"
        @toggle-visible="toggleVisibleSelection"
        @review="handleReview"
        @page-change="handlePageChange"
      />
    </template>

    <template #pagination>
      <footer class="mapping-management__pagination">
        <WorkbenchTablePagination :pagination="viewModel.pagination" show-quick-jumper @page-change="handlePageChange" />
      </footer>
    </template>

    <template #drawer>
      <MappingWorkbenchReviewDrawer
        :open="drawerOpen"
        :record="activeRecord"
        @close="closeDrawer"
        @confirm-record="handleConfirmRecord"
        @ignore-record="handleIgnoreRecord"
        @switch-primary="handleSwitchPrimary"
      />
    </template>
  </WorkbenchDataView>
</template>
