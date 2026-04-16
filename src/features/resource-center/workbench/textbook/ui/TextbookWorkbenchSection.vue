<script setup lang="ts">
import '../styles/textbook-workbench.css'

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'

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

const allRows = ref<TeacherOwnedTextbookRecord[]>([...seedRows])
const pageSize = ref(10)
const page = ref(1)
const keywordInput = ref('')
const keyword = ref('')
let keywordDebounceTimer: ReturnType<typeof setTimeout> | undefined

const filters = reactive({
  course: 'all',
  publisher: 'all',
  edition: 'all',
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

const pageSizeOptions = [10, 20, 50]

const visibleRows = computed(() => allRows.value)

const courseOptions = computed(() => buildDistinctOptions(visibleRows.value, (row) => row.course, '全部课程'))
const publisherOptions = computed(() => buildDistinctOptions(visibleRows.value, (row) => row.publisher, '全部出版社'))
const editionOptions = computed(() => buildDistinctOptions(visibleRows.value, (row) => row.edition, '全部版本'))

const filteredRows = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return visibleRows.value.filter((row) => {
    const matchesKeyword =
      normalizedKeyword.length === 0 ||
      [row.name, row.author, row.isbn].some((field) => field.toLowerCase().includes(normalizedKeyword))

    const matchesCourse = filters.course === 'all' || row.course === filters.course
    const matchesPublisher = filters.publisher === 'all' || row.publisher === filters.publisher
    const matchesEdition = filters.edition === 'all' || row.edition === filters.edition

    return matchesKeyword && matchesCourse && matchesPublisher && matchesEdition
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))

const pageRows = computed(() => {
  const startIndex = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(startIndex, startIndex + pageSize.value)
})

const rangeStart = computed(() => {
  if (filteredRows.value.length === 0) {
    return 0
  }

  return (page.value - 1) * pageSize.value + 1
})

const rangeEnd = computed(() => Math.min(filteredRows.value.length, page.value * pageSize.value))

watch(keywordInput, (value) => {
  if (keywordDebounceTimer) {
    clearTimeout(keywordDebounceTimer)
  }

  keywordDebounceTimer = setTimeout(() => {
    keyword.value = value
    page.value = 1
  }, 300)
})

watch(
  () => [filters.course, filters.publisher, filters.edition],
  () => {
    page.value = 1
  },
)

watch(pageSize, () => {
  page.value = 1
})

watch(pageCount, (nextPageCount) => {
  if (page.value > nextPageCount) {
    page.value = nextPageCount
  }
})

onBeforeUnmount(() => {
  if (keywordDebounceTimer) {
    clearTimeout(keywordDebounceTimer)
  }
})

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
  return [
    { value: 'all', label: allLabel },
    ...values.map((value) => ({ value, label: value })),
  ]
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
  const target = allRows.value.find((row) => row.id === id)
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

  const duplicate = allRows.value.find((row) => {
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

function saveDrawer() {
  if (!validateDrawer()) {
    return
  }

  const payload: Omit<TeacherOwnedTextbookRecord, 'id' | 'ownerId' | 'updatedAt'> = {
    name: drawerDraft.name.trim(),
    author: drawerDraft.author.trim(),
    publisher: drawerDraft.publisher.trim(),
    edition: drawerDraft.edition.trim(),
    isbn: drawerDraft.isbn.trim(),
    course: drawerDraft.course.trim(),
  }

  if (drawerMode.value === 'create') {
    allRows.value = [
      {
        id: `tb-${Date.now().toString(36)}`,
        ownerId: currentAdminId,
        updatedAt: new Date().toISOString().slice(0, 10),
        ...payload,
      },
      ...allRows.value,
    ]
    feedback.value = {
      tone: 'success',
      text: '教材已新建。',
    }
  } else if (drawerTargetId.value) {
    allRows.value = allRows.value.map((row) =>
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

  page.value = 1
  closeDrawer()
}

function deleteRow(id: string) {
  const target = allRows.value.find((row) => row.id === id)
  if (!target) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除《${target.name}》吗？`)) {
    return
  }

  allRows.value = allRows.value.filter((row) => row.id !== id)
  feedback.value = {
    tone: 'danger',
    text: '教材已删除。',
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
  filters.publisher = 'all'
  filters.edition = 'all'
  page.value = 1
}
</script>

<template>
  <section class="textbook-management workbench-surface" :data-section="props.section.key">
    <div class="textbook-management__controls">
      <header class="textbook-management__head">
        <div class="textbook-management__heading">
          <h2>{{ props.section.title }}</h2>
        </div>
        <span class="textbook-management__scope-pill">管理员可管理全部教材</span>
      </header>

      <div
        v-if="feedback"
        class="textbook-management__feedback"
        :class="`is-${feedback.tone}`"
        aria-live="polite"
      >
        {{ feedback.text }}
      </div>

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
          <select v-model="filters.course">
            <option v-for="option in courseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <button class="textbook-management__create-button" type="button" @click="openCreateDrawer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.plus"></path>
          </svg>
          <span>新建教材</span>
        </button>
      </section>

      <section class="textbook-management__toolbar-advanced">
        <label class="textbook-management__select-field compact">
          <span>出版社</span>
          <select v-model="filters.publisher">
            <option v-for="option in publisherOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="textbook-management__select-field compact">
          <span>版本</span>
          <select v-model="filters.edition">
            <option v-for="option in editionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <button class="textbook-management__reset-button" type="button" @click="resetFilters">
          重置筛选
        </button>
      </section>
    </div>

    <section class="textbook-management__table-shell">
      <div class="textbook-management__table-scroll">
        <table class="textbook-management__table">
          <thead>
            <tr>
              <th>教材名称</th>
              <th>作者</th>
              <th>出版社</th>
              <th>版本</th>
              <th>ISBN</th>
              <th>关联课程</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pageRows.length === 0">
              <td colspan="7" class="textbook-management__empty">
                暂无符合条件的教材，请调整筛选或新建教材。
              </td>
            </tr>
            <tr v-for="row in pageRows" :key="row.id">
              <td>
                <div class="textbook-management__name-cell">
                  <strong>{{ row.name }}</strong>
                  <small>最近更新：{{ row.updatedAt }}</small>
                </div>
              </td>
              <td>{{ row.author }}</td>
              <td>{{ row.publisher }}</td>
              <td>{{ row.edition }}</td>
              <td class="textbook-management__isbn-cell">{{ row.isbn }}</td>
              <td>{{ row.course }}</td>
              <td>
                <div class="textbook-management__row-actions">
                  <button type="button" aria-label="编辑教材" @click="openEditDrawer(row.id)">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="iconPaths.edit"></path>
                    </svg>
                  </button>
                  <button type="button" class="danger" aria-label="删除教材" @click="deleteRow(row.id)">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path :d="iconPaths.trash"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="textbook-management__pagination">
        <WorkbenchTablePagination
          :pagination="{
            page,
            pageSize,
            total: filteredRows.length,
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
    </section>

    <div v-if="drawerOpen" class="textbook-management__drawer-mask" @click="closeDrawer"></div>
    <aside v-if="drawerOpen" class="textbook-management__drawer">
      <header class="textbook-management__drawer-head">
        <h3>{{ drawerMode === 'create' ? '新建教材' : '编辑教材' }}</h3>
        <button type="button" aria-label="关闭抽屉" @click="closeDrawer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.x"></path>
          </svg>
        </button>
      </header>

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

        <footer class="textbook-management__drawer-actions">
          <button type="button" class="ghost" @click="closeDrawer">取消</button>
          <button type="submit" class="solid">保存</button>
        </footer>
      </form>
    </aside>
  </section>
</template>
