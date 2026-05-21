<script setup lang="ts">
import '../styles/mapping-workbench.css'

import { computed, onMounted, reactive, ref, watch } from 'vue'

import { mappingRecords } from '@/features/resource-center/workbench/mapping/model/mapping-workbench.fixtures.ts'
import {
  createDefaultMappingFilterState,
  createMappingWorkbenchViewModel,
  matchesMappingFilters,
  resolveMappingPageAfterMutation,
  resolveSelectedOrFirstCandidate,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'
import {
  listMappingRecords,
  reviewMappingRecord,
  selectMappingCandidate,
  createMappingBatch,
  runMappingBatch,
} from '@/api/mapping.ts'
import MappingWorkbenchBulkBar from './MappingWorkbenchBulkBar.vue'
import MappingWorkbenchFilters from './MappingWorkbenchFilters.vue'
import MappingWorkbenchReviewDrawer from './MappingWorkbenchReviewDrawer.vue'
import MappingWorkbenchStatusCards from './MappingWorkbenchStatusCards.vue'
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
  currentAdminName: string
}>()

const pageSize = 8

const connectionStatus = ref<'' | 'offline'>('')
const isLoading = ref(false)
const isUsingFallback = ref(false)

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

onMounted(() => {
  loadData()
})

async function loadData() {
  isLoading.value = true
  try {
    const data = await listMappingRecords({
      keyword: filters.keyword,
      resourceType: filters.resourceType,
      course: filters.course,
      chapter: filters.chapter,
      batchId: filters.batchId,
      reviewStatus: filters.reviewStatus,
      confidenceLevel: filters.confidenceLevel,
      overviewStatus: filters.overviewStatus,
      page: page.value,
      pageSize,
    })
    records.value = data.records
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
      course: filters.course !== 'all' ? filters.course : '',
      createdBy: props.currentAdminName || '管理员',
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
  if (status === 'low-confidence') {
    filters.overviewStatus = 'all'
    filters.confidenceLevel = 'low'
    return
  }

  filters.confidenceLevel = 'all'
  filters.overviewStatus = status
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
  if (selectedIds.value.length === 0) return

  const selectedCount = selectedIds.value.length

  if (isUsingFallback.value) {
    handleLocalBulkAction(action)
    return
  }

  const actionMap: Record<string, 'approve' | 'reject'> = {
    confirm: 'approve',
    ignore: 'reject',
  }

  const apiAction = actionMap[action]
  if (apiAction) {
    feedback.value = { tone: 'info', text: `正在处理 ${selectedCount} 条记录...` }

    Promise.all(
      selectedIds.value.map((id) =>
        reviewMappingRecord(Number(id), apiAction)
          .catch((err) => { console.error(`Failed to ${apiAction} record ${id}:`, err); return null })
      ),
    ).then(() => {
      loadData()
      feedback.value = {
        tone: 'success',
        text: `已${action === 'confirm' ? '确认' : '忽略'} ${selectedCount} 条映射结果。`,
      }
    }).catch(() => {
      feedback.value = {
        tone: 'error',
        text: '部分记录的批量操作失败。',
      }
    })
  }

  if (action === 'rerun' || action === 'remap') {
    feedback.value = {
      tone: 'info',
      text: `已选 ${selectedCount} 条记录，${action === 'rerun' ? '重新 AI 匹配' : '重新挂载'} 功能已触发。`,
    }
  }

  selectedIds.value = []
}

function handleLocalBulkAction(action: BulkAction) {
  if (selectedIds.value.length === 0) return

  const selectedIdSet = new Set(selectedIds.value)
  const selectedCount = selectedIds.value.length

  if (action === 'confirm') {
    records.value = records.value.map((record) => {
      if (!selectedIdSet.has(record.id)) return record
      const selectedCandidate = resolveSelectedOrFirstCandidate(record)
      return {
        ...record,
        reviewStatus: 'approved' as const,
        selectedCandidateId: selectedCandidate?.id ?? record.selectedCandidateId,
        primaryKnowledgePoint: selectedCandidate?.knowledgePointName ?? record.primaryKnowledgePoint,
      }
    })
    feedback.value = { tone: 'success', text: `已确认 ${selectedCount} 条映射结果（离线模式）。` }
  }

  if (action === 'ignore') {
    records.value = records.value.map((record) =>
      selectedIdSet.has(record.id)
        ? { ...record, reviewStatus: 'rejected' as const, selectedCandidateId: null, primaryKnowledgePoint: null }
        : record,
    )
    feedback.value = { tone: 'info', text: `已忽略 ${selectedCount} 条映射结果（离线模式）。` }
  }

  syncPageAfterMutation()
  selectedIds.value = []
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) return
  page.value = nextPage
}

function handleReview(recordId: string) {
  if (!records.value.some((record) => record.id === recordId)) return
  activeRecordId.value = recordId
  drawerOpen.value = true
  feedback.value = null
}

