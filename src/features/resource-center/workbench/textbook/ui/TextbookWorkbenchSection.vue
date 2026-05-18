<script setup lang="ts">
import '../styles/textbook-workbench.css'

import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { createTextbook, deleteTextbook, listTextbooks, updateTextbook } from '@/api/textbook.ts'
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchBulkBar from '../../shared/ui/WorkbenchBulkBar.vue'
import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchDrawerHost from '../../shared/ui/WorkbenchDrawerHost.vue'
import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'

import type { TextbookCreatePayload, TextbookRecord, TextbookUpdatePayload } from '@/api/textbook.ts'
import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

interface TeacherOwnedTextbookRecord {
  id: string
  ownerId: string
  name: string
  author: string
  publisher: string
  edition: string
  isbn: string
  course: string
  updatedAt: string
}

interface TextbookDraft {
  name: string
  author: string
  publisher: string
  edition: string
  isbn: string
  course: string
}

type DrawerMode = 'create' | 'edit'
type FeedbackTone = 'success' | 'info' | 'danger'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const currentAdminId = 'admin-xie'

const seedRows: TeacherOwnedTextbookRecord[] = [
  {
    id: 'tb-1001',
    ownerId: currentAdminId,
    name: '计算机网络（第8版）',
    author: '谢希仁',
    publisher: '电子工业出版社',
    edition: '第8版',
    isbn: '9787121361708',
    course: '计算机网络',
    updatedAt: '2026-04-02',
  },
  {
    id: 'tb-1002',
    ownerId: currentAdminId,
    name: '数据结构（C语言版）',
    author: '严蔚敏',
    publisher: '清华大学出版社',
    edition: '第2版',
    isbn: '9787302147510',
    course: '数据结构',
    updatedAt: '2026-04-01',
  },
  {
    id: 'tb-1003',
    ownerId: currentAdminId,
    name: '操作系统概念',
    author: 'Abraham Silberschatz',
    publisher: '高等教育出版社',
    edition: '第9版',
    isbn: '9787040452532',
    course: '操作系统',
    updatedAt: '2026-04-03',
  },
  {
    id: 'tb-1004',
    ownerId: currentAdminId,
    name: '数据库系统概论',
    author: '王珊',
    publisher: '高等教育出版社',
    edition: '第6版',
    isbn: '9787040556407',
    course: '数据库系统',
    updatedAt: '2026-04-04',
  },
  {
    id: 'tb-1005',
    ownerId: currentAdminId,
    name: '编译原理',
    author: '陈意云',
    publisher: '清华大学出版社',
    edition: '第3版',
    isbn: '9787302501374',
    course: '编译原理',
    updatedAt: '2026-04-04',
  },
  {
    id: 'tb-1006',
    ownerId: currentAdminId,
    name: '离散数学',
    author: '屈婉玲',
    publisher: '高等教育出版社',
    edition: '第2版',
    isbn: '9787040580174',
    course: '离散数学',
    updatedAt: '2026-04-05',
  },
  {
    id: 'tb-1007',
    ownerId: currentAdminId,
    name: '软件工程导论',
    author: '张海藩',
    publisher: '清华大学出版社',
    edition: '第7版',
    isbn: '9787302553915',
    course: '软件工程',
    updatedAt: '2026-04-06',
  },
  {
    id: 'tb-1008',
    ownerId: currentAdminId,
    name: '人工智能导论',
    author: '李德毅',
    publisher: '机械工业出版社',
    edition: '第4版',
    isbn: '9787111726555',
    course: '人工智能',
    updatedAt: '2026-04-07',
  },
  {
    id: 'tb-1009',
    ownerId: currentAdminId,
    name: '计算机组成原理',
    author: '唐朔飞',
    publisher: '高等教育出版社',
    edition: '第3版',
    isbn: '9787040521979',
    course: '计算机组成原理',
    updatedAt: '2026-04-08',
  },
  {
    id: 'tb-1010',
    ownerId: currentAdminId,
    name: '程序设计基础（Python）',
    author: '嵩天',
    publisher: '高等教育出版社',
    edition: '第2版',
    isbn: '9787040566208',
    course: '程序设计基础',
    updatedAt: '2026-04-09',
  },
  {
    id: 'tb-1011',
    ownerId: 'teacher-li',
    name: '机器学习',
    author: '周志华',
    publisher: '清华大学出版社',
    edition: '第1版',
    isbn: '9787302423287',
    course: '机器学习',
    updatedAt: '2026-03-20',
  },
  {
    id: 'tb-1012',
    ownerId: 'teacher-wang',
    name: '计算机图形学',
    author: 'Peter Shirley',
    publisher: '人民邮电出版社',
    edition: '第5版',
    isbn: '9787115599940',
    course: '计算机图形学',
    updatedAt: '2026-03-22',
  },
]

