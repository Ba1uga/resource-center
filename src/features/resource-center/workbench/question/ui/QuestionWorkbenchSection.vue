<script setup lang="ts">
import '../styles/question-workbench.css'

import { computed, ref } from 'vue'

import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'
import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'
import {
  createQuestionEditorDraft,
  createQuestionEditorDraftFromRecord,
  createQuestionMutationInputFromDraft,
  setQuestionDraftType,
} from '@/features/resource-center/workbench/question/model/question-workbench.editor.ts'
import { questionWorkbenchSubjectOptions } from '@/features/resource-center/workbench/question/model/question-workbench.fixtures.ts'
import {
  createQuestionWorkbenchRepository,
  matchesQuestionQuery,
} from '@/features/resource-center/workbench/question/model/question-workbench.repository.ts'
import {
  hasQuestionValidationErrors,
  validateQuestionEditorDraft,
} from '@/features/resource-center/workbench/question/model/question-workbench.validation.ts'
import {
  applyQuestionStatusCardSelection,
  createDefaultQuestionQueryState,
  createQuestionWorkbenchViewModel,
  getQuestionChapterOptions,
  resolveQuestionPageAfterDeletion,
} from '@/features/resource-center/workbench/question/model/question-workbench.view-model.ts'
import { useQuestionWorkbenchSessionStore } from '@/features/resource-center/workbench/question/store/question-workbench-session.ts'
import QuestionManagementEditor from './management/QuestionManagementEditor.vue'
import QuestionManagementFilters from './management/QuestionManagementFilters.vue'
import QuestionManagementPagination from './management/QuestionManagementPagination.vue'
import QuestionManagementTable from './management/QuestionManagementTable.vue'

