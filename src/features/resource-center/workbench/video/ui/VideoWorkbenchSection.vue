<script setup lang="ts">
import '../styles/video-workbench.css'

import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { createVideo, deleteVideo, listVideos, updateVideo, batchUpdateVideos } from '@/api/video.ts'

const processingStatusLabel: Record<string, string> = {
  uploading: '上传中',
  transcoding: '转码中',
  ready: '资源就绪',
  failed: '转码失败',
}

const publishStatusLabel: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  offline: '已下架',
}
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'
import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'
import VideoWorkbenchBulkBar from './VideoWorkbenchBulkBar.vue'
import VideoWorkbenchDrawer from './VideoWorkbenchDrawer.vue'
import type { VideoDrawerDraft } from './VideoWorkbenchDrawer.vue'
import PreviewDrawer from '../../shared/ui/PreviewDrawer.vue'
import { videoRecords } from '@/features/resource-center/workbench/video/model/video-workbench.fixtures.ts'
import {
  createVideoWorkbenchViewModel,
  matchesVideoFilters,
  resolveVideoPageAfterDeletion,
} from '@/features/resource-center/workbench/video/model/video-workbench.view-model.ts'
import { useVideoWorkbenchSessionStore } from '@/features/resource-center/workbench/video/store/video-workbench-session.ts'

import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import type {
  VideoFilterState,
  VideoOverviewStatus,
  VideoRecord,
} from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'

type DrawerMode = 'create' | 'edit'
type BulkAction = 'publish' | 'offline' | 'delete' | 'reassign-chapter' | 'tag'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const sessionStore = useVideoWorkbenchSessionStore()
const fallbackRecords = ref<VideoRecord[]>([...videoRecords])
const apiRecords = ref<VideoRecord[]>([])
const isLoading = ref(false)
const isUsingFallback = ref(false)
const apiTotal = ref(0)
const keywordInput = ref(sessionStore.filters.keyword)
let keywordDebounceTimer: ReturnType<typeof setTimeout> | undefined
const pageSize = 8
const selectedIds = ref<string[]>([])

const records = computed(() => (isUsingFallback.value ? fallbackRecords.value : apiRecords.value))
const total = computed(() => (isUsingFallback.value ? fallbackRecords.value.length : apiTotal.value))
const drawerState = reactive({
  open: false,
  mode: 'create' as 'create' | 'edit',
  activeRecordId: null as string | null,
})
const filters = computed({
  get: () => sessionStore.filters,
  set: (value) => sessionStore.patchFilters(value),
})
const page = computed({
  get: () => sessionStore.page,
  set: (value) => sessionStore.setPage(value),
})

const viewModel = computed(() =>
  createVideoWorkbenchViewModel({
    records: records.value,
    filters: {
      ...filters.value,
    },
    page: page.value,
    pageSize,
  }),
)

const activeRecord = computed(() =>
  records.value.find((record) => record.id === drawerState.activeRecordId) ?? null,
)

async function loadVideos() {
  isLoading.value = true

  try {
    const result = await listVideos({
      keyword: filters.value.keyword.trim(),
      course: filters.value.course,
      chapter: filters.value.chapter,
      processingStatus: filters.value.processingStatus,
      publishStatus: filters.value.publishStatus,
      uploadedBy: filters.value.uploadedBy,
      uploadedFrom: filters.value.uploadedFrom,
      uploadedTo: filters.value.uploadedTo,
      page: page.value,
      pageSize,
    })

    apiRecords.value = result.records
    apiTotal.value = result.total
    isUsingFallback.value = false
  } catch {
    apiRecords.value = []
    apiTotal.value = fallbackRecords.value.length
    isUsingFallback.value = true
  } finally {
    isLoading.value = false
  }
}

const visibleIds = computed(() => viewModel.value.rows.map((row) => row.id))
const allVisibleSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => selectedIds.value.includes(id)),
)

