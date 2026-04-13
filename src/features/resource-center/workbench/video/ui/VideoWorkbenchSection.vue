<script setup lang="ts">
import '../styles/video-workbench.css'

import { computed, reactive, ref, watch } from 'vue'

import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import { videoRecords } from '@/features/resource-center/workbench/video/model/video-workbench.fixtures.ts'
import {
  createDefaultVideoFilterState,
  createVideoWorkbenchViewModel,
  matchesVideoFilters,
  resolveVideoPageAfterDeletion,
} from '@/features/resource-center/workbench/video/model/video-workbench.view-model.ts'

import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import type { VideoRecord } from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'

type FeedbackTone = 'info' | 'success'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const records = ref<VideoRecord[]>([...videoRecords])
const filters = reactive(createDefaultVideoFilterState())
const page = ref(1)
const pageSize = 8
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

const paginationPages = computed(() => {
  const pageCount = viewModel.value.pagination.pageCount
  const currentPage = viewModel.value.pagination.page
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(pageCount, start + 4)
  const pages: number[] = []

  for (let nextPage = Math.max(1, end - 4); nextPage <= end; nextPage += 1) {
    pages.push(nextPage)
  }

  return pages
})

watch(
  () => [filters.keyword, filters.course],
  () => {
    page.value = 1
  },
)

function handleUpload() {
  feedback.value = {
    tone: 'info',
    text: '上传入口已预留，接入真实表单后即可补齐视频资料。',
  }
}

function handleEdit(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  feedback.value = {
    tone: 'info',
    text: `已定位“${target.title}”的编辑入口，可继续接入表单流程。`,
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
  feedback.value = {
    tone: 'success',
    text: `已移除“${target.title}”。`,
  }
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  page.value = nextPage
}
</script>

<template>
  <section class="video-management workbench-surface" :data-section="props.section.key">
    <div class="video-management__controls">
      <header class="video-management__heading">
        <div class="video-management__copy">
          <h2>{{ props.section.title }}</h2>
        </div>
      </header>

      <div
        v-if="feedback"
        class="video-management__feedback"
        :class="`is-${feedback.tone}`"
        role="status"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>

      <section class="video-management__toolbar" aria-label="视频筛选工具栏">
        <label class="video-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input v-model="filters.keyword" type="search" placeholder="搜索视频标题..." />
        </label>

        <label class="video-management__select-field">
          <select v-model="filters.course" aria-label="按课程筛选视频">
            <option v-for="option in viewModel.courseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
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
      <div class="video-management__table-scroll">
        <table class="video-management__table">
          <thead>
            <tr>
              <th>视频标题</th>
              <th>课程</th>
              <th>章节</th>
              <th>时长</th>
              <th>分辨率</th>
              <th>观看次数</th>
              <th>上传人</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="viewModel.rows.length > 0">
            <tr v-for="row in viewModel.rows" :key="row.id">
              <td class="video-management__title-cell">
                <strong>{{ row.title }}</strong>
              </td>
              <td>{{ row.course }}</td>
              <td>{{ row.chapter }}</td>
              <td class="video-management__numeric-cell">{{ row.duration }}</td>
              <td class="video-management__numeric-cell">{{ row.resolution }}</td>
              <td class="video-management__numeric-cell">{{ row.viewCount }}</td>
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
              <td colspan="9">
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
        <div class="video-management__pagination-summary">
          <strong>第 {{ viewModel.pagination.page }} / {{ viewModel.pagination.pageCount }} 页</strong>
          <span v-if="viewModel.pagination.total > 0">
            显示 {{ viewModel.pagination.from }} - {{ viewModel.pagination.to }} 条，共 {{ viewModel.pagination.total }} 条
          </span>
          <span v-else>暂无结果</span>
        </div>

        <div class="video-management__pagination-controls">
          <button
            type="button"
            class="video-management__page-button"
            :disabled="!viewModel.pagination.hasPrev"
            @click="handlePageChange(viewModel.pagination.page - 1)"
          >
            上一页
          </button>

          <button
            v-for="pageNumber in paginationPages"
            :key="pageNumber"
            type="button"
            class="video-management__page-button"
            :class="{ 'is-active': pageNumber === viewModel.pagination.page }"
            @click="handlePageChange(pageNumber)"
          >
            {{ pageNumber }}
          </button>

          <button
            type="button"
            class="video-management__page-button"
            :disabled="!viewModel.pagination.hasNext"
            @click="handlePageChange(viewModel.pagination.page + 1)"
          >
            下一页
          </button>
        </div>
      </footer>
    </section>
  </section>
</template>