import type {
  QuestionEditorDraft,
  QuestionEditorMode,
  QuestionQueryState,
  QuestionStatus,
  QuestionType,
  QuestionValidationErrors,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'
import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'
import type { WorkbenchSummaryCard } from '@/features/resource-center/workbench/shared/model/workbench-summary-cards.ts'

interface QuestionFeedbackState {
  tone: 'success' | 'info' | 'danger'
  text: string
}

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const repository = createQuestionWorkbenchRepository()
const sessionStore = useQuestionWorkbenchSessionStore()
const repositoryVersion = ref(0)
const feedback = ref<QuestionFeedbackState | null>(null)
const editorOpen = ref(false)
const editorMode = ref<QuestionEditorMode>('create')
const editingQuestionId = ref<string>()
const editorDraft = ref(createDraftFromQuery(sessionStore.queryDraft))
const validationErrors = ref<QuestionValidationErrors>({})

const queryDraft = computed<QuestionQueryState>({
  get: () => sessionStore.queryDraft,
  set: (value) => sessionStore.patchQueryDraft(value),
})

const activeQuery = computed<QuestionQueryState>({
  get: () => sessionStore.activeQuery,
  set: (value) => sessionStore.patchQuery(value),
})

const viewModel = computed(() => {
  repositoryVersion.value

  return createQuestionWorkbenchViewModel({
    query: activeQuery.value,
    result: repository.listQuestions(activeQuery.value),
  })
})

const summaryCards = computed<WorkbenchSummaryCard<'matching-total' | QuestionStatus>[]>(() => [
  {
    key: 'matching-total',
    label: '当前结果数',
    value: String(viewModel.value.summary.matchingTotal),
    hint: viewModel.value.summary.filteredLabel,
    kind: 'info',
    active: false,
    interactive: false,
  },
  {
    key: 'draft',
    label: '草稿',
    value: String(viewModel.value.summary.draftTotal),
    hint: '点击后只查看当前筛选条件下的草稿习题',
    kind: 'filter',
    active: activeQuery.value.status === 'draft',
    interactive: viewModel.value.summary.draftTotal > 0 || activeQuery.value.status === 'draft',
  },
  {
    key: 'published',
    label: '已发布',
    value: String(viewModel.value.summary.publishedTotal),
    hint: '点击后只查看当前筛选条件下的已发布习题',
    kind: 'filter',
    active: activeQuery.value.status === 'published',
    interactive: viewModel.value.summary.publishedTotal > 0 || activeQuery.value.status === 'published',
  },
])

const editorSubjectOptions = questionWorkbenchSubjectOptions
const editorChapterOptions = computed(() => getQuestionChapterOptions(editorDraft.value.subjectId))
const typeLocked = computed(() => editorMode.value === 'edit')

function createDraftFromQuery(query = createDefaultQuestionQueryState()): QuestionEditorDraft {
  const subjectId = query.subjectId || questionWorkbenchSubjectOptions[0]?.id || ''
  const chapterId = query.chapterId || getQuestionChapterOptions(subjectId)[0]?.id || ''

  return createQuestionEditorDraft({
    subjectId,
    chapterId,
  })
}

function handleSubjectFilterUpdate(subjectId: string) {
  sessionStore.patchQueryDraft({
    subjectId,
    chapterId: '',
    page: 1,
  })
}

function handleSearch() {
  sessionStore.patchQuery({
    ...queryDraft.value,
    page: 1,
  })
}

function handleReset() {
  sessionStore.reset()
  feedback.value = null
}

function handlePageChange(page: number) {
  sessionStore.patchQuery({
    page,
  })
}

function handleStatusSelect(status: QuestionStatus) {
  queryDraft.value = applyQuestionStatusCardSelection(queryDraft.value, status)
  activeQuery.value = applyQuestionStatusCardSelection(activeQuery.value, status)
}

function handleCreate() {
  editorMode.value = 'create'
  editingQuestionId.value = undefined
  editorDraft.value = createDraftFromQuery(queryDraft.value)
  validationErrors.value = {}
  editorOpen.value = true
}

function handleEdit(questionId: string) {
  const record = viewModel.value.records.find((item) => item.id === questionId)
  if (!record) {
    return
  }

  editorMode.value = 'edit'
  editingQuestionId.value = questionId
  editorDraft.value = createQuestionEditorDraftFromRecord(record)
  validationErrors.value = {}
  editorOpen.value = true
}

function handleCopy(questionId: string) {
  const record = viewModel.value.records.find((item) => item.id === questionId)
  if (!record) {
    return
  }

  editorMode.value = 'copy'
  editingQuestionId.value = undefined
  editorDraft.value = createQuestionEditorDraftFromRecord(record)
  validationErrors.value = {}
  editorOpen.value = true
}

function handleDelete(questionId: string) {
  const record = viewModel.value.records.find((item) => item.id === questionId)
  if (!record) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(`确定删除“${record.stem}”吗？`)) {
    return
  }

  repository.deleteQuestion(questionId)
  repositoryVersion.value += 1

  const totalAfterDeletion = repository.listQuestions({
    ...activeQuery.value,
    page: 1,
  }).total

  activeQuery.value = {
    ...activeQuery.value,
    page: resolveQuestionPageAfterDeletion({
      currentPage: activeQuery.value.page,
      pageSize: activeQuery.value.pageSize,
      totalAfterDeletion,
    }),
  }

  feedback.value = {
    tone: 'success',
    text: '习题已删除。',
  }
}

function handleEditorPatch(patch: Partial<QuestionEditorDraft>) {
  const nextDraft = {
    ...editorDraft.value,
    ...patch,
  }

  if (patch.subjectId !== undefined) {
    const nextChapterOptions = getQuestionChapterOptions(patch.subjectId)
    const hasCurrentChapter = nextChapterOptions.some((option) => option.id === nextDraft.chapterId)
    nextDraft.chapterId = hasCurrentChapter ? nextDraft.chapterId : (nextChapterOptions[0]?.id ?? '')
  }

  editorDraft.value = nextDraft
}

function handleEditorTypeChange(type: QuestionType) {
  editorDraft.value = setQuestionDraftType(editorDraft.value, type)
}

