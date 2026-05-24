<script setup lang="ts">
import '../styles/mapping-workbench.css'

import { computed, onMounted, ref, watch } from 'vue'

import { createMappingBatch, listMappingRecords, runMappingBatch, batchRemapMappingRecords, listMappingBatches, getMappingSummary } from '@/api/mapping.ts'
import { previewMount } from '@/api/mount.ts'
import type { MountPreview } from '@/api/mount.ts'
import {
  createMappingWorkbenchViewModel,
  matchesMappingFilters,
  resolveMappingPageAfterMutation,
  resolveSelectedOrFirstCandidate,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'
import type { MappingSummaryCounts } from '@/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'
import { useMappingWorkbenchSessionStore } from '@/features/resource-center/workbench/mapping/store/mapping-workbench-session.ts'
import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'
import MappingWorkbenchBulkBar from './MappingWorkbenchBulkBar.vue'
import MappingWorkbenchFilters from './MappingWorkbenchFilters.vue'
import MappingWorkbenchReviewDrawer from './MappingWorkbenchReviewDrawer.vue'
import MappingWorkbenchTable from './MappingWorkbenchTable.vue'
import WorkbenchStatusPill from '../../shared/ui/WorkbenchStatusPill.vue'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'

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

const connectionStatus = ref<'' | 'offline' | 'empty' | 'loading'>('loading')
const isLoading = ref(true)
const isUsingFallback = ref(false)
const statusPillRef = ref<InstanceType<typeof WorkbenchStatusPill> | null>(null)
const totalCount = ref(0)

const sessionStore = useMappingWorkbenchSessionStore()
const records = ref<MappingRecord[]>([])
const summaryCounts = ref<MappingSummaryCounts | undefined>(undefined)
const selectedIds = ref<string[]>([])
const drawerOpen = ref(false)
const activeRecordId = ref<string | null>(null)
const mountPreview = ref<MountPreview | null>(null)
const mountPreviewLoading = ref(false)
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
    totalFromApi: totalCount.value > 0 ? totalCount.value : undefined,
    summaryCounts: summaryCounts.value,
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

watch(
  [page, () => filters.value.keyword, () => filters.value.resourceType,
   () => filters.value.course, () => filters.value.chapter,
   () => filters.value.batchId, () => filters.value.reviewStatus,
   () => filters.value.confidenceLevel, () => filters.value.overviewStatus],
  async () => {
    if (isUsingFallback.value) return
    await loadData()
  },
  { flush: 'post' },
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
    connectionStatus.value = totalCount.value === 0 ? 'empty' : ''
    isUsingFallback.value = false

    // Fetch summary counts across ALL records (not page-limited)
    try {
      const summary = await getMappingSummary({
        keyword: filters.value.keyword,
        resourceType: filters.value.resourceType,
        course: filters.value.course,
        chapter: filters.value.chapter,
        batchId: filters.value.batchId,
        reviewStatus: filters.value.reviewStatus,
        confidenceLevel: filters.value.confidenceLevel,
      })
      summaryCounts.value = {
        pendingCount: summary.pendingCount,
        matchedCount: summary.matchedCount,
        manualReviewCount: summary.manualReviewCount,
        confirmedCount: summary.confirmedCount,
        failedCount: summary.failedCount,
        lowConfidenceCount: summary.lowConfidenceCount,
      }
    } catch {
      summaryCounts.value = undefined // fallback to computing from page records
    }
  } catch (error) {
    console.error('Mapping module: failed to load records', error)
    connectionStatus.value = 'offline'
    isUsingFallback.value = true
    statusPillRef.value?.show()
  } finally {
    isLoading.value = false
  }
}

const batchResourceType = ref('')

const batchTypeOptions = [
  { value: '', label: '全部类型' },
  { value: 'courseware', label: '课件' },
  { value: 'article', label: '教材' },
  { value: 'question', label: '习题' },
  { value: 'video', label: '视频' },
  { value: 'excerpt', label: '大纲节选' },
]

