import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const questionSectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/QuestionWorkbenchSection.vue',
  import.meta.url,
)
const questionStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/styles/question-workbench.css',
  import.meta.url,
)
const filtersUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionManagementFilters.vue',
  import.meta.url,
)
const tableUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionManagementTable.vue',
  import.meta.url,
)
const paginationUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionManagementPagination.vue',
  import.meta.url,
)
const editorUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionManagementEditor.vue',
  import.meta.url,
)
const choiceEditorUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionChoiceEditor.vue',
  import.meta.url,
)
const shortEditorUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionShortAnswerEditor.vue',
  import.meta.url,
)
const codingEditorUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/ui/management/QuestionCodingEditor.vue',
  import.meta.url,
)
const summaryCardsUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchSummaryCards.vue',
  import.meta.url,
)

for (const fileUrl of [
  questionSectionUrl,
  questionStylesUrl,
  filtersUrl,
  tableUrl,
  paginationUrl,
  editorUrl,
  choiceEditorUrl,
  shortEditorUrl,
  codingEditorUrl,
  summaryCardsUrl,
]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const questionSection = readFileSync(questionSectionUrl, 'utf8')
const questionStyles = readFileSync(questionStylesUrl, 'utf8')
const filtersContent = readFileSync(filtersUrl, 'utf8')
const tableContent = readFileSync(tableUrl, 'utf8')
const paginationContent = readFileSync(paginationUrl, 'utf8')
const questionEditor = readFileSync(editorUrl, 'utf8')

assert.ok(questionSection.includes("import '../styles/question-workbench.css'"))
assert.ok(
  questionSection.includes("import WorkbenchSummaryCards from '../../shared/ui/WorkbenchSummaryCards.vue'"),
)
assert.ok(questionSection.includes("import WorkbenchDataView from '../../shared/ui/WorkbenchDataView.vue'"))
assert.equal(
  questionSection.includes(
    "import ModuleWorkbenchShell from '@/features/resource-center/workbench/shared/ui/ModuleWorkbenchShell.vue'",
  ),
  false,
)
assert.ok(
  questionSection.includes(
    "import QuestionManagementFilters from './management/QuestionManagementFilters.vue'",
  ),
)
assert.ok(
  questionSection.includes("import QuestionManagementTable from './management/QuestionManagementTable.vue'"),
)
assert.ok(
  questionSection.includes(
    "import QuestionManagementPagination from './management/QuestionManagementPagination.vue'",
  ),
)
assert.ok(
  questionSection.includes("import QuestionManagementEditor from './management/QuestionManagementEditor.vue'"),
)
assert.ok(questionSection.includes('createQuestionWorkbenchRepository'))
assert.ok(questionSection.includes('createQuestionWorkbenchViewModel'))
assert.ok(questionSection.includes('validateQuestionEditorDraft'))
assert.ok(questionSection.includes('createQuestionMutationInputFromDraft'))
assert.ok(questionSection.includes("import { computed, ref, watch } from 'vue'"))
assert.ok(questionSection.includes('viewModel.value.pagination.pageCount'))
assert.ok(questionSection.includes('if (page <= pageCount)'))
assert.ok(questionSection.includes('sessionStore.patchQuery({'))
assert.equal(questionSection.includes('<ModuleWorkbenchShell'), false)
assert.equal(questionSection.includes(':kicker="props.section.kicker"'), false)
assert.equal(questionSection.includes(':description="props.section.description"'), false)
assert.ok(questionSection.includes('const summaryCards = computed<'))
assert.ok(questionSection.includes("key: 'matching-total'"))
assert.ok(questionSection.includes("key: 'draft'"))
assert.ok(questionSection.includes("key: 'published'"))
assert.ok(questionSection.includes("label: '当前结果数'"))
assert.ok(questionSection.includes("label: '草稿'"))
assert.ok(questionSection.includes("label: '已发布'"))
assert.ok(questionSection.includes("kind: 'info'"))
assert.ok(questionSection.includes("kind: 'filter'"))
assert.ok(questionSection.includes("value: String(viewModel.value.summary.draftTotal)"))
assert.ok(questionSection.includes('<WorkbenchDataView class="question-management"'))
assert.ok(questionSection.includes('<template #summary>'))
assert.ok(questionSection.includes('<template #toolbar>'))
assert.ok(questionSection.includes('<template #table>'))
assert.ok(questionSection.includes('<template #pagination>'))
assert.ok(questionSection.includes('<template #drawer>'))
assert.ok(questionSection.includes('class="question-management__feedback"'))
assert.ok(questionSection.includes('class="question-management__toolbar"'))
assert.ok(questionSection.includes('<WorkbenchSummaryCards :items="summaryCards" @select="(key) => handleStatusSelect(key as QuestionStatus)" />'))
assert.ok(questionSection.includes('<QuestionManagementFilters'))
assert.ok(questionSection.includes('<QuestionManagementTable'))
assert.ok(questionSection.includes('<QuestionManagementPagination'))
assert.ok(questionSection.includes('<QuestionManagementEditor'))
assert.ok(questionSection.includes('question-management__editor-shell'))
assert.ok(questionSection.includes('handleCreate'))
assert.ok(questionSection.includes('handleCopy'))
assert.ok(questionSection.includes('handleDelete'))
assert.ok(questionSection.includes('applyQuestionStatusCardSelection'))
assert.ok(questionSection.includes('function handleStatusSelect(status: '))
assert.ok(questionSection.includes('queryDraft.value = applyQuestionStatusCardSelection(queryDraft.value, status)'))
assert.ok(questionSection.includes('activeQuery.value = applyQuestionStatusCardSelection(activeQuery.value, status)'))
assert.ok(questionSection.includes("value: String(viewModel.value.summary.matchingTotal)"))
assert.ok(questionSection.includes("value: String(viewModel.value.summary.draftTotal)"))
assert.ok(questionSection.includes("value: String(viewModel.value.summary.publishedTotal)"))
assert.equal(questionSection.includes('class="question-management__body"'), false)
assert.equal(questionSection.includes('question-card'), false)
assert.equal(questionSection.includes('question-assistant'), false)
assert.equal(questionSection.includes('role="tablist"'), false)
assert.equal(questionSection.includes('createQuestionHighlightSegments'), false)

assert.ok(filtersContent.includes('class="question-management-filters__search-field"'))
assert.ok(filtersContent.includes('class="question-management-filters__select-field"'))
assert.ok(filtersContent.includes("import WorkbenchSelect from '../../../shared/ui/WorkbenchSelect.vue'"))
assert.ok(filtersContent.includes('<WorkbenchSelect'))
assert.equal(filtersContent.includes('<select :value="query.subjectId"'), false)
assert.equal(filtersContent.includes('<select :value="query.chapterId"'), false)
assert.equal(filtersContent.includes('<select :value="query.type"'), false)
assert.equal(filtersContent.includes('<select :value="query.difficulty"'), false)
assert.ok(filtersContent.includes('question-management-filters__query-button'))
assert.ok(filtersContent.includes('question-management-filters__create-button'))
assert.equal(filtersContent.includes('question-management-filters__grid'), false)

assert.ok(tableContent.includes("import WorkbenchTable from '../../../shared/ui/WorkbenchTable.vue'"))
assert.ok(tableContent.includes('<WorkbenchTable'))
assert.ok(tableContent.includes("event: 'row-click'"))
assert.ok(tableContent.includes('cell-stem'))
assert.ok(tableContent.includes('cell-status'))
assert.ok(tableContent.includes('cell-actions'))

assert.ok(paginationContent.includes('question-management__pagination'))
assert.ok(
  paginationContent.includes(
    "import WorkbenchTablePagination from '@/features/resource-center/workbench/shared/ui/WorkbenchTablePagination.vue'",
  ),
)
assert.ok(paginationContent.includes('<WorkbenchTablePagination'))
assert.ok(paginationContent.includes('show-quick-jumper'))

assert.ok(questionEditor.includes('<QuestionChoiceEditor'))
assert.ok(questionEditor.includes('<QuestionShortAnswerEditor'))
assert.ok(questionEditor.includes('<QuestionCodingEditor'))
assert.ok(questionEditor.includes(`draft.type === 'single'`))
assert.ok(questionEditor.includes(`draft.type === 'multiple'`))
assert.ok(questionEditor.includes(`draft.type === 'short'`))
assert.ok(questionEditor.includes(`draft.type === 'coding'`))

assert.match(
  questionStyles,
  /@import ['"]\.\.\/\.\.\/\.\.\/shared\/styles\/panel-primitives\.css['"];/i,
)
assert.match(
  questionStyles,
  /\.question-management__toolbar\s*\{[\s\S]*?grid-template-columns:\s*minmax\(260px,\s*1\.2fr\)\s+repeat\(4,\s*minmax\(0,\s*156px\)\)\s+auto\s+auto\s+minmax\(140px,\s*auto\);[\s\S]*?gap:\s*12px;[\s\S]*?align-items:\s*stretch;/i,
)
assert.match(
  questionStyles,
  /\.question-management__pagination\s*\{[\s\S]*?justify-content:\s*space-between;[\s\S]*?padding:\s*14px 16px;[\s\S]*?border-top:\s*1px solid var\(--question-line\);/i,
)
assert.match(
  questionStyles,
  /\.question-management__editor-shell\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/i,
)
assert.match(
  questionStyles,
  /\.question-management__editor-panel\s*\{[\s\S]*?background:\s*#fff;[\s\S]*?box-shadow:\s*-24px 0 48px/i,
)
assert.match(
  questionStyles,
  /\.question-management\s*\{[\s\S]*?--workbench-table-line:\s*var\(--question-line\);[\s\S]*?--workbench-table-ink:\s*var\(--question-ink\);[\s\S]*?--workbench-table-soft:\s*var\(--question-soft\);/i,
)
assert.match(
  questionStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.question-management__editor-panel\s*\{[\s\S]*?width:\s*100vw;[\s\S]*?max-width:\s*100vw;/i,
)
assert.match(
  questionEditor,
  /<header class="question-management__editor-head">[\s\S]*?<div class="question-management__editor-copy">[\s\S]*?<h3>/i,
)
