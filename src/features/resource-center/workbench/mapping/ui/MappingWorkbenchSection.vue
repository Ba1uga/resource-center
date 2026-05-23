<script setup lang="ts">
import '../styles/mapping-workbench.css'

import { computed, onMounted, reactive, ref, watch } from 'vue'

import { mappingRecords } from '@/features/resource-center/workbench/mapping/model/mapping-workbench.fixtures.ts'
import { createMappingBatch, listMappingRecords, runMappingBatch } from '@/api/mapping.ts'
import {
  createMappingWorkbenchViewModel,
  matchesMappingFilters,
  resolveMappingPageAfterMutation,
  resolveSelectedOrFirstCandidate,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'
import { useMappingWorkbenchSessionStore } from '@/features/resource-center/workbench/mapping/store/mapping-workbench-session.ts'
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

type FeedbackTone = 'info' | 'success' | 'error'
type BulkAction = 'confirm' | 'remap' | 'ignore' | 'rerun'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const pageSize = 8

const connectionStatus = ref<'' | 'offline'>('')
const isLoading = ref(false)
const isUsingFallback = ref(false)
const totalCount = ref(0)

const sessionStore = useMappingWorkbenchSessionStore()
const records = ref<MappingRecord[]>(createLocalRecords())
const selectedIds = ref<string[]>([])
const drawerOpen = ref(false)
const activeRecordId = ref<string | null>(null)
const feedback = ref<{
  tone: FeedbackTone
  text: string
} | null>(null)
const filters = computed({
  get: () => sessionStore.filters,
  set: (value) => sessionStore.patchFilters(value),
})
const page = computed({
  get: () => sessionStore.page,
  set: (value) => sessionStore.setPage(value),
})

const viewModel = computed(() =>
  createMappingWorkbenchViewModel({
    records: records.value,
    filters: {
      ...filters.value,
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
  () => ({ ...filters.value }),
  () => {
    selectedIds.value = []
  },
)

async function loadData() {
  isLoading.value = true
  try {
    const data = await listMappingRecords({
      keyword: filters.value.keyword,
      resourceType: filters.value.resourceType,
      course: filters.value.course,
      chapter: filters.value.chapter,
      batchId: filters.value.batchId,
      reviewStatus: filters.value.reviewStatus,
      confidenceLevel: filters.value.confidenceLevel,
      overviewStatus: filters.value.overviewStatus,
      page: page.value,
      pageSize,
    })
    records.value = data.records as MappingRecord[]
    totalCount.value = data.total
    connectionStatus.value = ''
    isUsingFallback.value = false
  } catch (error) {
    console.error('Mapping module: failed to load records, using local fixtures', error)
    connectionStatus.value = 'offline'
    isUsingFallback.value = true
    if (records.value.length === 0) {
      records.value = createLocalRecords()
    }
  } finally {
    isLoading.value = false
  }
}

async function handleLaunchBatch() {
  const label = `AI挂载 ${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`

  if (isUsingFallback.value) {
    feedback.value = {
      tone: 'info',
      text: '当前为离线模式，AI 挂载批次将使用本地数据模拟。已创建模拟批次。',
    }
    return
  }

  feedback.value = { tone: 'info', text: '正在创建批次并采集资源...' }

  try {
    const batch = await createMappingBatch({
      label,
      course: filters.value.course !== 'all' ? filters.value.course : '',
      createdBy: '管理员',
    })
    feedback.value = { tone: 'info', text: `批次"${batch.label}"已创建，正在执行 AI 知识点匹配...` }

    const result = await runMappingBatch(batch.id)
    await loadData()

    feedback.value = {
      tone: 'success',
      text: `AI 挂载完成：${result.matchedCount} 条匹配成功，${result.failedCount} 条匹配失败。`,
    }
  } catch (error) {
    feedback.value = {
      tone: 'error',
      text: `AI 挂载批次执行失败：${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}

function handleStatusSelect(status: MappingSummaryCardKey) {
  selectedIds.value = []

  if (status === 'low-confidence') {
    sessionStore.patchFilters({
      overviewStatus: 'all',
      confidenceLevel: filters.value.confidenceLevel === 'low' ? 'all' : 'low',
    })
    return
  }

  sessionStore.patchFilters({
    confidenceLevel: 'all',
    overviewStatus: filters.value.overviewStatus === status ? 'all' : status,
  })
}

function handleResetFilters() {
  sessionStore.reset()
  selectedIds.value = []
  feedback.value = null
}

function handleCourseUpdate(course: string) {
  sessionStore.patchFilters({
    course,
    chapter: 'all',
  })
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

  sessionStore.setPage(nextPage)
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
  sessionStore.setPage(resolveMappingPageAfterMutation({
    currentPage: page.value,
    pageSize,
    totalAfterMutation: records.value.filter((record) =>
      matchesMappingFilters(record, {
        ...filters.value,
      }),
    ).length,
  }))
}

function createLocalRecords(): MappingRecord[] {
  return mappingRecords.map((record) => ({
    ...record,
    candidates: record.candidates.map((candidate) => ({ ...candidate })),
  }))
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <WorkbenchDataView class="mapping-management" :data-section="props.section.key" :selected-count="selectedIds.length">
    <template #summary>
      <header class="mapping-management__head">
        <div class="mapping-management__copy">
          <h2>{{ props.section.title }}</h2>
          
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
        @update-keyword="sessionStore.patchFilters({ keyword: $event })"
        @update-resource-type="sessionStore.patchFilters({ resourceType: $event })"
        @update-course="handleCourseUpdate"
        @update-chapter="sessionStore.patchFilters({ chapter: $event })"
        @update-batch="sessionStore.patchFilters({ batchId: $event })"
        @update-review-status="sessionStore.patchFilters({ reviewStatus: $event })"
        @update-confidence-level="sessionStore.patchFilters({ confidenceLevel: $event })"
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
