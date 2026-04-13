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
assert.equal(questionSection.includes('<ModuleWorkbenchShell'), false)
assert.equal(questionSection.includes(':kicker="props.section.kicker"'), false)
assert.equal(questionSection.includes(':description="props.section.description"'), false)
assert.equal(questionSection.includes('status='), false)
assert.ok(questionSection.includes('const summaryCards = computed(() => ['))
assert.ok(questionSection.includes('class="question-management workbench-surface"'))
assert.ok(questionSection.includes('class="question-management__controls"'))
assert.ok(questionSection.includes('class="question-management__feedback"'))
assert.ok(questionSection.includes('class="question-management__summary"'))
assert.ok(questionSection.includes('class="question-management__summary-card"'))
assert.ok(questionSection.includes('class="question-management__toolbar"'))
assert.ok(questionSection.includes('class="question-management__table-shell"'))
assert.ok(questionSection.includes('class="question-management__table-scroll"'))
assert.ok(questionSection.includes('<QuestionManagementFilters'))
assert.ok(questionSection.includes('<QuestionManagementTable'))
assert.ok(questionSection.includes('<QuestionManagementPagination'))
assert.ok(questionSection.includes('<QuestionManagementEditor'))
assert.ok(questionSection.includes('question-management__editor-shell'))
assert.ok(questionSection.includes('handleCreate'))
assert.ok(questionSection.includes('handleCopy'))
assert.ok(questionSection.includes('handleDelete'))
assert.ok(questionSection.includes("value: String(viewModel.value.summary.matchingTotal)"))
assert.ok(questionSection.includes("value: String(viewModel.value.summary.publishedTotal)"))
assert.ok(questionSection.includes('viewModel.value.summary.latestUpdatedAtLabel'))
assert.equal(questionSection.includes('class="question-management__body"'), false)
assert.equal(questionSection.includes('question-card'), false)
assert.equal(questionSection.includes('question-assistant'), false)
assert.equal(questionSection.includes('role="tablist"'), false)
assert.equal(questionSection.includes('createQuestionHighlightSegments'), false)

assert.ok(filtersContent.includes('class="question-management-filters__search-field"'))
assert.ok(filtersContent.includes('class="question-management-filters__select-field"'))
assert.ok(filtersContent.includes('question-management-filters__query-button'))
assert.ok(filtersContent.includes('question-management-filters__create-button'))
assert.equal(filtersContent.includes('question-management-filters__grid'), false)

assert.equal(tableContent.includes('class="question-management-table-shell"'), false)
assert.ok(tableContent.includes('<table v-if="rows.length > 0" class="question-management-table">'))

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
  /\.question-management\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*?height:\s*100%;[\s\S]*?gap:\s*16px;[\s\S]*?overflow:\s*hidden;/i,
)
assert.match(
  questionStyles,
  /\.question-management__controls\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*16px;/i,
)
assert.match(
  questionStyles,
  /\.question-management__summary-card\s*\{[\s\S]*?min-height:\s*88px;[\s\S]*?padding:\s*14px 16px;[\s\S]*?border-radius:\s*18px;/i,
)
assert.match(
  questionStyles,
  /\.question-management__toolbar\s*\{[\s\S]*?grid-template-columns:[\s\S]*?align-items:\s*stretch;/i,
)
assert.match(
  questionStyles,
  /\.question-management__table-shell\s*\{[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\)\s*auto;[\s\S]*?border-radius:\s*18px;/i,
)
assert.match(
  questionStyles,
  /\.question-management__table-scroll\s*\{[\s\S]*?overflow:\s*auto;/i,
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
  /\.question-management-table\s*\{[\s\S]*?width:\s*100%;[\s\S]*?border-collapse:\s*separate;/i,
)
assert.match(
  questionStyles,
  /\.question-management-table\s+thead\s+th,\s*[\s\S]*?\.question-management-table\s+tbody\s+td\s*\{[\s\S]*?padding:\s*18px 16px;/i,
)
assert.match(
  questionStyles,
  /\.question-management-table\s+thead\s+th\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;/i,
)
assert.match(
  questionStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.question-management__editor-panel\s*\{[\s\S]*?width:\s*100vw;[\s\S]*?max-width:\s*100vw;/i,
)
assert.match(
  questionEditor,
  /<header class="question-management__editor-head">[\s\S]*?<div class="question-management__editor-copy">[\s\S]*?<h3>/i,
)