const fallbackRows = ref<TeacherOwnedTextbookRecord[]>([...seedRows])
const apiRows = ref<TeacherOwnedTextbookRecord[]>([])
const knownCourses = ref(
  [...new Set(seedRows.map((row) => row.course))].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')),
)
const pageSize = ref(10)
const page = ref(1)
const keywordInput = ref('')
const keyword = ref('')
const isUsingFallback = ref(false)
const isLoading = ref(false)
const total = ref(seedRows.length)
let keywordDebounceTimer: ReturnType<typeof setTimeout> | undefined

const filters = reactive({
  course: 'all',
})

const drawerOpen = ref(false)
const drawerMode = ref<DrawerMode>('create')
const drawerTargetId = ref<string>()
const drawerDraft = reactive<TextbookDraft>(createEmptyDraft())
const drawerErrors = reactive<Partial<Record<keyof TextbookDraft, string>>>({})

const feedback = ref<{
  tone: FeedbackTone
  text: string
} | null>(null)
const connectionStatus = ref<'' | 'offline'>('')
const statusVisible = ref(false)
let statusTimer: ReturnType<typeof setTimeout> | undefined

const pageSizeOptions = [10, 20, 50]

const visibleRows = computed(() => (isUsingFallback.value ? fallbackRows.value : apiRows.value))
const selectedIds = ref<string[]>([])

const courseOptions = computed(() => [
  { value: 'all', label: '全部课程' },
  ...knownCourses.value.map((value) => ({ value, label: value })),
])

const filteredFallbackRows = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return visibleRows.value.filter((row) => {
    const matchesKeyword =
      normalizedKeyword.length === 0 ||
      [row.name, row.author, row.isbn].some((field) => field.toLowerCase().includes(normalizedKeyword))

    const matchesCourse = filters.course === 'all' || row.course === filters.course

    return matchesKeyword && matchesCourse
  })
})

const fallbackPageCount = computed(() => Math.max(1, Math.ceil(filteredFallbackRows.value.length / pageSize.value)))

const pageRows = computed(() => {
  if (isUsingFallback.value) {
    const startIndex = (page.value - 1) * pageSize.value
    return filteredFallbackRows.value.slice(startIndex, startIndex + pageSize.value)
  }
  return visibleRows.value
})
const visibleIds = computed(() => pageRows.value.map((row) => row.id))
const allVisibleSelected = computed(
  () => visibleIds.value.length > 0 && visibleIds.value.every((id) => selectedIds.value.includes(id)),
)

const effectiveTotal = computed(() => (isUsingFallback.value ? filteredFallbackRows.value.length : total.value))
const pageCount = computed(() =>
  isUsingFallback.value ? fallbackPageCount.value : Math.max(1, Math.ceil(total.value / pageSize.value)),
)

const rangeStart = computed(() => {
  if (effectiveTotal.value === 0) {
    return 0
  }
  return (page.value - 1) * pageSize.value + 1
})

const rangeEnd = computed(() => Math.min(effectiveTotal.value, page.value * pageSize.value))

watch(keywordInput, (value) => {
  if (keywordDebounceTimer) {
    clearTimeout(keywordDebounceTimer)
  }

  keywordDebounceTimer = setTimeout(() => {
    keyword.value = value
    page.value = 1
    selectedIds.value = []
  }, 300)
})