watch(keywordInput, (value) => {
  if (keywordDebounceTimer) {
    clearTimeout(keywordDebounceTimer)
  }

  keywordDebounceTimer = setTimeout(() => {
    sessionStore.patchFilters({ keyword: value })
  }, 300)
})

onBeforeUnmount(() => {
  if (keywordDebounceTimer) {
    clearTimeout(keywordDebounceTimer)
  }
})

watch(
  () => [
    filters.value.keyword,
    filters.value.course,
    filters.value.chapter,
    filters.value.overviewStatus,
    filters.value.processingStatus,
    filters.value.publishStatus,
    filters.value.uploadedBy,
    filters.value.uploadedFrom,
    filters.value.uploadedTo,
  ],
  () => {
    selectedIds.value = selectedIds.value.filter((id) => records.value.some((record) => record.id === id))
  },
)

watch(
  [page, () => filters.value.keyword, () => filters.value.course, () => filters.value.chapter,
   () => filters.value.processingStatus, () => filters.value.publishStatus,
   () => filters.value.uploadedBy, () => filters.value.uploadedFrom, () => filters.value.uploadedTo],
  async () => {
    if (isUsingFallback.value) {
      return
    }
    await loadVideos()
  },
  { flush: 'post' },
)

onMounted(async () => {
  await loadVideos()
})

function handleStatusSelect(status: VideoOverviewStatus) {
  sessionStore.patchFilters({
    overviewStatus: filters.value.overviewStatus === status ? 'all' : status,
  })
  selectedIds.value = []
}

function openUploadDrawer() {
  drawerState.open = true
  drawerState.mode = 'create'
  drawerState.activeRecordId = null
}

function openEditDrawer(id: string) {
  drawerState.open = true
  drawerState.mode = 'edit'
  drawerState.activeRecordId = id
}

function closeDrawer() {
  drawerState.open = false
  drawerState.activeRecordId = null
}

