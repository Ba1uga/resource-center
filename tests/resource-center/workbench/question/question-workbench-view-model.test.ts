import assert from 'node:assert/strict'

import { createQuestionWorkbenchRepository } from '../../../../src/features/resource-center/workbench/question/model/question-workbench.repository.ts'
import {
  applyQuestionStatusCardSelection,
  createDefaultQuestionQueryState,
  createQuestionWorkbenchViewModel,
  getQuestionChapterOptions,
  resolveQuestionPageAfterDeletion,
} from '../../../../src/features/resource-center/workbench/question/model/question-workbench.view-model.ts'

const repository = createQuestionWorkbenchRepository()
const defaultQuery = createDefaultQuestionQueryState()
const defaultResult = repository.listQuestions(defaultQuery)
const defaultViewModel = createQuestionWorkbenchViewModel({
  query: defaultQuery,
  result: defaultResult,
})

assert.equal(defaultQuery.page, 1)
assert.equal(defaultQuery.pageSize, 10)
assert.equal(defaultQuery.type, 'all')
assert.equal(defaultQuery.difficulty, 'all')
assert.equal(defaultQuery.status, 'all')
assert.equal(defaultQuery.sortBy, 'updatedAt')
assert.equal(defaultQuery.sortOrder, 'desc')

assert.equal(defaultViewModel.rows.length, 10)
assert.equal(defaultViewModel.records.length, 10)
assert.equal(defaultViewModel.pagination.total, 12)
assert.equal(defaultViewModel.pagination.pageCount, 2)
assert.equal(defaultViewModel.pagination.hasPrev, false)
assert.equal(defaultViewModel.pagination.hasNext, true)
assert.equal(defaultViewModel.summary.activeFilterCount, 0)
assert.equal(defaultResult.matchingPublishedTotal, 7)
assert.equal(defaultResult.matchingDraftTotal, 5)
assert.equal(defaultResult.matchingLatestUpdatedAt, '2026-04-10T15:20:00.000Z')
assert.equal(defaultViewModel.summary.matchingTotal, 12)
assert.equal(defaultViewModel.summary.draftTotal, 5)
assert.equal(defaultViewModel.summary.publishedTotal, 7)
assert.equal(defaultViewModel.summary.latestUpdatedAtLabel, '2026-04-10 15:20')
assert.match(defaultViewModel.summary.latestUpdatedHint, /最近更新/)
assert.equal(defaultViewModel.chapterOptions.length, 0)
assert.equal(defaultViewModel.chapterDisabled, true)
assert.deepEqual(
  defaultViewModel.subjectOptions.map((option) => option.id),
  ['', 'math', 'physics', 'it'],
)
assert.equal(defaultViewModel.rows[0]?.id, 'question-12')
assert.equal(defaultViewModel.rows[0]?.type, 'coding')
assert.equal(defaultViewModel.rows[0]?.status, 'published')
assert.ok((defaultViewModel.rows[0]?.typeLabel ?? '').length > 0)
assert.ok((defaultViewModel.rows[0]?.statusLabel ?? '').length > 0)
assert.equal(defaultViewModel.emptyState, null)

const filteredQuery = {
  ...defaultQuery,
  subjectId: 'math',
  chapterId: 'math-functions',
  type: 'single',
  difficulty: 'medium',
  status: 'published',
  keyword: '函数',
}
const filteredViewModel = createQuestionWorkbenchViewModel({
  query: filteredQuery,
  result: repository.listQuestions(filteredQuery),
})

assert.equal(filteredViewModel.rows.length, 1)
assert.equal(filteredViewModel.summary.activeFilterCount, 6)
assert.equal(filteredViewModel.rows[0]?.id, 'question-08')
assert.ok((filteredViewModel.rows[0]?.subjectLabel ?? '').length > 0)
assert.ok((filteredViewModel.rows[0]?.chapterLabel ?? '').length > 0)
assert.equal(filteredViewModel.summary.matchingTotal, 1)
assert.equal(filteredViewModel.summary.draftTotal, 0)
assert.equal(filteredViewModel.summary.publishedTotal, 1)
assert.equal(filteredViewModel.summary.latestUpdatedAtLabel, '2026-04-05 12:30')
assert.equal(filteredViewModel.chapterDisabled, false)
assert.deepEqual(
  filteredViewModel.chapterOptions.map((option) => option.id),
  ['math-functions', 'math-geometry'],
)

