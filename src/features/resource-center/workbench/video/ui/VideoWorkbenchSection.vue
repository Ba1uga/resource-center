<script setup lang="ts">
import '../styles/video-workbench.css'

import { computed, reactive, ref, watch } from 'vue'

import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'
import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'
import VideoWorkbenchBulkBar from './VideoWorkbenchBulkBar.vue'
import VideoWorkbenchDrawer from './VideoWorkbenchDrawer.vue'
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
  },
)

function handleStatusSelect(status: VideoOverviewStatus) {
  filters.overviewStatus = filters.overviewStatus === status ? 'all' : status
  page.value = 1
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

function handleBulkAction(action: BulkAction) {
  if (selectedIds.value.length === 0) {
    return
  }

  if (action === 'publish') {
    records.value = records.value.map((record) =>
      selectedIds.value.includes(record.id)
        ? {
            ...record,
            processingStatus: 'ready',
            publishStatus: 'published',
          }
        : record,
    )
    selectedIds.value = []
    return
  }

  if (action === 'offline') {
    records.value = records.value.map((record) =>
      selectedIds.value.includes(record.id)
        ? {
            ...record,
            publishStatus: 'offline',
          }
        : record,
    )
    selectedIds.value = []
    return
  }

  if (action === 'delete') {
    const nextRecords = records.value.filter((record) => !selectedIds.value.includes(record.id))
    const totalAfterDeletion = nextRecords.filter((record) =>
      matchesVideoFilters(record, {
        ...filters,
      }),
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

function handleDelete(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除“${target.title}”吗？`)) {
    return
  }

  const nextRecords = records.value.filter((record) => record.id !== id)
  const totalAfterDeletion = nextRecords.filter((record) =>
    matchesVideoFilters(record, {
      ...filters,
    }),
  ).length

  records.value = nextRecords
  page.value = resolveVideoPageAfterDeletion({
    currentPage: page.value,
    pageSize,
    totalAfterDeletion,
  })
}

function handleUpload() {
  openUploadDrawer()
}

function handleEdit(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  openEditDrawer(id)
}

function handleDrawerSaveDraft() {}

function handleDrawerSavePublish() {}

function handleRetryUpload() {}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  page.value = nextPage
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

    <template #toolbar>
      <section class="video-management__toolbar" aria-label="视频筛选工具栏">
        <label class="video-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input v-model="filters.keyword" type="search" placeholder="搜索视频标题、知识点..." />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect v-model="filters.course" aria-label="按课程筛选视频" :options="viewModel.courseOptions" />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            v-model="filters.chapter"
            aria-label="按章节筛选视频"
            :options="viewModel.chapterOptions"
          />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            v-model="filters.processingStatus"
            aria-label="按资源状态筛选视频"
            :options="[
              { value: 'all', label: '全部资源状态' },
              { value: 'uploading', label: '上传中' },
              { value: 'transcoding', label: '转码中' },
              { value: 'ready', label: '资源就绪' },
              { value: 'failed', label: '转码失败' },
            ]"
          />
        </label>

        <label class="video-management__select-field">
          <WorkbenchSelect
            v-model="filters.publishStatus"
            aria-label="按发布状态筛选视频"
            :options="[
              { value: 'all', label: '全部发布状态' },
              { value: 'draft', label: '草稿' },
              { value: 'published', label: '已发布' },
              { value: 'offline', label: '已下架' },
            ]"
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
            {{ row.processingStatus }}
          </span>
        </template>

        <template #cell-publishStatus="{ row }">
          <span class="video-management__status-badge" :class="`is-${row.publishStatus}`">
            {{ row.publishStatus }}
          </span>
        </template>

        <template #cell-duration="{ row }">
          <span class="video-management__numeric-cell">{{ row.duration }}</span>
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
