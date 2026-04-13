<script setup lang="ts">
import '../styles/question-workbench.css'

import { computed, ref } from 'vue'

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
  createDefaultQuestionQueryState,
  createQuestionWorkbenchViewModel,
  getQuestionChapterOptions,
  resolveQuestionPageAfterDeletion,
} from '@/features/resource-center/workbench/question/model/question-workbench.view-model.ts'
import QuestionManagementEditor from './management/QuestionManagementEditor.vue'
import QuestionManagementFilters from './management/QuestionManagementFilters.vue'
import QuestionManagementPagination from './management/QuestionManagementPagination.vue'
import QuestionManagementTable from './management/QuestionManagementTable.vue'

import type {
  QuestionEditorDraft,
  QuestionEditorMode,
  QuestionType,
  QuestionValidationErrors,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'
import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

interface QuestionFeedbackState {
  tone: 'success' | 'info' | 'danger'
  text: string
}

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()

const repository = createQuestionWorkbenchRepository()
const queryDraft = ref(createDefaultQuestionQueryState())
const activeQuery = ref(createDefaultQuestionQueryState())
const repositoryVersion = ref(0)
const feedback = ref<QuestionFeedbackState | null>(null)
const editorOpen = ref(false)
const editorMode = ref<QuestionEditorMode>('create')
const editingQuestionId = ref<string>()
const editorDraft = ref(createDraftFromQuery(queryDraft.value))
const validationErrors = ref<QuestionValidationErrors>({})

const viewModel = computed(() => {
  repositoryVersion.value

  return createQuestionWorkbenchViewModel({
    query: activeQuery.value,
    result: repository.listQuestions(activeQuery.value),
  })
})

const summaryCards = computed(() => [
  {
    label: '当前结果数',
    value: String(viewModel.value.summary.matchingTotal),
    hint: viewModel.value.summary.filteredLabel,
  },
  {
    label: '已发布题目',
    value: String(viewModel.value.summary.publishedTotal),
    hint: '当前筛选结果中可直接用于课堂的习题数量',
  },
  {
    label: '最近更新',
    value: viewModel.value.summary.latestUpdatedAtLabel,
    hint: viewModel.value.summary.latestUpdatedHint,
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
  queryDraft.value = {
    ...queryDraft.value,
    subjectId,
    chapterId: '',
    page: 1,
  }
}

function handleSearch() {
  activeQuery.value = {
    ...activeQuery.value,
    ...queryDraft.value,
    page: 1,
  }
}

function handleReset() {
  const nextQuery = createDefaultQuestionQueryState()
  queryDraft.value = nextQuery
  activeQuery.value = nextQuery
  feedback.value = null
}

function handlePageChange(page: number) {
  activeQuery.value = {
    ...activeQuery.value,
    page,
  }
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
      activeQuery.value = {
        ...activeQuery.value,
        page: 1,
      }
    }
  }

  handleEditorClose()
}
</script>

<template>
  <section class="question-management workbench-surface" :data-section="props.section.key">
    <div class="question-management__controls">
      <header class="question-management__head">
        <h2>{{ props.section.title }}</h2>
      </header>

      <div class="question-management__summary">
        <article v-for="item in summaryCards" :key="item.label" class="question-management__summary-card">
          <span>{{ item.label }}</span>
          <strong class="question-management__summary-value">{{ item.value }}</strong>
          <p>{{ item.hint }}</p>
        </article>
      </div>

      <div v-if="feedback" class="question-management__feedback" :class="`is-${feedback.tone}`" aria-live="polite">
        {{ feedback.text }}
      </div>

      <QuestionManagementFilters
        class="question-management__toolbar"
        :query="queryDraft"
        :subject-options="viewModel.subjectOptions"
        :chapter-options="viewModel.chapterOptions"
        :type-options="viewModel.typeOptions"
        :difficulty-options="viewModel.difficultyOptions"
        :chapter-disabled="viewModel.chapterDisabled"
        @update-subject="handleSubjectFilterUpdate"
        @update-chapter="(chapterId) => (queryDraft.chapterId = chapterId)"
        @update-type="(type) => (queryDraft.type = type)"
        @update-difficulty="(difficulty) => (queryDraft.difficulty = difficulty)"
        @update-keyword="(keyword) => (queryDraft.keyword = keyword)"
        @search="handleSearch"
        @reset="handleReset"
        @create="handleCreate"
      />
    </div>

    <div class="question-management__table-shell">
      <div class="question-management__table-scroll">
        <QuestionManagementTable
          :rows="viewModel.rows"
          :empty-state="viewModel.emptyState"
          @edit="handleEdit"
          @copy="handleCopy"
          @delete="handleDelete"
        />
      </div>

      <QuestionManagementPagination :pagination="viewModel.pagination" @page-change="handlePageChange" />
    </div>
  </section>

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