const secondPageQuery = {
  ...defaultQuery,
  page: 2,
}
const secondPageViewModel = createQuestionWorkbenchViewModel({
  query: secondPageQuery,
  result: repository.listQuestions(secondPageQuery),
})

assert.equal(secondPageViewModel.rows.length, 2)
assert.equal(secondPageViewModel.rows[0]?.id, 'question-02')
assert.equal(secondPageViewModel.rows[1]?.id, 'question-01')
assert.equal(secondPageViewModel.pagination.hasPrev, true)
assert.equal(secondPageViewModel.pagination.hasNext, false)

const noMatchQuery = {
  ...defaultQuery,
  keyword: 'non-existent-question-keyword',
}
const noMatchViewModel = createQuestionWorkbenchViewModel({
  query: noMatchQuery,
  result: repository.listQuestions(noMatchQuery),
})

assert.equal(noMatchViewModel.rows.length, 0)
assert.equal(noMatchViewModel.emptyState?.kind, 'filtered')
assert.equal(noMatchViewModel.summary.matchingTotal, 0)
assert.equal(noMatchViewModel.summary.draftTotal, 0)
assert.equal(noMatchViewModel.summary.publishedTotal, 0)
assert.equal(noMatchViewModel.summary.latestUpdatedAtLabel, '暂无更新')
assert.match(noMatchViewModel.summary.latestUpdatedHint, /当前筛选下还没有可展示的习题/)
assert.ok((noMatchViewModel.emptyState?.title ?? '').length > 0)

const statusScopedQuery = {
  ...defaultQuery,
  subjectId: 'it',
  status: 'draft',
}
const statusScopedViewModel = createQuestionWorkbenchViewModel({
  query: statusScopedQuery,
  result: repository.listQuestions(statusScopedQuery),
})

assert.equal(statusScopedViewModel.summary.matchingTotal, 2)
assert.equal(statusScopedViewModel.summary.draftTotal, 2)
assert.equal(statusScopedViewModel.summary.publishedTotal, 2)

const emptyRepository = createQuestionWorkbenchRepository({ seed: [] })
const emptyViewModel = createQuestionWorkbenchViewModel({
  query: defaultQuery,
  result: emptyRepository.listQuestions(defaultQuery),
})

assert.equal(emptyViewModel.rows.length, 0)
assert.equal(emptyViewModel.emptyState?.kind, 'empty')
assert.ok((emptyViewModel.emptyState?.description ?? '').length > 0)

assert.equal(getQuestionChapterOptions('math').length, 2)
assert.equal(getQuestionChapterOptions('').length, 0)
assert.equal(resolveQuestionPageAfterDeletion({ currentPage: 2, pageSize: 10, totalAfterDeletion: 10 }), 1)
assert.equal(resolveQuestionPageAfterDeletion({ currentPage: 1, pageSize: 10, totalAfterDeletion: 0 }), 1)

const draftSelectedQuery = applyQuestionStatusCardSelection(
  {
    ...defaultQuery,
    page: 2,
  },
  'draft',
)

assert.equal(draftSelectedQuery.status, 'draft')
assert.equal(draftSelectedQuery.page, 1)

const draftClearedQuery = applyQuestionStatusCardSelection(draftSelectedQuery, 'draft')

assert.equal(draftClearedQuery.status, 'all')
assert.equal(draftClearedQuery.page, 1)

const publishedSelectedQuery = applyQuestionStatusCardSelection(defaultQuery, 'published')

assert.equal(publishedSelectedQuery.status, 'published')
assert.equal(publishedSelectedQuery.page, 1)