watch(
  () => filters.course,
  () => {
    page.value = 1
    selectedIds.value = []
  },
)

watch(pageSize, () => {
  page.value = 1
  selectedIds.value = []
})

watch(pageCount, (nextPageCount) => {
  if (page.value > nextPageCount) {
    page.value = nextPageCount
  }
})

watch(
  [page, pageSize, keyword, () => filters.course],
  async () => {
    if (isUsingFallback.value) {
      return
    }
    await loadTextbooks()
  },
  { flush: 'post' },
)

onMounted(async () => {
  await loadTextbooks()
})

onBeforeUnmount(() => {
  if (keywordDebounceTimer) {
    clearTimeout(keywordDebounceTimer)
  }
  dismissStatus()
})

function dismissStatus() {
  statusVisible.value = false
  if (statusTimer) {
    clearTimeout(statusTimer)
    statusTimer = undefined
  }
}

function showTransientStatus() {
  statusVisible.value = true
  if (statusTimer) {
    clearTimeout(statusTimer)
  }
  statusTimer = setTimeout(() => {
    statusVisible.value = false
    statusTimer = undefined
  }, 3200)
}

function createEmptyDraft(): TextbookDraft {
  return {
    name: '',
    author: '',
    publisher: '',
    edition: '',
    isbn: '',
    course: '',
  }
}

function buildDistinctOptions(
  rows: TeacherOwnedTextbookRecord[],
  selector: (row: TeacherOwnedTextbookRecord) => string,
  allLabel: string,
) {
  const values = [...new Set(rows.map(selector))].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  return [{ value: 'all', label: allLabel }, ...values.map((value) => ({ value, label: value }))]
}

function normalizeApiRecord(record: TextbookRecord): TeacherOwnedTextbookRecord {
  return {
    id: String(record.id),
    ownerId: record.ownerId,
    name: record.name,
    author: record.author,
    publisher: record.publisher,
    edition: record.edition,
    isbn: record.isbn,
    course: record.course,
    updatedAt: record.updatedAt.slice(0, 10),
  }
}

function syncKnownCourses(rows: TeacherOwnedTextbookRecord[]) {
  knownCourses.value = [...new Set([...knownCourses.value, ...rows.map((row) => row.course)])].sort((a, b) =>
    a.localeCompare(b, 'zh-Hans-CN'),
  )
}

async function loadTextbooks() {
  isLoading.value = true

  try {
    const result = await listTextbooks({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim(),
      course: filters.course === 'all' ? '' : filters.course,
    })

    apiRows.value = result.records.map(normalizeApiRecord)
    syncKnownCourses(apiRows.value)
    total.value = result.total

    if (isUsingFallback.value) {
      feedback.value = {
        tone: 'info',
        text: '已切回真实教材数据。',
      }
    }

    isUsingFallback.value = false
    connectionStatus.value = ''
  } catch {
    apiRows.value = []
    total.value = seedRows.length
    isUsingFallback.value = true
    connectionStatus.value = 'offline'
    showTransientStatus()
    feedback.value = null
  } finally {
    isLoading.value = false
  }
}

function clearDrawerErrors() {
  for (const key of Object.keys(drawerErrors) as (keyof TextbookDraft)[]) {
    delete drawerErrors[key]
  }
}

function resetDrawerDraft(record?: TeacherOwnedTextbookRecord) {
  drawerDraft.name = record?.name ?? ''
  drawerDraft.author = record?.author ?? ''
  drawerDraft.publisher = record?.publisher ?? ''
  drawerDraft.edition = record?.edition ?? ''
  drawerDraft.isbn = record?.isbn ?? ''
  drawerDraft.course = record?.course ?? ''
}

function openCreateDrawer() {
  drawerMode.value = 'create'
  drawerTargetId.value = undefined
  resetDrawerDraft()
  clearDrawerErrors()
  drawerOpen.value = true
}

