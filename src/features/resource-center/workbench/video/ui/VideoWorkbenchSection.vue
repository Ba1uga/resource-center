<script setup lang="ts">
import '../styles/video-workbench.css'

import { computed, reactive, ref, watch } from 'vue'

import {
  batchUpdateVideos,
  createVideo,
  deleteVideo as deleteVideoApi,
  listVideos,
  updateVideo,
} from '@/api/video.ts'
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import VideoWorkbenchBulkBar from './VideoWorkbenchBulkBar.vue'
import VideoWorkbenchDrawer from './VideoWorkbenchDrawer.vue'
import VideoWorkbenchStatusCards from './VideoWorkbenchStatusCards.vue'
import { videoRecords } from '@/features/resource-center/workbench/video/model/video-workbench.fixtures.ts'
import {
  createDefaultVideoFilterState,
  createVideoWorkbenchViewModel,
  matchesVideoFilters,
  resolveVideoPageAfterDeletion,
} from '@/features/resource-center/workbench/video/model/video-workbench.view-model.ts'

import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import type {
  VideoOverviewStatus,
  VideoRecord,
} from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'

type DrawerMode = 'create' | 'edit'
type BulkAction = 'publish' | 'offline' | 'delete' | 'reassign-chapter' | 'tag'
type FeedbackTone = 'success' | 'info' | 'danger'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const records = ref<VideoRecord[]>([...videoRecords])
const filters = reactive(createDefaultVideoFilterState())
const page = ref(1)
const pageSize = 8
const selectedIds = ref<string[]>([])
const drawerState = reactive({
  open: false,
  mode: 'create' as 'create' | 'edit',
  activeRecordId: null as string | null,
})
const connectionStatus = ref<'' | 'offline'>('')
const isLoading = ref(false)
const isUsingFallback = ref(false)
const isSaving = ref(false)
const feedback = ref<{
  tone: FeedbackTone
  text: string
} | null>(null)

const viewModel = computed(() =>
  createVideoWorkbenchViewModel({
    records: records.value,
    filters: {
      ...filters,
    },
    page: page.value,
    pageSize,
  }),
)

const activeRecord = computed(() =>
  records.value.find((record) => record.id === drawerState.activeRecordId) ?? null,
)

const visibleIds = computed(() => viewModel.value.rows.map((row) => row.id))
const allVisibleSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => selectedIds.value.includes(id)),
)

watch(
  () => [
    filters.keyword,
    filters.course,
    filters.chapter,
    filters.overviewStatus,
    filters.processingStatus,
    filters.publishStatus,
    filters.uploadedBy,
    filters.uploadedFrom,
    filters.uploadedTo,
  ],
  () => {
    page.value = 1
    selectedIds.value = selectedIds.value.filter((id) => records.value.some((record) => record.id === id))
    if (!isUsingFallback.value) {
      loadVideos()
    }
  },
)

async function loadVideos() {
  isLoading.value = true

  try {
    const pageData = await listVideos({
      keyword: filters.keyword,
      course: filters.course,
      chapter: filters.chapter,
      processingStatus: filters.processingStatus,
      publishStatus: filters.publishStatus,
      uploadedBy: filters.uploadedBy,
      uploadedFrom: filters.uploadedFrom,
      uploadedTo: filters.uploadedTo,
      page: 1,
      pageSize: 200,
    })

    records.value = pageData.records
    connectionStatus.value = ''
    isUsingFallback.value = false
  } catch (error) {
    console.error(error)
    records.value = [...videoRecords]
    connectionStatus.value = 'offline'
    isUsingFallback.value = true
  } finally {
    isLoading.value = false
  }
}

function handleStatusSelect(status: VideoOverviewStatus) {
  filters.overviewStatus = status
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

  if (action === 'reassign-chapter' || action === 'tag') {
    feedback.value = {
      tone: 'info',
      text: action === 'reassign-chapter' ? '批量改章节功能已预留。' : '批量打标签功能已预留。',
    }
    return
  }

  if (isUsingFallback.value) {
    applyFallbackBulkAction(action)
    return
  }

  try {
    const numericIds = selectedIds.value.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    if (numericIds.length === 0) {
      return
    }

    const apiAction = action === 'publish' ? 'publish' : action === 'offline' ? 'offline' : 'delete'
    await batchUpdateVideos({ ids: numericIds, action: apiAction })

    await loadVideos()
    selectedIds.value = []

    const labels: Record<string, string> = {
      publish: '已批量发布。',
      offline: '已批量下架。',
      delete: '已批量删除。',
    }
    feedback.value = {
      tone: 'success',
      text: labels[action] ?? '批量操作完成。',
    }
  } catch (error) {
    console.error(error)
    feedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '批量操作失败',
    }
  }
}