async function handleLaunchBatch() {
  const label = `AI挂载 ${new Date().toLocaleDateString('zh-CN')} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`

  if (isUsingFallback.value) {
    feedback.value = {
      tone: 'info',
      text: '当前为离线模式，无法连接后端服务。请检查后端是否已启动。',
    }
    return
  }

  feedback.value = { tone: 'info', text: '正在创建批次并采集资源...' }

  try {
    const batch = await createMappingBatch({
      label,
      course: filters.value.course !== 'all' ? filters.value.course : '',
      resourceType: batchResourceType.value || '',
      createdBy: '管理员',
    })

    if (batch.totalResources === 0) {
      feedback.value = { tone: 'info', text: `批次"${batch.label}"已创建，但未采集到任何资源。请检查资源库是否有数据。` }
      return
    }

    feedback.value = { tone: 'info', text: `批次"${batch.label}"已创建(${batch.totalResources}条资源)，AI 匹配中...` }

    // Run matching asynchronously
    await runMappingBatch(batch.id)

    // Auto-select the new batch filter
    sessionStore.patchFilters({ batchId: String(batch.id), overviewStatus: 'all', confidenceLevel: 'all' })

    // Poll until batch completes
    await pollBatchCompletion(batch.id)

    await loadData()
    feedback.value = { tone: 'success', text: `AI 挂载完成！共处理 ${batch.totalResources} 条资源。` }
  } catch (error) {
    feedback.value = {
      tone: 'error',
      text: `AI 挂载批次执行失败：${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}

async function pollBatchCompletion(batchId: number, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    try {
      const result = await listMappingBatches({ page: 1, pageSize: 100 })
      const batch = result.records.find(b => b.id === batchId)
      if (batch && (batch.status === 'completed' || batch.status === 'failed')) {
        return
      }
    } catch (e) {
      // continue polling
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
    if (!isUsingFallback.value && filters.value.batchId) {
      (async () => {
        try {
          feedback.value = { tone: 'info', text: '正在重新执行 AI 匹配...' }
          await runMappingBatch(Number(filters.value.batchId))
          await loadData()
          feedback.value = { tone: 'success', text: '已重新执行 AI 匹配。' }
        } catch (e) {
          feedback.value = { tone: 'error', text: `重新执行失败: ${e instanceof Error ? e.message : '未知'}` }
        }
      })()
    } else {
      feedback.value = { tone: 'info', text: 'AI 挂载已重新提交处理。' }
    }
    selectedIds.value = []
    return
  }

  if (action === 'remap') {
    if (!isUsingFallback.value && filters.value.batchId) {
      (async () => {
        try {
          feedback.value = { tone: 'info', text: '正在重新映射...' }
          await batchRemapMappingRecords(Number(filters.value.batchId))
          await loadData()
          feedback.value = { tone: 'success', text: '已重新映射低置信度记录。' }
        } catch (e) {
          feedback.value = { tone: 'error', text: `重新映射失败: ${e instanceof Error ? e.message : '未知'}` }
        }
      })()
    } else {
      feedback.value = { tone: 'info', text: '已提交重新映射。' }
    }
    selectedIds.value = []
    return
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
  mountPreview.value = null
  mountPreviewLoading.value = false
  feedback.value = null
}

async function handleLoadMountPreview() {
  const record = activeRecord.value
  if (!record) return

  mountPreviewLoading.value = true
  try {
    const resourceTypeMap: Record<string, string> = {
      article: 'article', courseware: 'courseware',
      question: 'question', video: 'video', excerpt: 'excerpt',
    }
    mountPreview.value = await previewMount({
      resourceType: resourceTypeMap[record.resourceType] || record.resourceType,
      resourceId: Number(record.id),
    })
  } catch (e) {
    console.error('Mount preview failed', e)
  } finally {
    mountPreviewLoading.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
  activeRecordId.value = null
  mountPreview.value = null
  mountPreviewLoading.value = false
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
          <WorkbenchStatusPill
            v-if="connectionStatus === 'offline'"
            ref="statusPillRef"
            label="连接异常"
            message="后端连接失败，当前无法加载映射记录。"
            severity="error"
          />
        </div>

        <div class="mapping-management__batch-controls">
          <WorkbenchSelect
            v-model="batchResourceType"
            :options="batchTypeOptions"
            aria-label="选择资源类型"
          />
          <button type="button" class="mapping-management__launch-button" @click="handleLaunchBatch">
            发起 AI 挂载批次
          </button>
        </div>
      </header>

      <div class="mapping-management__summary">
        <WorkbenchSummaryCards :items="viewModel.summaryCards" @select="(key) => handleStatusSelect(key as MappingSummaryCardKey)" />
      </div>
    </template>

    <template #feedback>
      <div v-if="connectionStatus === 'loading'" class="mapping-management__feedback is-info" role="status">
        正在加载数据...
      </div>
      <div v-else-if="connectionStatus === 'offline'" class="mapping-management__feedback is-error" role="status">
        无法连接后端服务。请确认后端已启动（http://localhost:8080），数据库已执行 Flyway 迁移。
      </div>
      <div v-else-if="connectionStatus === 'empty'" class="mapping-management__feedback is-info" role="status">
        暂无映射记录。请点击"发起 AI 挂载批次"创建第一个挂载批次。
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
        :mount-preview="mountPreview"
        :mount-preview-loading="mountPreviewLoading"
        @close="closeDrawer"
        @confirm-record="handleConfirmRecord"
        @ignore-record="handleIgnoreRecord"
        @switch-primary="handleSwitchPrimary"
        @load-preview="handleLoadMountPreview"
      />
    </template>
  </WorkbenchDataView>
</template>
