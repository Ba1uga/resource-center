<script setup lang="ts">
import WorkbenchTable from '../../shared/ui/WorkbenchTable.vue'

import type {
  MappingEmptyState,
  MappingWorkbenchRow,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

defineProps<{
  rows: MappingWorkbenchRow[]
  emptyState: MappingEmptyState | null
  selectedIds: string[]
  allVisibleSelected: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle-row', id: string): void
  (event: 'toggle-visible'): void
  (event: 'review', id: string): void
}>()
</script>

<template>
  <WorkbenchTable
    :rows="rows"
    :columns="[
      { key: 'resource', title: '资源信息', mobileLabel: '资源信息' },
      { key: 'knowledge', title: '主知识点', mobileLabel: '主知识点' },
      { key: 'counts', title: '候选 / 辅助数量', mobileLabel: '候选 / 辅助数量' },
      { key: 'confidence', title: '置信度', mobileLabel: '置信度' },
      { key: 'statuses', title: '状态', mobileLabel: '状态' },
      { key: 'risk-tags', title: '风险标签', mobileLabel: '风险标签' },
      { key: 'actions', title: '操作', mobileLabel: '操作' },
    ]"
    row-key="id"
    selectable
    :selected-row-keys="selectedIds"
    :all-visible-selected="allVisibleSelected"
    :empty-state="emptyState"
    @toggle-row="emit('toggle-row', $event.id)"
    @toggle-all-visible="emit('toggle-visible')"
  >
    <template #cell-resource="{ row }">
      <div class="mapping-management-table__resource">
        <strong>{{ row.resourceTitle }}</strong>
        <span>{{ row.resourceTypeLabel }} · {{ row.courseName }}</span>
        <span>{{ row.chapterName }} · {{ row.batchLabel }}</span>
      </div>
    </template>

    <template #cell-knowledge="{ row }">
      <div class="mapping-management-table__knowledge">
        <strong>{{ row.primaryKnowledgePoint ?? row.selectedCandidate?.knowledgePointName ?? '待确认主挂载点' }}</strong>
        <span v-if="row.selectedCandidate">{{ row.selectedCandidate.note }}</span>
        <span v-else>当前尚未锁定主知识点，需进入审核流程继续处理。</span>
      </div>
    </template>

    <template #cell-counts="{ row }">
      <div class="mapping-management-table__counts">
        <strong>{{ row.candidates.length }} 个候选</strong>
        <span>{{ Math.max(row.candidates.length - (row.selectedCandidate ? 1 : 0), 0) }} 个辅助候选</span>
      </div>
    </template>

    <template #cell-confidence="{ row }">
      <div class="mapping-management-table__confidence">
        <span class="mapping-management__pill" :class="`is-${row.confidenceLevel}`">
          {{ row.confidenceLevelLabel }} 置信度
        </span>
        <span>{{ row.selectedCandidate?.matchedBy === 'manual' ? '人工确认候选' : 'AI 推荐候选' }}</span>
      </div>
    </template>

    <template #cell-statuses="{ row }">
      <div class="mapping-management-table__statuses">
        <span class="mapping-management__pill is-overview">{{ row.overviewStatusLabel }}</span>
        <span class="mapping-management__pill is-review">{{ row.reviewStatusLabel }}</span>
      </div>
    </template>

    <template #cell-risk-tags="{ row }">
      <div class="mapping-management-table__risk-tags">
        <span v-for="tag in row.riskTags" :key="tag" class="mapping-management__tag">
          {{ tag }}
        </span>
        <span v-if="row.riskTags.length === 0" class="mapping-management-table__muted">无显著风险</span>
      </div>
    </template>

    <template #cell-actions="{ row }">
      <button type="button" class="mapping-management-table__review-button" @click="emit('review', row.id)">审核</button>
    </template>
  </WorkbenchTable>
</template>