function applyFallbackBulkAction(action: BulkAction) {
  if (action === 'publish') {
    records.value = records.value.map((record) =>
      selectedIds.value.includes(record.id)
        ? { ...record, processingStatus: 'ready', publishStatus: 'published' }
        : record,
    )
    selectedIds.value = []
    return
  }

  if (action === 'offline') {
    records.value = records.value.map((record) =>
      selectedIds.value.includes(record.id)
        ? { ...record, publishStatus: 'offline' }
        : record,
    )
    selectedIds.value = []
    return
  }

  if (action === 'delete') {
    const nextRecords = records.value.filter((record) => !selectedIds.value.includes(record.id))
    const totalAfterDeletion = nextRecords.filter((record) =>
      matchesVideoFilters(record, { ...filters }),
    ).length
    records.value = nextRecords
    page.value = resolveVideoPageAfterDeletion({
      currentPage: page.value,
      pageSize,
      totalAfterDeletion,
    })
    selectedIds.value = []
    return
  }
}

async function handleDelete(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除"${target.title}"吗？`)) {
    return
  }

  if (isUsingFallback.value) {
    const nextRecords = records.value.filter((record) => record.id !== id)
    const totalAfterDeletion = nextRecords.filter((record) =>
      matchesVideoFilters(record, { ...filters }),
    ).length
    records.value = nextRecords
    page.value = resolveVideoPageAfterDeletion({
      currentPage: page.value,
      pageSize,
      totalAfterDeletion,
    })
    return
  }

  try {
    await deleteVideoApi(Number(id))
    await loadVideos()
    feedback.value = {
      tone: 'success',
      text: '视频已删除。',
    }
  } catch (error) {
    console.error(error)
    feedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '删除失败',
    }
  }
}

function handleUpload() {
  openUploadDrawer()
}

function handleEdit(id: string) {
  openEditDrawer(id)
}

async function handleDrawerSaveDraft() {
  if (drawerState.mode === 'create') {
    feedback.value = {
      tone: 'info',
      text: '视频上传入口已预留，接入上传服务后即可保存草稿。',
    }
    return
  }

  if (isUsingFallback.value || !activeRecord.value) {
    closeDrawer()
    return
  }

  isSaving.value = true

  try {
    const record = activeRecord.value
    await updateVideo(Number(record.id), {
      title: record.title,
      course: record.course,
      chapter: record.chapter,
      duration: record.duration,
      resolution: record.resolution,
      viewCount: record.viewCount,
      fileSize: record.fileSize,
      knowledgePoint: record.knowledgePoint,
      tags: record.tags,
      description: record.description,
      processingStatus: record.processingStatus,
      publishStatus: 'draft',
      visibility: record.visibility,
    })

    await loadVideos()
    closeDrawer()
    feedback.value = {
      tone: 'success',
      text: '视频已保存为草稿。',
    }
  } catch (error) {
    console.error(error)
    feedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '保存失败',
    }
  } finally {
    isSaving.value = false
  }
}

async function handleDrawerSavePublish() {
  if (drawerState.mode === 'create') {
    feedback.value = {
      tone: 'info',
      text: '视频上传入口已预留，接入上传服务后即可开始上传并发布。',
    }
    return
  }

  if (isUsingFallback.value || !activeRecord.value) {
    closeDrawer()
    return
  }

  isSaving.value = true

  try {
    const record = activeRecord.value
    await updateVideo(Number(record.id), {
      title: record.title,
      course: record.course,
      chapter: record.chapter,
      duration: record.duration,
      resolution: record.resolution,
      viewCount: record.viewCount,
      fileSize: record.fileSize,
      knowledgePoint: record.knowledgePoint,
      tags: record.tags,
      description: record.description,
      processingStatus: 'ready',
      publishStatus: 'published',
      visibility: record.visibility,
    })

    await loadVideos()
    closeDrawer()
    feedback.value = {
      tone: 'success',
      text: '视频已发布。',
    }
  } catch (error) {
    console.error(error)
    feedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '发布失败',
    }
  } finally {
    isSaving.value = false
  }
}

function handleRetryUpload() {
  feedback.value = {
    tone: 'info',
    text: '重新上传入口已预留，接入上传服务后即可重新处理。',
  }
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  page.value = nextPage
}

loadVideos()
</script>

<template>
  <section class="video-management workbench-surface" :data-section="props.section.key">
    <div v-if="isLoading && records.length === 0" class="video-management__loading">
      <strong>正在加载视频数据...</strong>
      <p>正在尝试连接后端服务，请稍候。</p>
    </div>

    <div class="video-management__controls">
      <header class="video-management__heading">
        <div class="video-management__copy">
          <h2>{{ props.section.title }}</h2>
          <button
            v-if="connectionStatus === 'offline'"
            class="video-management__status-pill"
            type="button"
          >
            连接异常
          </button>
        </div>
      </header>

      <div v-if="connectionStatus === 'offline'" class="video-management__feedback" role="status">
        后端连接异常，当前显示本地视频样例。
      </div>

      <div v-if="feedback" class="video-management__feedback" role="status" aria-live="polite">
        {{ feedback.text }}
      </div>

      <VideoWorkbenchStatusCards :items="viewModel.summaryCards" @select-status="handleStatusSelect" />

      <section class="video-management__toolbar" aria-label="视频筛选工具栏">
        <label class="video-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input v-model="filters.keyword" type="search" placeholder="搜索视频标题、知识点..." />
        </label>

        <label class="video-management__select-field">
          <select v-model="filters.course" aria-label="按课程筛选视频">
            <option v-for="option in viewModel.courseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="video-management__select-field">
          <select v-model="filters.chapter" aria-label="按章节筛选视频">
            <option v-for="option in viewModel.chapterOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="video-management__select-field">
          <select v-model="filters.processingStatus" aria-label="按资源状态筛选视频">
            <option value="all">全部资源状态</option>
            <option value="uploading">上传中</option>
            <option value="transcoding">转码中</option>
            <option value="ready">资源就绪</option>
            <option value="failed">转码失败</option>
          </select>
        </label>

        <label class="video-management__select-field">
          <select v-model="filters.publishStatus" aria-label="按发布状态筛选视频">
            <option value="all">全部发布状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="offline">已下架</option>
          </select>
        </label>

        <button type="button" class="video-management__upload-button" @click="handleUpload">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.plus"></path>
          </svg>
          <span>上传视频</span>
        </button>
      </section>
    </div>

    <section class="video-management__table-shell">
      <div v-if="selectedIds.length > 0" class="video-management__table-actions">
        <VideoWorkbenchBulkBar :selected-count="selectedIds.length" @apply-action="handleBulkAction" />
      </div>

      <div class="video-management__table-scroll">
        <table class="video-management__table">
          <thead>
            <tr>
              <th class="video-management__selection-cell">
                <input
                  :checked="allVisibleSelected"
                  type="checkbox"
                  aria-label="选择当前页所有视频"
                  @change="toggleVisibleSelection"
                />
              </th>
              <th>视频信息</th>
              <th>课程 / 章节</th>
              <th>资源状态</th>
              <th>发布状态</th>
              <th>时长</th>
              <th>分辨率</th>
              <th>上传人</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="viewModel.rows.length > 0">
            <tr v-for="row in viewModel.rows" :key="row.id">
              <td class="video-management__selection-cell">
                <input
                  :checked="selectedIds.includes(row.id)"
                  type="checkbox"
                  :aria-label="`选择${row.title}`"
                  @change="toggleRecordSelection(row.id)"
                />
              </td>
              <td class="video-management__info-cell">
                <div class="video-management__cover">{{ row.coverLabel }}</div>
                <div class="video-management__info-copy">
                  <strong>{{ row.title }}</strong>
                  <div class="video-management__meta-line">
                    <span>{{ row.id }}</span>
                    <span>{{ row.knowledgePoint }}</span>
                  </div>
                  <div class="video-management__tag-list">
                    <span v-for="tag in row.tags" :key="tag">{{ tag }}</span>
                  </div>
                  <p v-if="row.resourceAlert" class="video-management__resource-alert">{{ row.resourceAlert }}</p>
                </div>
              </td>
              <td>
                <strong>{{ row.course }}</strong>
                <span class="video-management__subtle-line">{{ row.chapter }}</span>
              </td>
              <td>
                <span class="video-management__status-badge" :class="`is-${row.processingStatus}`">
                  {{ row.processingStatus }}
                </span>
              </td>
              <td>
                <span class="video-management__status-badge" :class="`is-${row.publishStatus}`">
                  {{ row.publishStatus }}
                </span>
              </td>
              <td class="video-management__numeric-cell">{{ row.duration }}</td>
              <td class="video-management__numeric-cell">{{ row.resolution }}</td>
              <td>{{ row.uploadedBy }}</td>
              <td class="video-management__date-cell">{{ row.uploadedAt }}</td>
              <td>
                <div class="video-management__row-actions">
                  <button
                    type="button"
                    class="video-management__icon-button"
                    aria-label="编辑视频"
                    @click="handleEdit(row.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="iconPaths.edit"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="video-management__icon-button danger"
                    aria-label="删除视频"
                    @click="handleDelete(row.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="iconPaths.trash"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr class="video-management__empty-row">
              <td colspan="10">
                <div class="video-management__empty-state">
                  <strong>{{ viewModel.emptyState?.title }}</strong>
                  <p>{{ viewModel.emptyState?.description }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="video-management__pagination">
        <WorkbenchTablePagination :pagination="viewModel.pagination" show-quick-jumper @page-change="handlePageChange" />
      </footer>
    </section>

    <VideoWorkbenchDrawer
      :open="drawerState.open"
      :mode="drawerState.mode"
      :record="activeRecord"
      @close="closeDrawer"
      @save-draft="handleDrawerSaveDraft"
      @save-publish="handleDrawerSavePublish"
      @retry-upload="handleRetryUpload"
    />
  </section>
</template>