function openEditDrawer(id: string) {
  const target = visibleRows.value.find((row) => row.id === id)
  if (!target) {
    return
  }

  drawerMode.value = 'edit'
  drawerTargetId.value = id
  resetDrawerDraft(target)
  clearDrawerErrors()
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  clearDrawerErrors()
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

function validateDrawer(): boolean {
  clearDrawerErrors()

  if (!drawerDraft.name.trim()) {
    drawerErrors.name = '请填写教材名称。'
  }
  if (!drawerDraft.author.trim()) {
    drawerErrors.author = '请填写作者。'
  }
  if (!drawerDraft.publisher.trim()) {
    drawerErrors.publisher = '请填写出版社。'
  }
  if (!drawerDraft.edition.trim()) {
    drawerErrors.edition = '请填写版本。'
  }
  if (!drawerDraft.course.trim()) {
    drawerErrors.course = '请填写关联课程。'
  }
  if (!/^\d{10,13}$/.test(drawerDraft.isbn.trim())) {
    drawerErrors.isbn = 'ISBN 需为 10 到 13 位数字。'
  }

  const duplicate = visibleRows.value.find((row) => {
    if (drawerMode.value === 'edit' && row.id === drawerTargetId.value) {
      return false
    }

    return row.isbn === drawerDraft.isbn.trim()
  })

  if (duplicate) {
    drawerErrors.isbn = 'ISBN 已存在，请检查是否重复录入。'
  }

  return Object.keys(drawerErrors).length === 0
}

function buildPayload(): TextbookUpdatePayload {
  return {
    name: drawerDraft.name.trim(),
    author: drawerDraft.author.trim(),
    publisher: drawerDraft.publisher.trim(),
    edition: drawerDraft.edition.trim(),
    isbn: drawerDraft.isbn.trim(),
    course: drawerDraft.course.trim(),
  }
}

async function saveDrawer() {
  if (!validateDrawer()) {
    return
  }

  if (isUsingFallback.value) {
    saveFallbackDrawer()
    return
  }

  try {
    if (drawerMode.value === 'create') {
      await createTextbook({
        ...buildPayload(),
        ownerId: currentAdminId,
      } satisfies TextbookCreatePayload)
      feedback.value = {
        tone: 'success',
        text: '教材已新建。',
      }
    } else if (drawerTargetId.value) {
      await updateTextbook(Number(drawerTargetId.value), buildPayload())
      feedback.value = {
        tone: 'info',
        text: '教材信息已更新。',
      }
    }

    closeDrawer()
    await loadTextbooks()
  } catch (error) {
    feedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '教材保存失败，请稍后重试。',
    }
  }
}

function saveFallbackDrawer() {
  const payload: Omit<TeacherOwnedTextbookRecord, 'id' | 'ownerId' | 'updatedAt'> = buildPayload()

    if (drawerMode.value === 'create') {
      fallbackRows.value = [
      {
        id: `tb-${Date.now().toString(36)}`,
        ownerId: currentAdminId,
        updatedAt: new Date().toISOString().slice(0, 10),
        ...payload,
      },
      ...fallbackRows.value,
    ]
    feedback.value = {
      tone: 'success',
      text: '教材已新建。',
    }
  } else if (drawerTargetId.value) {
    fallbackRows.value = fallbackRows.value.map((row) =>
      row.id === drawerTargetId.value
        ? {
            ...row,
            ...payload,
            updatedAt: new Date().toISOString().slice(0, 10),
          }
        : row,
    )
    feedback.value = {
      tone: 'info',
      text: '教材信息已更新。',
      }
    }

  syncKnownCourses(fallbackRows.value)
  page.value = 1
  closeDrawer()
}