function handleEditorClose() {
  editorOpen.value = false
  validationErrors.value = {}
}

function handleEditorSave() {
  const nextErrors = validateQuestionEditorDraft(editorDraft.value)
  validationErrors.value = nextErrors

  if (hasQuestionValidationErrors(nextErrors)) {
    return
  }

  const payload = createQuestionMutationInputFromDraft(editorDraft.value)
  const savedRecord =
    editorMode.value === 'edit' && editingQuestionId.value
      ? repository.updateQuestion(editingQuestionId.value, payload)
      : repository.createQuestion(payload)

  repositoryVersion.value += 1

  const visibleInCurrentQuery = matchesQuestionQuery(savedRecord, {
    ...activeQuery.value,
    page: 1,
  })

  if (editorMode.value === 'edit') {
    feedback.value = {
      tone: visibleInCurrentQuery ? 'success' : 'info',
      text: visibleInCurrentQuery ? '习题已更新。' : '习题已更新，但当前筛选下不可见。',
    }
  } else {
    feedback.value = {
      tone: visibleInCurrentQuery ? 'success' : 'info',
      text:
        visibleInCurrentQuery
          ? editorMode.value === 'copy'
            ? '习题副本已保存。'
            : '习题已保存。'
          : '习题已保存，但当前筛选下不可见。',
    }

    if (visibleInCurrentQuery) {
      sessionStore.patchQuery({
        page: 1,
      })
    }
  }

  handleEditorClose()
}
</script>

<template>
  <WorkbenchDataView class="question-management" :data-section="props.section.key">
    <template #summary>
      <header class="question-management__head">
        <h2>{{ props.section.title }}</h2>
      </header>

      <WorkbenchSummaryCards :items="summaryCards" @select="(key) => handleStatusSelect(key as QuestionStatus)" />
    </template>

    <template #feedback>
      <div v-if="feedback" class="question-management__feedback" :class="`is-${feedback.tone}`" aria-live="polite">
        {{ feedback.text }}
      </div>
    </template>

    <template #toolbar>
      <QuestionManagementFilters
        class="question-management__toolbar"
        :query="queryDraft"
        :subject-options="viewModel.subjectOptions"
        :chapter-options="viewModel.chapterOptions"
        :type-options="viewModel.typeOptions"
        :difficulty-options="viewModel.difficultyOptions"
        :chapter-disabled="viewModel.chapterDisabled"
        @update-subject="handleSubjectFilterUpdate"
        @update-chapter="(chapterId) => sessionStore.patchQueryDraft({ chapterId })"
        @update-type="(type) => sessionStore.patchQueryDraft({ type })"
        @update-difficulty="(difficulty) => sessionStore.patchQueryDraft({ difficulty })"
        @update-keyword="(keyword) => sessionStore.patchQueryDraft({ keyword })"
        @search="handleSearch"
        @reset="handleReset"
        @create="handleCreate"
      />
    </template>

    <template #table>
      <QuestionManagementTable
        :rows="viewModel.rows"
        :empty-state="viewModel.emptyState"
        @row-click="handleEdit"
        @edit="handleEdit"
        @copy="handleCopy"
        @delete="handleDelete"
      />
    </template>

    <template #pagination>
      <QuestionManagementPagination :pagination="viewModel.pagination" @page-change="handlePageChange" />
    </template>

    <template #drawer>
      <QuestionManagementEditor
        class="question-management__editor-shell"
        :open="editorOpen"
        :mode="editorMode"
        :draft="editorDraft"
        :errors="validationErrors"
        :subject-options="editorSubjectOptions"
        :chapter-options="editorChapterOptions"
        :type-locked="typeLocked"
        @close="handleEditorClose"
        @save="handleEditorSave"
        @patch="handleEditorPatch"
        @set-type="handleEditorTypeChange"
      />
    </template>
  </WorkbenchDataView>
</template>
