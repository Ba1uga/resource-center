<script setup lang="ts">
import '../styles/courseware-workbench.css'

import { computed, reactive, ref, watch } from 'vue'

import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import {
  coursewareRecords,
  currentCoursewareUploader,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.fixtures.ts'
import {
  createCoursewareWorkbenchViewModel,
  createDefaultCoursewareDraft,
  createDefaultCoursewareFilterState,
  matchesCoursewareFilters,
  resolveCoursewarePageAfterDeletion,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts'
import {
  hasCoursewareValidationErrors,
  validateCoursewareDraft,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.validation.ts'

import type {
  CoursewareDraft,
  CoursewareRecord,
  CoursewareValidationErrors,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.types.ts'
import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

type DrawerMode = 'create' | 'edit'
type FeedbackTone = 'success' | 'info' | 'danger'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const pageSize = 8
const records = ref<CoursewareRecord[]>([...coursewareRecords])
const filters = reactive(createDefaultCoursewareFilterState())
const page = ref(1)
const drawerOpen = ref(false)
const drawerMode = ref<DrawerMode>('create')
const drawerTargetId = ref<string>()
const drawerDraft = reactive(createDefaultCoursewareDraft())
const drawerErrors = reactive<CoursewareValidationErrors>({})
const feedback = ref<{
  tone: FeedbackTone
  text: string
} | null>(null)

const viewModel = computed(() =>
  createCoursewareWorkbenchViewModel({
    records: records.value,
    filters: {
      ...filters,
    },
    page: page.value,
    pageSize,
  }),
)

const drawerTitle = computed(() => (drawerMode.value === 'create' ? '上传课件' : '编辑课件'))
const drawerDescription = computed(() =>
  drawerMode.value === 'create'
    ? '补充课件基础信息，保存后会自动归入当前课件台。'
    : '更新课件信息后，上传时间会自动刷新为最新保存时间。',
)

watch(
  () => [filters.keyword, filters.course, filters.type],
  () => {
    page.value = 1
  },
)

function handleCreate() {
  drawerMode.value = 'create'
  drawerTargetId.value = undefined
  fillDrawerDraft(createDefaultCoursewareDraft())
  clearDrawerErrors()
  drawerOpen.value = true
}

function handleEdit(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  drawerMode.value = 'edit'
  drawerTargetId.value = id
  fillDrawerDraft({
    title: target.title,
    course: target.course,
    chapter: target.chapter,
    type: target.type,
    fileSize: target.fileSize,
    uploadedBy: target.uploadedBy,
  })
  clearDrawerErrors()
  drawerOpen.value = true
}

function handleDelete(id: string) {
  const target = records.value.find((record) => record.id === id)
  if (!target) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除“${target.title}”吗？`)) {
    return
  }

  records.value = records.value.filter((record) => record.id !== id)
  page.value = resolveCoursewarePageAfterDeletion({
    currentPage: page.value,
    pageSize,
    totalAfterDeletion: records.value.length,
  })
  feedback.value = {
    tone: 'success',
    text: '课件已删除。',
  }
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  page.value = nextPage
}

function closeDrawer() {
  drawerOpen.value = false
  clearDrawerErrors()
}

function saveDrawer() {
  const nextErrors = validateCoursewareDraft({ ...drawerDraft })
  assignDrawerErrors(nextErrors)

  if (hasCoursewareValidationErrors(nextErrors)) {
    return
  }

  const nextRecord: CoursewareRecord = {
    id: drawerTargetId.value ?? createCoursewareId(),
    title: drawerDraft.title.trim(),
    course: drawerDraft.course.trim(),
    chapter: drawerDraft.chapter.trim(),
    type: drawerDraft.type,
    fileSize: drawerDraft.fileSize.trim(),
    uploadedBy: currentCoursewareUploader,
    uploadedAt: formatCurrentDate(),
  }

  if (drawerMode.value === 'edit' && drawerTargetId.value) {
    records.value = records.value.map((record) => (record.id === drawerTargetId.value ? nextRecord : record))
  } else {
    records.value = [nextRecord, ...records.value]
    page.value = 1
  }

  const visibleUnderFilters = matchesCoursewareFilters(nextRecord, {
    ...filters,
  })
  feedback.value = {
    tone: visibleUnderFilters ? 'success' : 'info',
    text:
      drawerMode.value === 'edit'
        ? visibleUnderFilters
          ? '课件已更新。'
          : '课件已更新，但当前筛选条件下不可见。'
        : visibleUnderFilters
          ? '课件已上传。'
          : '课件已上传，但当前筛选条件下不可见。',
  }

  closeDrawer()
}

function fillDrawerDraft(nextDraft: CoursewareDraft) {
  drawerDraft.title = nextDraft.title
  drawerDraft.course = nextDraft.course
  drawerDraft.chapter = nextDraft.chapter
  drawerDraft.type = nextDraft.type
  drawerDraft.fileSize = nextDraft.fileSize
  drawerDraft.uploadedBy = nextDraft.uploadedBy
}

function clearDrawerErrors() {
  for (const key of Object.keys(drawerErrors) as Array<keyof CoursewareValidationErrors>) {
    delete drawerErrors[key]
  }
}

function assignDrawerErrors(nextErrors: CoursewareValidationErrors) {
  clearDrawerErrors()

  for (const [key, value] of Object.entries(nextErrors) as Array<
    [keyof CoursewareValidationErrors, string | undefined]
  >) {
    if (value) {
      drawerErrors[key] = value
    }
  }
}

function createCoursewareId() {
  return `cw-${Math.random().toString(36).slice(2, 10)}`
}

function formatCurrentDate() {
  return new Date().toISOString().slice(0, 10)
}
</script>

<template>
  <section class="courseware-management workbench-surface" :data-section="props.section.key">
    <div class="courseware-management__controls">
      <header class="courseware-management__head">
        <h2>{{ props.section.title }}</h2>
      </header>

      <div class="courseware-management__summary">
        <article
          v-for="item in viewModel.summaryItems"
          :key="item.label"
          class="courseware-management__summary-card"
        >
          <span>{{ item.label }}</span>
          <strong
            class="courseware-management__summary-value"
            :class="{ 'is-record': item.label === '最近上传' }"
          >
            {{ item.value }}
          </strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>

      <div
        v-if="feedback"
        class="courseware-management__feedback"
        :class="`is-${feedback.tone}`"
        role="status"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>

      <div class="courseware-management__toolbar">
        <label class="courseware-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input v-model="filters.keyword" type="text" placeholder="搜索课件标题..." />
        </label>

        <label class="courseware-management__select-field">
          <select v-model="filters.course">
            <option v-for="option in viewModel.courseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="courseware-management__select-field">
          <select v-model="filters.type">
            <option v-for="option in viewModel.typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <button type="button" class="courseware-management__create-button" @click="handleCreate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.plus"></path>
          </svg>
          上传课件
        </button>
      </div>
    </div>

    <div class="courseware-management__table-shell">
      <div class="courseware-management__table-scroll">
        <table class="courseware-management__table">
          <thead>
            <tr>
              <th>课件标题</th>
              <th>课程</th>
              <th>章节</th>
              <th>类型</th>
              <th>文件大小</th>
              <th>上传人</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="viewModel.rows.length > 0">
            <tr v-for="row in viewModel.rows" :key="row.id">
              <td class="courseware-management__title-cell">{{ row.title }}</td>
              <td>{{ row.course }}</td>
              <td>{{ row.chapter }}</td>
              <td>{{ row.type }}</td>
              <td class="courseware-management__numeric-cell">{{ row.fileSize }}</td>
              <td>{{ row.uploadedBy }}</td>
              <td class="courseware-management__date-cell">{{ row.uploadedAt }}</td>
              <td>
                <div class="courseware-management__row-actions">
                  <button
                    type="button"
                    class="courseware-management__icon-button"
                    aria-label="编辑课件"
                    @click="handleEdit(row.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="iconPaths.edit"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="courseware-management__icon-button danger"
                    aria-label="删除课件"
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
            <tr class="courseware-management__empty-row">
              <td colspan="8">
                <div class="courseware-management__empty-state">
                  <strong>{{ viewModel.emptyState?.title }}</strong>
                  <p>{{ viewModel.emptyState?.description }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="courseware-management__pagination">
        <WorkbenchTablePagination :pagination="viewModel.pagination" show-quick-jumper @page-change="handlePageChange" />
      </footer>
    </div>

    <div v-if="drawerOpen" class="courseware-management__drawer-shell" @click.self="closeDrawer">
      <aside class="courseware-management__drawer-panel" role="dialog" aria-modal="true">
        <header class="courseware-management__drawer-head">
          <div class="courseware-management__drawer-copy">
            <h3>{{ drawerTitle }}</h3>
            <p>{{ drawerDescription }}</p>
          </div>

          <button type="button" class="courseware-management__drawer-close" aria-label="关闭抽屉" @click="closeDrawer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="iconPaths.x"></path>
            </svg>
          </button>
        </header>

        <div class="courseware-management__form">
          <label class="courseware-management__form-field">
            <span>课件标题</span>
            <input v-model="drawerDraft.title" type="text" placeholder="例如：第一章 计算机网络概述" />
            <small v-if="drawerErrors.title" class="courseware-management__field-error">{{ drawerErrors.title }}</small>
          </label>

          <label class="courseware-management__form-field">
            <span>课程</span>
            <select v-model="drawerDraft.course">
              <option disabled value="">请选择课程</option>
              <option v-for="option in viewModel.courseOptions.slice(1)" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <small v-if="drawerErrors.course" class="courseware-management__field-error">{{ drawerErrors.course }}</small>
          </label>

          <label class="courseware-management__form-field">
            <span>章节</span>
            <input v-model="drawerDraft.chapter" type="text" placeholder="例如：第2章" />
            <small v-if="drawerErrors.chapter" class="courseware-management__field-error">{{ drawerErrors.chapter }}</small>
          </label>

          <label class="courseware-management__form-field">
            <span>类型</span>
            <select v-model="drawerDraft.type">
              <option
                v-for="option in viewModel.typeOptions.filter((item) => item.value !== 'all')"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="courseware-management__form-field">
            <span>文件大小</span>
            <input v-model="drawerDraft.fileSize" type="text" placeholder="例如：2.5 MB" />
            <small v-if="drawerErrors.fileSize" class="courseware-management__field-error">{{ drawerErrors.fileSize }}</small>
          </label>

          <div class="courseware-management__drawer-meta">
            <strong>自动维护信息</strong>
            <p>上传人：{{ currentCoursewareUploader }}</p>
            <p>上传时间：保存时自动刷新为当天日期。</p>
            <p v-if="drawerErrors.uploadedBy" class="courseware-management__field-error">{{ drawerErrors.uploadedBy }}</p>
          </div>
        </div>

        <footer class="courseware-management__drawer-actions">
          <button type="button" class="courseware-management__drawer-action" @click="closeDrawer">取消</button>
          <button type="button" class="courseware-management__drawer-action primary" @click="saveDrawer">
            保存课件
          </button>
        </footer>
      </aside>
    </div>
  </section>
</template>
