<script setup lang="ts">
import { computed } from 'vue'

import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'

import type {
  MappingEmptyState,
  MappingPaginationState,
  MappingWorkbenchRow,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

const props = defineProps<{
  rows: MappingWorkbenchRow[]
  emptyState: MappingEmptyState | null
  selectedIds: string[]
  allVisibleSelected: boolean
  pagination: MappingPaginationState
}>()

const emit = defineEmits<{
  (event: 'toggle-row', id: string): void
  (event: 'toggle-visible'): void
  (event: 'review', id: string): void
  (event: 'page-change', page: number): void
}>()

const selectedIdSet = computed(() => new Set(props.selectedIds))
</script>

<template>
  <div class="mapping-management__table-scroll">
    <table v-if="rows.length > 0" class="mapping-management-table">
      <thead>
        <tr>
          <th class="mapping-management-table__selection-column">
            <input
              type="checkbox"
              :checked="allVisibleSelected"
              :disabled="rows.length === 0"
              aria-label="全选当前页记录"
              @change="emit('toggle-visible')"
            />
          </th>
          <th>资源信息</th>
          <th>主知识点</th>
          <th>候选 / 辅助数量</th>
          <th>置信度</th>
          <th>状态</th>
          <th>风险标签</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td data-label="选择" class="mapping-management-table__selection-column">
            <input
              type="checkbox"
              :checked="selectedIdSet.has(row.id)"
              :aria-label="`选择 ${row.resourceTitle}`"
              @change="emit('toggle-row', row.id)"
            />
          </td>
          <td data-label="资源信息">
            <div class="mapping-management-table__resource">
              <strong>{{ row.resourceTitle }}</strong>
              <span>{{ row.resourceTypeLabel }} · {{ row.courseName }}</span>
              <span>{{ row.chapterName }} · {{ row.batchLabel }}</span>
            </div>
          </td>
          <td data-label="主知识点">
            <div class="mapping-management-table__knowledge">
              <strong>{{ row.primaryKnowledgePoint ?? row.selectedCandidate?.knowledgePointName ?? '待确认主挂载点' }}</strong>
              <span v-if="row.selectedCandidate">{{ row.selectedCandidate.note }}</span>
              <span v-else>当前尚未锁定主知识点，需进入审核流程继续处理。</span>
            </div>
          </td>
          <td data-label="候选 / 辅助数量" class="mapping-management-table__numeric-cell">
            <div class="mapping-management-table__counts">
              <strong>{{ row.candidates.length }} 个候选</strong>
              <span>{{ Math.max(row.candidates.length - (row.selectedCandidate ? 1 : 0), 0) }} 个辅助候选</span>
            </div>
          </td>
          <td data-label="置信度">
            <div class="mapping-management-table__confidence">
              <span class="mapping-management__pill" :class="`is-${row.confidenceLevel}`">
                {{ row.confidenceLevelLabel }} 置信度
              </span>
              <span>{{ row.selectedCandidate?.matchedBy === 'manual' ? '人工确认候选' : 'AI 推荐候选' }}</span>
            </div>
          </td>
          <td data-label="状态">
            <div class="mapping-management-table__statuses">
              <span class="mapping-management__pill is-overview">{{ row.overviewStatusLabel }}</span>
              <span class="mapping-management__pill is-review">{{ row.reviewStatusLabel }}</span>
            </div>
          </td>
          <td data-label="风险标签">
            <div class="mapping-management-table__risk-tags">
              <span v-for="tag in row.riskTags" :key="tag" class="mapping-management__tag">
                {{ tag }}
              </span>
              <span v-if="row.riskTags.length === 0" class="mapping-management-table__muted">无显著风险</span>
            </div>
          </td>
          <td data-label="操作">
            <button type="button" class="mapping-management-table__review-button" @click="emit('review', row.id)">审核</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="mapping-management-table__empty">
      <strong>{{ emptyState?.title ?? '暂无映射记录' }}</strong>
      <p>{{ emptyState?.description ?? '请稍后再试。' }}</p>
    </div>
  </div>

  <footer class="mapping-management__pagination">
    <WorkbenchTablePagination :pagination="pagination" show-quick-jumper @page-change="emit('page-change', $event)" />
  </footer>
</template>
