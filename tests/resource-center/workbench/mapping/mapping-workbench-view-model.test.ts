import assert from 'node:assert/strict'

import { mappingRecords } from '../../../../src/features/resource-center/workbench/mapping/model/mapping-workbench.fixtures.ts'
import {
  createDefaultMappingFilterState,
  createMappingWorkbenchViewModel,
  resolveSelectedOrFirstCandidate,
  resolveMappingPageAfterMutation,
} from '../../../../src/features/resource-center/workbench/mapping/model/mapping-workbench.view-model.ts'

const defaultFilters = createDefaultMappingFilterState()

assert.deepEqual(defaultFilters, {
  keyword: '',
  resourceType: 'all',
  course: 'all',
  chapter: 'all',
  batchId: 'all',
  reviewStatus: 'all',
  confidenceLevel: 'all',
  overviewStatus: 'all',
})

const defaultViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
})

assert.equal(defaultViewModel.rows.length, mappingRecords.length)
assert.equal(defaultViewModel.summaryCards.length, 6)
assert.equal(defaultViewModel.resourceTypeOptions[0]?.value, 'all')
assert.equal(defaultViewModel.batchOptions[0]?.value, 'all')
assert.equal(defaultViewModel.pagination.total, mappingRecords.length)
assert.equal(defaultViewModel.rows[0]?.selectedCandidateId, null)
assert.equal(defaultViewModel.rows[1]?.selectedCandidateId, 'cand-1002-a')
assert.equal(defaultViewModel.rows[1]?.candidates?.length, 2)
assert.equal(defaultViewModel.rows[1]?.candidates?.[0]?.knowledgePointName, '路由算法')
assert.equal(defaultViewModel.rows[1]?.selectedCandidate?.id, 'cand-1002-a')
assert.equal(defaultViewModel.rows[1]?.overviewStatus, 'matched')
assert.equal(defaultViewModel.rows[2]?.overviewStatus, 'confirmed')
assert.equal(defaultViewModel.rows[4]?.overviewStatus, 'failed')
assert.equal(resolveSelectedOrFirstCandidate(mappingRecords[0])?.id, 'cand-1001-a')
assert.equal(defaultViewModel.emptyState, null)
assert.deepEqual(
  defaultViewModel.summaryCards.map((item) => [item.key, item.value, item.kind, item.interactive, item.active]),
  [
    ['pending', '1', 'filter', true, false],
    ['matched', '1', 'filter', true, false],
    ['manual-review', '1', 'filter', true, false],
    ['confirmed', '1', 'filter', true, false],
    ['failed', '1', 'filter', true, false],
    ['low-confidence', '2', 'filter', true, false],
  ],
)

const lowConfidenceViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    confidenceLevel: 'low',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(lowConfidenceViewModel.rows.every((row) => row.confidenceLevel === 'low'), true)
assert.deepEqual(
  lowConfidenceViewModel.summaryCards.map((item) => [item.key, item.value, item.active]),
  [
    ['pending', '0', false],
    ['matched', '0', false],
    ['manual-review', '1', false],
    ['confirmed', '0', false],
    ['failed', '1', false],
    ['low-confidence', '2', true],
  ],
)

const keywordViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    keyword: '编程实验',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(keywordViewModel.rows.length, 1)
assert.equal(keywordViewModel.rows[0]?.resourceTitle, '编程实验录屏')
assert.equal(keywordViewModel.rows[0]?.primaryKnowledgePoint, null)

const overviewFilteredViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    overviewStatus: 'failed',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(overviewFilteredViewModel.rows.length, 1)
assert.equal(overviewFilteredViewModel.rows[0]?.id, 'map-1005')
assert.equal(overviewFilteredViewModel.rows[0]?.primaryKnowledgePoint, null)
assert.deepEqual(
  overviewFilteredViewModel.summaryCards.map((item) => [item.key, item.value, item.active]),
  [
    ['pending', '1', false],
    ['matched', '1', false],
    ['manual-review', '1', false],
    ['confirmed', '1', false],
    ['failed', '1', true],
    ['low-confidence', '2', false],
  ],
)

const courseScopedViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    course: '计算机网络',
  },
  page: 1,
  pageSize: 10,
})

assert.deepEqual(
  courseScopedViewModel.chapterOptions.map((option) => option.value),
  ['all', '第1章 体系结构', '第4章 路由选择', '第3章 网络层基础'],
)

const confirmedLowConfidenceViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords.map((record) =>
    record.id === 'map-1004'
      ? {
          ...record,
          reviewStatus: 'approved',
          selectedCandidateId: 'cand-1004-a',
          primaryKnowledgePoint: '编程实验',
        }
      : record,
  ),
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
})

assert.equal(
  confirmedLowConfidenceViewModel.rows.find((row) => row.id === 'map-1004')?.overviewStatus,
  'confirmed',
)

const filteredEmptyViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: {
    ...defaultFilters,
    keyword: 'missing-keyword',
  },
  page: 1,
  pageSize: 10,
})

assert.equal(filteredEmptyViewModel.rows.length, 0)
assert.equal(filteredEmptyViewModel.emptyState?.kind, 'filtered')
assert.equal(filteredEmptyViewModel.pagination.page, 1)

const initialEmptyViewModel = createMappingWorkbenchViewModel({
  records: [],
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
})

assert.equal(initialEmptyViewModel.rows.length, 0)
assert.equal(initialEmptyViewModel.emptyState?.kind, 'initial')
assert.equal(initialEmptyViewModel.pagination.page, 1)

const clampedPageViewModel = createMappingWorkbenchViewModel({
  records: mappingRecords,
  filters: defaultFilters,
  page: 99,
  pageSize: 2,
})

assert.equal(clampedPageViewModel.pagination.page, 3)
assert.equal(clampedPageViewModel.pagination.pageCount, 3)
assert.equal(clampedPageViewModel.rows.length, 1)
assert.equal(clampedPageViewModel.rows[0]?.id, 'map-1005')

assert.equal(resolveMappingPageAfterMutation({ currentPage: 3, pageSize: 10, totalAfterMutation: 18 }), 2)
assert.equal(resolveMappingPageAfterMutation({ currentPage: 1, pageSize: 10, totalAfterMutation: 0 }), 1)