function toggleRecordSelection(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function toggleVisibleSelection() {
  selectedIds.value = allVisibleSelected.value
    ? selectedIds.value.filter((id) => !visibleIds.value.includes(id))
    : [...new Set([...selectedIds.value, ...visibleIds.value])]
}

async function handleBulkAction(action: BulkAction) {
  if (selectedIds.value.length === 0) {
    return
  }

  if (action === 'publish') {
    if (!isUsingFallback.value) {
      try {
        await batchUpdateVideos({
          ids: selectedIds.value.map(Number),
          action: 'publish',
        })
        await loadVideos()
      } catch { /* fall through */ }
    }
    fallbackRecords.value = fallbackRecords.value.map((record) =>
      selectedIds.value.includes(record.id)
        ? { ...record, processingStatus: 'ready' as const, publishStatus: 'published' as const }
        : record,
    )
    selectedIds.value = []
    return
  }

  if (action === 'offline') {
    if (!isUsingFallback.value) {
      try {
        await batchUpdateVideos({
          ids: selectedIds.value.map(Number),
          action: 'offline',
        })
        await loadVideos()
      } catch { /* fall through */ }
    }
    fallbackRecords.value = fallbackRecords.value.map((record) =>
      selectedIds.value.includes(record.id)
        ? { ...record, publishStatus: 'offline' as const }
        : record,
    )
    selectedIds.value = []
    return
  }

  if (action === 'delete') {
    if (!isUsingFallback.value) {
      try {
        await batchUpdateVideos({
          ids: selectedIds.value.map(Number),
          action: 'delete',
        })
        await loadVideos()
      } catch { /* fall through */ }
    }
    const nextRecords = fallbackRecords.value.filter((record) => !selectedIds.value.includes(record.id))
    const totalAfterDeletion = nextRecords.filter((record) =>
      matchesVideoFilters(record, { ...filters.value }),
    ).length
    fallbackRecords.value = nextRecords
    apiRecords.value = apiRecords.value.filter((record) => !selectedIds.value.includes(record.id))
    apiTotal.value = isUsingFallback.value ? fallbackRecords.value.length : Math.max(0, apiTotal.value - selectedIds.value.length)
    sessionStore.setPage(resolveVideoPageAfterDeletion({
      currentPage: page.value,
      pageSize,
      totalAfterDeletion,
    }))
    selectedIds.value = []
    return
  }
}

async function handleDelete(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除”${target.title}”吗？`)) {
    return
  }

  try {
    if (!isUsingFallback.value) {
      await deleteVideo(Number(id))
    }
  } catch {
    // fall through to local removal
  }

  fallbackRecords.value = fallbackRecords.value.filter((record) => record.id !== id)
  apiRecords.value = apiRecords.value.filter((record) => record.id !== id)
  const totalAfterDeletion = (isUsingFallback.value ? fallbackRecords.value : apiRecords.value)
    .filter((record) => matchesVideoFilters(record, { ...filters.value })).length
  apiTotal.value = isUsingFallback.value ? fallbackRecords.value.length : Math.max(0, apiTotal.value - 1)
  sessionStore.setPage(resolveVideoPageAfterDeletion({
    currentPage: page.value,
    pageSize,
    totalAfterDeletion,
  }))
}

function handleUpload() {
  openUploadDrawer()
}

const previewState = reactive({
  open: false,
  record: null as VideoRecord | null,
})

function handlePreview(id: string) {
  const target = records.value.find((r) => r.id === id)
  if (!target) return
  previewState.record = target
  previewState.open = true
}

function closePreview() {
  previewState.open = false
  previewState.record = null
}

function handleEdit(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  openEditDrawer(id)
}

const videoFeedback = ref<{
  tone: 'success' | 'danger'
  text: string
} | null>(null)

async function handleDrawerSaveDraft(data: VideoDrawerDraft) {
  try {
    const uploadSucceeded = data.videoAssetId !== null
    if (drawerState.mode === 'create') {
      await createVideo({
        title: data.title || '未命名视频',
        course: data.course || '未指定课程',
        chapter: data.chapter || '未指定章节',
        duration: data.duration || undefined,
        fileSize: data.videoFileSizeLabel || '',
        knowledgePoint: data.knowledgePoint,
        uploadedBy: '当前用户',
        processingStatus: uploadSucceeded ? 'ready' : 'uploading',
        publishStatus: 'draft',
        assetId: data.videoAssetId,
        coverAssetId: data.coverAssetId,
      })
    } else if (drawerState.activeRecordId) {
      await updateVideo(Number(drawerState.activeRecordId), {
        title: data.title,
        course: data.course,
        chapter: data.chapter,
        duration: data.duration || undefined,
        fileSize: data.videoFileSizeLabel || undefined,
        knowledgePoint: data.knowledgePoint,
        assetId: data.videoAssetId ?? undefined,
        coverAssetId: data.coverAssetId ?? undefined,
      })
    }

    await loadVideos()
    videoFeedback.value = {
      tone: 'success',
      text: drawerState.mode === 'create' ? '视频已保存为草稿。' : '视频信息已更新。',
    }
  } catch (error) {
    videoFeedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '视频保存失败，请稍后重试。',
    }
    return
  }

  closeDrawer()
}

async function handleDrawerSavePublish(data: VideoDrawerDraft) {
  try {
    const uploadSucceeded = data.videoAssetId !== null
    if (drawerState.mode === 'create') {
      await createVideo({
        title: data.title || '未命名视频',
        course: data.course || '未指定课程',
        chapter: data.chapter || '未指定章节',
        duration: data.duration || undefined,
        fileSize: data.videoFileSizeLabel || '',
        knowledgePoint: data.knowledgePoint,
        uploadedBy: '当前用户',
        processingStatus: uploadSucceeded ? 'ready' : 'uploading',
        publishStatus: 'published',
        assetId: data.videoAssetId,
        coverAssetId: data.coverAssetId,
      })
    } else if (drawerState.activeRecordId) {
      await updateVideo(Number(drawerState.activeRecordId), {
        title: data.title,
        course: data.course,
        chapter: data.chapter,
        duration: data.duration || undefined,
        fileSize: data.videoFileSizeLabel || undefined,
        knowledgePoint: data.knowledgePoint,
        publishStatus: 'published',
        assetId: data.videoAssetId ?? undefined,
        coverAssetId: data.coverAssetId ?? undefined,
      })
    }

    await loadVideos()
    videoFeedback.value = {
      tone: 'success',
      text: drawerState.mode === 'create' ? '视频已发布。' : '视频已更新并发布。',
    }
  } catch (error) {
    videoFeedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '视频发布失败，请稍后重试。',
    }
    return
  }

  closeDrawer()
}

function handleRetryUpload() {
  const record = activeRecord.value
  if (!record) return

  fallbackRecords.value = fallbackRecords.value.map((r) =>
    r.id === record.id
      ? { ...r, processingStatus: 'uploading', resourceAlert: null }
      : r,
  )
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  sessionStore.setPage(nextPage)
}
</script>

<template>
  <WorkbenchDataView class="video-management" :data-section="props.section.key" :selected-count="selectedIds.length">
    <template #summary>
      <header class="video-management__heading">
        <div class="video-management__copy">
          <h2>{{ props.section.title }}</h2>
        </div>
      </header>

      <WorkbenchSummaryCards :items="viewModel.summaryCards" @select="(key) => handleStatusSelect(key as VideoOverviewStatus)" />
    </template>

    <template #feedback>
      <div
        v-if="videoFeedback"
        class="video-management__feedback"
        :class="`is-${videoFeedback.tone}`"
        role="status"
        aria-live="polite"
      >
        {{ videoFeedback.text }}
      </div>
    </template>

    <template #toolbar>
      <section class="video-management__toolbar" aria-label="视频筛选工具栏">
        <label class="video-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input
            v-model="keywordInput"
            type="search"
            placeholder="搜索视频标题、知识点..."
          />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            :model-value="filters.course"
            aria-label="按课程筛选视频"
            :options="viewModel.courseOptions"
            @update:model-value="(course) => { sessionStore.patchFilters({ course }); selectedIds = [] }"
          />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            :model-value="filters.chapter"
            aria-label="按章节筛选视频"
            :options="viewModel.chapterOptions"
            @update:model-value="(chapter) => { sessionStore.patchFilters({ chapter }); selectedIds = [] }"
          />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            :model-value="filters.processingStatus"
            aria-label="按资源状态筛选视频"
            :options="[
              { value: 'all', label: '全部资源状态' },
              { value: 'uploading', label: '上传中' },
              { value: 'transcoding', label: '转码中' },
              { value: 'ready', label: '资源就绪' },
              { value: 'failed', label: '转码失败' },
            ]"
            @update:model-value="(processingStatus) => { sessionStore.patchFilters({ processingStatus: processingStatus as VideoFilterState['processingStatus'] }); selectedIds = [] }"
          />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            :model-value="filters.publishStatus"
            aria-label="按发布状态筛选视频"
            :options="[
              { value: 'all', label: '全部发布状态' },
              { value: 'draft', label: '草稿' },
              { value: 'published', label: '已发布' },
              { value: 'offline', label: '已下架' },
            ]"
            @update:model-value="(publishStatus) => { sessionStore.patchFilters({ publishStatus: publishStatus as VideoFilterState['publishStatus'] }); selectedIds = [] }"
          />
        </label>

        <button type="button" class="video-management__upload-button" @click="handleUpload">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.plus"></path>
          </svg>
          <span>上传视频</span>
        </button>
      </section>
    </template>

    <template #bulk>
      <VideoWorkbenchBulkBar :selected-count="selectedIds.length" @apply-action="handleBulkAction" />
    </template>

    <template #table>
      <WorkbenchTable
        :rows="viewModel.rows"
        :columns="[
          { key: 'resource', title: '视频信息', mobileLabel: '视频信息' },
          { key: 'courseChapter', title: '课程 / 章节', mobileLabel: '课程 / 章节' },
          { key: 'processingStatus', title: '资源状态', mobileLabel: '资源状态' },
          { key: 'publishStatus', title: '发布状态', mobileLabel: '发布状态' },
          { key: 'duration', title: '时长', mobileLabel: '时长' },
          { key: 'resolution', title: '分辨率', mobileLabel: '分辨率' },
          { key: 'uploadedBy', title: '上传人', mobileLabel: '上传人' },
          { key: 'uploadedAt', title: '上传时间', mobileLabel: '上传时间' },
          { key: 'actions', title: '操作', mobileLabel: '操作' },
        ]"
        row-key="id"
        selectable
        :selected-row-keys="selectedIds"
        :all-visible-selected="allVisibleSelected"
        :empty-state="viewModel.emptyState"
        @toggle-row="toggleRecordSelection($event.id)"
        @toggle-all-visible="toggleVisibleSelection"
      >
        <template #cell-resource="{ row }">
          <div class="video-management__info-cell">
            <div class="video-management__cover">
              <img
                v-if="row.coverAssetId"
                :src="`/api/upload/stream/${row.coverAssetId}`"
                :alt="row.coverLabel"
                class="video-management__cover-img"
              />
              <img
                v-else
                src="/Romance-Pride-Lgbt-Movies-Film--Streamline-Ultimate.png"
                alt="默认封面"
                class="video-management__cover-placeholder"
              />
            </div>
            <div class="video-management__info-copy">
              <strong>{{ row.title }}</strong>
              <span class="video-management__knowledge-point">{{ row.knowledgePoint }}</span>
            </div>
          </div>
        </template>

        <template #cell-courseChapter="{ row }">
          <div>
            <strong>{{ row.course }}</strong>
            <span class="video-management__subtle-line">{{ row.chapter }}</span>
          </div>
        </template>

        <template #cell-processingStatus="{ row }">
          <span class="video-management__status-badge" :class="`is-${row.processingStatus}`">
            {{ processingStatusLabel[row.processingStatus] ?? row.processingStatus }}
          </span>
        </template>

        <template #cell-publishStatus="{ row }">
          <span class="video-management__status-badge" :class="`is-${row.publishStatus}`">
            {{ publishStatusLabel[row.publishStatus] ?? row.publishStatus }}
          </span>
        </template>

        <template #cell-duration="{ row }">
          <span class="video-management__numeric-cell">{{ row.duration || '--' }}</span>
        </template>

        <template #cell-resolution="{ row }">
          <span class="video-management__numeric-cell">{{ row.resolution }}</span>
        </template>

        <template #cell-uploadedAt="{ row }">
          <span class="video-management__date-cell">{{ row.uploadedAt }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="video-management__row-actions">
            <button
              v-if="row.assetId"
              type="button"
              class="video-management__icon-button"
              aria-label="预览视频"
              @click.stop="handlePreview(row.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.eye"></path>
              </svg>
            </button>
            <button
              type="button"
              class="video-management__icon-button"
              aria-label="编辑视频"
              @click.stop="handleEdit(row.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.edit"></path>
              </svg>
            </button>
            <button
              type="button"
              class="video-management__icon-button danger"
              aria-label="删除视频"
              @click.stop="handleDelete(row.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.trash"></path>
              </svg>
            </button>
          </div>
        </template>
      </WorkbenchTable>
    </template>

    <template #pagination>
      <footer class="video-management__pagination">
        <WorkbenchTablePagination :pagination="viewModel.pagination" show-quick-jumper @page-change="handlePageChange" />
      </footer>
    </template>

    <template #drawer>
      <PreviewDrawer
        :open="previewState.open"
        :asset-id="previewState.record?.assetId ?? null"
        :origin-name="previewState.record?.title ?? ''"
        :mime-type="'video/mp4'"
        @close="closePreview"
      />
      <VideoWorkbenchDrawer
        :open="drawerState.open"
        :mode="drawerState.mode"
        :record="activeRecord"
        @close="closeDrawer"
        @save-draft="handleDrawerSaveDraft"
        @save-publish="handleDrawerSavePublish"
        @retry-upload="handleRetryUpload"
      />
    </template>
  </WorkbenchDataView>
</template>