async function deleteRow(id: string) {
  const target = visibleRows.value.find((row) => row.id === id)
  if (!target) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除《${target.name}》吗？`)) {
    return
  }

  if (isUsingFallback.value) {
    fallbackRows.value = fallbackRows.value.filter((row) => row.id !== id)
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
    feedback.value = {
      tone: 'danger',
      text: '教材已删除。',
    }
    return
  }

  try {
    await deleteTextbook(Number(id))
    selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id)
    feedback.value = {
      tone: 'danger',
      text: '教材已删除。',
    }
    await loadTextbooks()
  } catch (error) {
    feedback.value = {
      tone: 'danger',
      text: error instanceof Error ? error.message : '教材删除失败，请稍后重试。',
    }
  }
}

function goToPage(targetPage: number) {
  page.value = Math.min(pageCount.value, Math.max(1, targetPage))
}

function handlePageSizeChange(nextPageSize: number) {
  pageSize.value = nextPageSize
  page.value = 1
}

function resetFilters() {
  keywordInput.value = ''
  keyword.value = ''
  filters.course = 'all'
  page.value = 1
  selectedIds.value = []
}

async function handleBulkDelete() {
  if (selectedIds.value.length === 0) {
    return
  }

  const deleteIds = [...selectedIds.value]

  if (isUsingFallback.value) {
    fallbackRows.value = fallbackRows.value.filter((row) => !deleteIds.includes(row.id))
  } else {
    for (const id of deleteIds) {
      await deleteTextbook(Number(id))
    }
    await loadTextbooks()
  }

  feedback.value = {
    tone: 'danger',
    text: `已删除当前页选中的 ${deleteIds.length} 本教材。`,
  }
  selectedIds.value = []
}
</script>

<template>
  <WorkbenchDataView class="textbook-management" :data-section="props.section.key" :selected-count="selectedIds.length">
    <template #summary>
      <header class="textbook-management__head">
        <div class="textbook-management__heading">
          <h2>{{ props.section.title }}</h2>
        </div>
        <div
          v-if="connectionStatus === 'offline'"
          class="textbook-management__status-anchor"
          @mouseenter="statusVisible = true"
          @mouseleave="dismissStatus"
        >
          <button class="textbook-management__status-pill" type="button" @click="statusVisible = !statusVisible">
            连接异常
          </button>
          <div v-if="statusVisible" class="textbook-management__status-popover">
            后端连接失败，当前显示本地教材样例。
          </div>
        </div>
      </header>
    </template>

    <template #feedback>
      <div
        v-if="feedback"
        class="textbook-management__feedback"
        :class="`is-${feedback.tone}`"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>
    </template>

    <template #toolbar>
      <section class="textbook-management__toolbar">
        <label class="textbook-management__search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.search"></path>
          </svg>
          <input
            v-model="keywordInput"
            type="search"
            placeholder="搜索教材名称或作者..."
          />
        </label>

        <label class="textbook-management__select-field">
          <WorkbenchSelect v-model="filters.course" aria-label="按课程筛选教材" :options="courseOptions" />
        </label>

        <button class="textbook-management__reset-button" type="button" @click="resetFilters">
          重置筛选
        </button>

        <button class="textbook-management__create-button" type="button" @click="openCreateDrawer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.plus"></path>
          </svg>
          <span>新建教材</span>
        </button>
      </section>
    </template>

    <template #bulk>
      <WorkbenchBulkBar v-if="selectedIds.length > 0" :selected-count="selectedIds.length" @clear="selectedIds = []">
        <button type="button" class="textbook-management__bulk-button danger" @click="handleBulkDelete()">批量删除</button>
      </WorkbenchBulkBar>
    </template>

    <template #table>
      <div v-if="isLoading" class="textbook-management__loading-state">
        <div class="textbook-management__loading-icon">⏳</div>
        <h3>正在加载教材数据...</h3>
        <p>正在尝试连接后端服务，请稍候。</p>
      </div>

      <WorkbenchTable
        v-else
        :rows="pageRows"
        :columns="[
          { key: 'name', title: '教材名称', mobileLabel: '教材名称' },
          { key: 'author', title: '作者', mobileLabel: '作者' },
          { key: 'publisher', title: '出版社', mobileLabel: '出版社' },
          { key: 'edition', title: '版本', mobileLabel: '版本' },
          { key: 'isbn', title: 'ISBN', mobileLabel: 'ISBN' },
          { key: 'course', title: '关联课程', mobileLabel: '关联课程' },
          { key: 'actions', title: '操作', mobileLabel: '操作' },
        ]"
        row-key="id"
        selectable
        :selected-row-keys="selectedIds"
        :all-visible-selected="allVisibleSelected"
        :empty-state="{ title: '暂无符合条件的教材，请调整筛选或新建教材。', description: '' }"
        @toggle-row="toggleRowSelection($event.id)"
        @toggle-all-visible="toggleVisibleSelection"
      >
        <template #cell-name="{ row }">
          <div class="textbook-management__name-cell">
            <strong>{{ row.name }}</strong>
            <small>最近更新：{{ row.updatedAt }}</small>
          </div>
        </template>

        <template #cell-isbn="{ row }">
          <span class="textbook-management__isbn-cell">{{ row.isbn }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="textbook-management__row-actions">
            <button type="button" aria-label="编辑教材" @click.stop="openEditDrawer(row.id)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.edit"></path>
              </svg>
            </button>
            <button type="button" class="danger" aria-label="删除教材" @click.stop="deleteRow(row.id)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.trash"></path>
              </svg>
            </button>
          </div>
        </template>
      </WorkbenchTable>
    </template>

    <template #pagination>
      <footer class="textbook-management__pagination">
        <WorkbenchTablePagination
          :pagination="{
            page,
            pageSize,
            total: effectiveTotal,
            pageCount,
            from: rangeStart,
            to: rangeEnd,
            hasPrev: page > 1,
            hasNext: page < pageCount,
          }"
          :page-size="pageSize"
          :page-size-options="pageSizeOptions"
          show-quick-jumper
          @page-change="goToPage"
          @page-size-change="handlePageSizeChange"
        />
      </footer>
    </template>

    <template #drawer>
      <WorkbenchDrawerHost :open="drawerOpen" width="md" @close="closeDrawer">
        <template #header>
      <header class="textbook-management__drawer-head">
        <h3>{{ drawerMode === 'create' ? '新建教材' : '编辑教材' }}</h3>
        <button type="button" aria-label="关闭抽屉" @click="closeDrawer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.x"></path>
          </svg>
        </button>
      </header>
        </template>

        <template #default>
          <form class="textbook-management__drawer-form" @submit.prevent="saveDrawer">
            <label class="textbook-management__drawer-field">
              <span>教材名称</span>
              <input v-model="drawerDraft.name" type="text" />
              <small v-if="drawerErrors.name">{{ drawerErrors.name }}</small>
            </label>

            <label class="textbook-management__drawer-field">
              <span>作者</span>
              <input v-model="drawerDraft.author" type="text" />
              <small v-if="drawerErrors.author">{{ drawerErrors.author }}</small>
            </label>

            <label class="textbook-management__drawer-field">
              <span>出版社</span>
              <input v-model="drawerDraft.publisher" type="text" />
              <small v-if="drawerErrors.publisher">{{ drawerErrors.publisher }}</small>
            </label>

            <label class="textbook-management__drawer-field">
              <span>版本</span>
              <input v-model="drawerDraft.edition" type="text" />
              <small v-if="drawerErrors.edition">{{ drawerErrors.edition }}</small>
            </label>

            <label class="textbook-management__drawer-field">
              <span>ISBN</span>
              <input v-model="drawerDraft.isbn" type="text" />
              <small v-if="drawerErrors.isbn">{{ drawerErrors.isbn }}</small>
            </label>

            <label class="textbook-management__drawer-field">
              <span>关联课程</span>
              <input v-model="drawerDraft.course" type="text" />
              <small v-if="drawerErrors.course">{{ drawerErrors.course }}</small>
            </label>
          </form>
        </template>

        <template #footer>
          <footer class="textbook-management__drawer-actions">
            <button type="button" class="ghost" @click="closeDrawer">取消</button>
            <button type="button" class="solid" @click="saveDrawer">保存</button>
          </footer>
        </template>
      </WorkbenchDrawerHost>
    </template>
  </WorkbenchDataView>
</template>
