<script setup lang="ts">
import '../styles/courseware-workbench.css'

import { computed, reactive, ref } from 'vue'

import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchBulkBar from '../../shared/ui/WorkbenchBulkBar.vue'
import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'
import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'
import WorkbenchDrawerHost from '../../shared/ui/WorkbenchDrawerHost.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'
import {
  coursewareRecords,
  currentCoursewareUploader,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.fixtures.ts'
import {
  createCoursewareWorkbenchViewModel,
  createDefaultCoursewareDraft,
  createDefaultCoursewareFilterState,
  isDefaultCoursewareFilterState,
  matchesCoursewareFilters,
  resolveCoursewarePageAfterDeletion,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.view-model.ts'
import { useCoursewareWorkbenchSessionStore } from '@/features/resource-center/workbench/courseware/store/courseware-workbench-session.ts'
import {
  hasCoursewareValidationErrors,
  validateCoursewareDraft,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.validation.ts'

import type {
  CoursewareDraft,
  CoursewareRecord,
  CoursewareTypeFilter,
  CoursewareValidationErrors,
} from '@/features/resource-center/workbench/courseware/model/courseware-workbench.types.ts'
import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

type DrawerMode = 'create' | 'edit'
type FeedbackTone = 'success' | 'info' | 'danger'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const pageSize = 8
const sessionStore = useCoursewareWorkbenchSessionStore()
const records = ref<CoursewareRecord[]>([...coursewareRecords])
const selectedIds = ref<string[]>([])
const drawerOpen = ref(false)
const drawerMode = ref<DrawerMode>('create')
const drawerTargetId = ref<string>()
const drawerDraft = reactive(createDefaultCoursewareDraft())
const drawerErrors = reactive<CoursewareValidationErrors>({})
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
  createCoursewareWorkbenchViewModel({
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

const drawerTitle = computed(() => (drawerMode.value === 'create' ? '上传课件' : '编辑课件'))
const drawerDescription = computed(() =>
  drawerMode.value === 'create'
    ? '补充课件基础信息，保存后会自动归入当前课件台。'
    : '更新课件信息后，上传时间会自动刷新为最新保存时间。',
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
  sessionStore.setPage(resolveCoursewarePageAfterDeletion({
    currentPage: page.value,
    pageSize,
    totalAfterDeletion: records.value.length,
  }))
  selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
  feedback.value = {
    tone: 'success',
    text: '课件已删除。',
  }
}

function handlePageChange(nextPage: number) {
  if (nextPage < 1 || nextPage > viewModel.value.pagination.pageCount) {
    return
  }

  sessionStore.setPage(nextPage)
}

function handleSummaryCardSelect(key: string) {
  if (key !== 'all' || isDefaultCoursewareFilterState(filters.value)) {
    return
  }

  sessionStore.reset()
  selectedIds.value = []
}

function toggleRowSelection(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function toggleVisibleSelection() {
  selectedIds.value = allVisibleSelected.value
    ? selectedIds.value.filter((id) => !visibleIds.value.includes(id))
    : [...new Set([...selectedIds.value, ...visibleIds.value])]
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
    sessionStore.setPage(1)
  }

  const visibleUnderFilters = matchesCoursewareFilters(nextRecord, {
    ...filters.value,
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

function handleBulkDelete() {
  if (selectedIds.value.length === 0) {
    return
  }

  records.value = records.value.filter((record) => !selectedIds.value.includes(record.id))
  sessionStore.setPage(resolveCoursewarePageAfterDeletion({
    currentPage: page.value,
    pageSize,
    totalAfterDeletion: records.value.length,
  }))
  feedback.value = {
    tone: 'success',
    text: `已删除当前页选中的 ${selectedIds.value.length} 个课件。`,
  }
  selectedIds.value = []
}
</script>

<template>
  <WorkbenchDataView class="courseware-management" :data-section="props.section.key" :selected-count="selectedIds.length">
    <template #summary>
      <header class="courseware-management__head">
        <h2>{{ props.section.title }}</h2>
      </header>

      <WorkbenchSummaryCards :items="viewModel.summaryCards" @select="(key) => handleSummaryCardSelect(key)" />
    </template>

    <template #feedback>
      <div
        v-if="feedback"
        class="courseware-management__feedback"
        :class="`is-${feedback.tone}`"
        role="status"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>
    </template>

    <template #toolbar>
      <div class="courseware-management__toolbar">
        <label class="courseware-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input
            :value="filters.keyword"
            type="text"
            placeholder="搜索课件标题..."
            @input="sessionStore.patchFilters({ keyword: ($event.target as HTMLInputElement).value }); selectedIds = []"
          />
        </label>

        <label class="courseware-management__select-field">
          <WorkbenchSelect
            :model-value="filters.course"
            aria-label="按课程筛选课件"
            :options="viewModel.courseOptions"
            @update:model-value="(course) => { sessionStore.patchFilters({ course }); selectedIds = [] }"
          />
        </label>

        <label class="courseware-management__select-field">
          <WorkbenchSelect
            :model-value="filters.type"
            aria-label="按类型筛选课件"
            :options="viewModel.typeOptions"
            @update:model-value="(type) => { sessionStore.patchFilters({ type: type as CoursewareTypeFilter }); selectedIds = [] }"
          />
        </label>

        <button type="button" class="courseware-management__create-button" @click="handleCreate">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.plus"></path>
          </svg>
          上传课件
        </button>
      </div>
    </template>

    <template #bulk>
      <WorkbenchBulkBar v-if="selectedIds.length > 0" :selected-count="selectedIds.length" @clear="selectedIds = []">
        <button type="button" class="courseware-management__bulk-button danger" @click="handleBulkDelete()">批量删除</button>
      </WorkbenchBulkBar>
    </template>

    <template #table>
      <WorkbenchTable
        :rows="viewModel.rows"
        :columns="[
          { key: 'title', title: '课件标题', mobileLabel: '课件标题' },
          { key: 'course', title: '课程', mobileLabel: '课程' },
          { key: 'chapter', title: '章节', mobileLabel: '章节' },
          { key: 'type', title: '类型', mobileLabel: '类型' },
          { key: 'fileSize', title: '文件大小', mobileLabel: '文件大小' },
          { key: 'uploadedBy', title: '上传人', mobileLabel: '上传人' },
          { key: 'uploadedAt', title: '上传时间', mobileLabel: '上传时间' },
          { key: 'actions', title: '操作', mobileLabel: '操作' },
        ]"
        row-key="id"
        selectable
        :selected-row-keys="selectedIds"
        :all-visible-selected="allVisibleSelected"
        :empty-state="viewModel.emptyState"
        @toggle-row="toggleRowSelection($event.id)"
        @toggle-all-visible="toggleVisibleSelection"
      >
        <template #cell-title="{ row }">
          <span class="courseware-management__title-cell">{{ row.title }}</span>
        </template>

        <template #cell-fileSize="{ row }">
          <span class="courseware-management__numeric-cell">{{ row.fileSize }}</span>
        </template>

        <template #cell-uploadedAt="{ row }">
          <span class="courseware-management__date-cell">{{ row.uploadedAt }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="courseware-management__row-actions">
            <button
              type="button"
              class="courseware-management__icon-button"
              aria-label="编辑课件"
              @click.stop="handleEdit(row.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.edit"></path>
              </svg>
            </button>
            <button
              type="button"
              class="danger"
              aria-label="删除课件"
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
      <footer class="courseware-management__pagination">
        <WorkbenchTablePagination :pagination="viewModel.pagination" show-quick-jumper @page-change="handlePageChange" />
      </footer>
    </template>

    <template #drawer>
      <WorkbenchDrawerHost :open="drawerOpen" width="md" @close="closeDrawer">
        <template #header>
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
        </template>

        <template #default>
        <div class="courseware-management__form">
          <label class="courseware-management__form-field">
            <span>课件标题</span>
            <input v-model="drawerDraft.title" type="text" placeholder="例如：第一章 计算机网络概述" />
            <small v-if="drawerErrors.title" class="courseware-management__field-error">{{ drawerErrors.title }}</small>
          </label>

          <label class="courseware-management__form-field">
            <span>课程</span>
            <WorkbenchSelect
              v-model="drawerDraft.course"
              aria-label="选择课件课程"
              :options="[
                { value: '', label: '请选择课程', disabled: true },
                ...viewModel.courseOptions.slice(1),
              ]"
            />
            <small v-if="drawerErrors.course" class="courseware-management__field-error">{{ drawerErrors.course }}</small>
          </label>

          <label class="courseware-management__form-field">
            <span>章节</span>
            <input v-model="drawerDraft.chapter" type="text" placeholder="例如：第2章" />
            <small v-if="drawerErrors.chapter" class="courseware-management__field-error">{{ drawerErrors.chapter }}</small>
          </label>

          <label class="courseware-management__form-field">
            <span>类型</span>
            <WorkbenchSelect
              v-model="drawerDraft.type"
              aria-label="选择课件类型"
              :options="viewModel.typeOptions.filter((item) => item.value !== 'all')"
            />
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
        </template>

        <template #footer>
        <footer class="courseware-management__drawer-actions">
          <button type="button" class="courseware-management__drawer-action" @click="closeDrawer">取消</button>
          <button type="button" class="courseware-management__drawer-action primary" @click="saveDrawer">
            保存课件
          </button>
        </footer>
        </template>
      </WorkbenchDrawerHost>
    </template>
  </WorkbenchDataView>
</template>
