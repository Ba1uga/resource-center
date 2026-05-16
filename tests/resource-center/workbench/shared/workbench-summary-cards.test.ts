import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import {
  createWorkbenchSummaryCardRows,
  isWorkbenchSummaryFilterCard,
  type WorkbenchSummaryCard,
} from '../../../../src/features/resource-center/workbench/shared/model/workbench-summary-cards.ts'

const componentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchSummaryCards.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-summary-cards.css',
  import.meta.url,
)

assert.equal(existsSync(componentUrl), true, 'WorkbenchSummaryCards.vue must exist')
assert.equal(existsSync(stylesUrl), true, 'workbench-summary-cards.css must exist')

const componentContent = readFileSync(componentUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

const cards: WorkbenchSummaryCard[] = [
  { key: 'all', kind: 'filter', label: '全部', value: '24', hint: '全部资源', active: true, interactive: true },
  { key: 'draft', kind: 'filter', label: '草稿', value: '8', hint: '待完善', active: false, interactive: true },
  { key: 'published', kind: 'filter', label: '已发布', value: '12', hint: '已上架', active: false, interactive: true },
  { key: 'recent', kind: 'info', label: '最近更新', value: '2026-05-16', hint: '最近 24 小时', active: false, interactive: false },
  { key: 'owner', kind: 'info', label: '责任人', value: '课程组 A', hint: '当前批次', active: false, interactive: false },
]

const rows = createWorkbenchSummaryCardRows(cards)
assert.equal(rows.length, 2)
assert.deepEqual(
  rows.map((row) => row.map((item) => item.key)),
  [
    ['all', 'draft', 'published'],
    ['recent', 'owner'],
  ],
)

assert.equal(isWorkbenchSummaryFilterCard(cards[0]!), true)
assert.equal(isWorkbenchSummaryFilterCard(cards[3]!), false)
assert.equal(cards.every((item) => typeof item.active === 'boolean'), true)
assert.equal(cards.every((item) => typeof item.interactive === 'boolean'), true)

assert.ok(componentContent.includes("import '../styles/workbench-summary-cards.css'"))
assert.ok(componentContent.includes('const rows = computed(() => createWorkbenchSummaryCardRows(props.items))'))
assert.equal(
  componentContent.includes('const rows = createWorkbenchSummaryCardRows(props.items)'),
  false,
)
assert.ok(componentContent.includes("const emit = defineEmits<{"))
assert.ok(componentContent.includes("(event: 'select', key: string): void"))
assert.ok(componentContent.includes("function handleSelect(item: WorkbenchSummaryCard)"))
assert.ok(componentContent.includes("if (!item.interactive || !isWorkbenchSummaryFilterCard(item))"))
assert.ok(componentContent.includes("emit('select', item.key)"))
assert.ok(componentContent.includes('class="workbench-summary-cards"'))
assert.ok(componentContent.includes('class="workbench-summary-cards__row"'))
assert.ok(componentContent.includes('class="workbench-summary-cards__card"'))
assert.ok(componentContent.includes('class="workbench-summary-cards__card-heading"'))
assert.ok(componentContent.includes('v-if="isWorkbenchSummaryFilterCard(item)"'))
assert.ok(componentContent.includes('{{ item.label }}：{{ item.value }}'))
assert.ok(componentContent.includes('class="workbench-summary-cards__card-hint"'))
assert.ok(componentContent.includes(":disabled=\"!item.interactive\""))
assert.ok(componentContent.includes("'is-disabled': !item.interactive"))
assert.ok(componentContent.includes("{{ item.interactive ? '筛选' : '不可筛选' }}"))
assert.ok(
  componentContent.includes(
    ':aria-pressed="item.interactive ? (item.active ? \'true\' : \'false\') : undefined"',
  ),
)
assert.ok(componentContent.includes('@click="handleSelect(item)"'))
assert.ok(componentContent.includes('<article'))

assert.match(
  stylesContent,
  /\.workbench-summary-cards\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/i,
)
assert.match(
  stylesContent,
  /\.workbench-summary-cards__row\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(180px,\s*1fr\)\);/i,
)
assert.match(
  stylesContent,
  /\.workbench-summary-cards__card\s*\{[\s\S]*?min-height:\s*88px;[\s\S]*?padding:\s*14px 16px;[\s\S]*?border-radius:\s*18px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-summary-cards__card\.is-filter\s*\{[\s\S]*?cursor:\s*pointer;/i,
)
assert.match(
  stylesContent,
  /\.workbench-summary-cards__card\.is-filter\.is-active\s*\{[\s\S]*?border-color:\s*var\(--workbench-summary-card-active-border/i,
)
assert.match(
  stylesContent,
  /\.workbench-summary-cards__card\.is-disabled\s*\{[\s\S]*?cursor:\s*not-allowed;[\s\S]*?opacity:\s*0\.72;/i,
)
assert.match(
  stylesContent,
  /\.workbench-summary-cards__card-heading\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*baseline;[\s\S]*?gap:\s*6px;/i,
)
assert.doesNotMatch(
  stylesContent,
  /\.workbench-summary-cards__card\.is-info[\s\S]*?cursor:\s*pointer;/i,
)