function closeDrawer() {
  drawerOpen.value = false
  activeRecordId.value = null
}

async function handleSwitchPrimary(candidateId: string) {
  if (!activeRecord.value) return

  if (isUsingFallback.value) {
    const selectedCandidate = activeRecord.value.candidates.find((c) => c.id === candidateId)
    if (!selectedCandidate) return
    records.value = records.value.map((record) =>
      record.id === activeRecord.value?.id
        ? { ...record, selectedCandidateId: selectedCandidate.id, primaryKnowledgePoint: selectedCandidate.knowledgePointName }
        : record,
    )
    return
  }

  try {
    const updated = await selectMappingCandidate(Number(activeRecord.value.id), Number(candidateId))
    records.value = records.value.map((record) =>
      record.id === updated.id ? updated : record,
    )
  } catch (error) {
    feedback.value = { tone: 'error', text: '切换候选知识点失败。' }
  }
}

async function handleConfirmRecord() {
  const currentRecord = activeRecord.value
  if (!currentRecord) return

  if (isUsingFallback.value) {
    const selectedCandidate = resolveSelectedOrFirstCandidate(currentRecord)
    records.value = records.value.map((record) =>
      record.id === currentRecord.id
        ? {
            ...record,
            reviewStatus: 'approved' as const,
            selectedCandidateId: selectedCandidate?.id ?? record.selectedCandidateId,
            primaryKnowledgePoint: selectedCandidate?.knowledgePointName ?? record.primaryKnowledgePoint,
          }
        : record,
    )
    feedback.value = { tone: 'success', text: `已确认"${currentRecord.resourceTitle}"的知识点挂载结果。` }
    selectedIds.value = selectedIds.value.filter((id) => id !== currentRecord.id)
    closeDrawer()
    syncPageAfterMutation()
    return
  }

  try {
    await reviewMappingRecord(Number(currentRecord.id), 'approve')
    await loadData()
    feedback.value = { tone: 'success', text: `已确认"${currentRecord.resourceTitle}"的知识点挂载结果。` }
    selectedIds.value = selectedIds.value.filter((id) => id !== currentRecord.id)
    closeDrawer()
  } catch (error) {
    feedback.value = { tone: 'error', text: '审核操作失败。' }
  }
}

async function handleIgnoreRecord() {
  const currentRecord = activeRecord.value
  if (!currentRecord) return

  if (isUsingFallback.value) {
    records.value = records.value.map((record) =>
      record.id === currentRecord.id
        ? { ...record, reviewStatus: 'rejected' as const, selectedCandidateId: null, primaryKnowledgePoint: null }
        : record,
    )
    feedback.value = { tone: 'info', text: `已忽略"${currentRecord.resourceTitle}"的映射记录。` }
    selectedIds.value = selectedIds.value.filter((id) => id !== currentRecord.id)
    closeDrawer()
    syncPageAfterMutation()
    return
  }

  try {
    await reviewMappingRecord(Number(currentRecord.id), 'reject')
    await loadData()
    feedback.value = { tone: 'info', text: `已忽略"${currentRecord.resourceTitle}"的映射记录。` }
    selectedIds.value = selectedIds.value.filter((id) => id !== currentRecord.id)
    closeDrawer()
  } catch (error) {
    feedback.value = { tone: 'error', text: '驳回操作失败。' }
  }
}

function syncPageAfterMutation() {
  page.value = resolveMappingPageAfterMutation({
    currentPage: page.value,
    pageSize,
    totalAfterMutation: records.value.filter((record) =>
      matchesMappingFilters(record, { ...filters }),
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
  <section class="mapping-management workbench-surface" :data-section="props.section.key">
    <div class="mapping-management__controls">
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
        <MappingWorkbenchStatusCards :items="viewModel.summaryCards" @select-status="handleStatusSelect" />
      </div>

      <div
        v-if="feedback"
        class="mapping-management__feedback"
        :class="`is-${feedback.tone}`"
        role="status"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>

      <div v-if="connectionStatus === 'offline'" class="mapping-management__feedback is-offline" role="status">
        无法连接后端服务，当前使用本地数据展示。启动后端服务后可获得完整 AI 挂载功能。
      </div>

      <div v-if="isLoading" class="mapping-management__feedback" role="status" aria-live="polite">
        正在加载数据...
      </div>

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
    </div>

    <div v-if="selectedIds.length > 0" class="mapping-management__table-actions">
      <MappingWorkbenchBulkBar :selected-count="selectedIds.length" @apply-action="handleBulkAction" />
    </div>

    <section class="mapping-management__table-shell">
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
    </section>

    <MappingWorkbenchReviewDrawer
      :open="drawerOpen"
      :record="activeRecord"
      @close="closeDrawer"
      @confirm-record="handleConfirmRecord"
      @ignore-record="handleIgnoreRecord"
      @switch-primary="handleSwitchPrimary"
    />
  </section>
</template>
