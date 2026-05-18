<script setup lang="ts">
import { computed } from 'vue'
import WorkbenchDrawerHost from '../../shared/ui/WorkbenchDrawerHost.vue'

import type {
  MappingCandidate,
  MappingConfidenceLevel,
  MappingRecord,
  MappingResourceType,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'

const props = defineProps<{
  open: boolean
  record: MappingRecord | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'confirm-record'): void
  (event: 'ignore-record'): void
  (event: 'switch-primary', candidateId: string): void
}>()

const resourceTypeLabels: Record<MappingResourceType, string> = {
  article: '图文',
  courseware: '课件',
  question: '习题',
  video: '录屏',
  excerpt: '节选',
}

const confidenceLevelLabels: Record<MappingConfidenceLevel, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const primaryCandidate = computed(() => {
  if (!props.record?.selectedCandidateId) {
    return null
  }

  return props.record.candidates.find((candidate) => candidate.id === props.record?.selectedCandidateId) ?? null
})

const currentPrimaryKnowledgePoint = computed(
  () => primaryCandidate.value?.knowledgePointName ?? props.record?.primaryKnowledgePoint ?? '待确认主挂载点',
)

const currentPrimarySummary = computed(() => {
  if (primaryCandidate.value) {
    return buildCandidateMeta(primaryCandidate.value)
  }

  return '当前尚未锁定主挂载点，可从下方候选中切换。'
})

function buildCandidateMeta(candidate: MappingCandidate): string {
  const matchedByLabel = candidate.matchedBy === 'manual' ? '人工确认' : 'AI 推荐'
  return `${matchedByLabel} · ${confidenceLevelLabels[candidate.confidenceLevel]}置信度`
}
</script>

<template>
  <WorkbenchDrawerHost :open="open && !!record" @close="emit('close')">
    <template #header>
      <header class="mapping-management__editor-head">
        <div class="mapping-management__editor-copy">
          <p>单条审核</p>
          <h3>{{ record?.resourceTitle }}</h3>
          <p>核对当前资源上下文，并确认最终知识点挂载结果。</p>
        </div>

        <button type="button" class="mapping-management__bulk-button" @click="emit('close')">关闭</button>
      </header>
    </template>

    <template #default>
      <div v-if="record" class="mapping-management__editor-body">
        <section class="mapping-management__editor-group">
          <span class="mapping-management__editor-label">资源上下文</span>
          <strong>{{ record.resourceTitle }}</strong>
          <p>{{ resourceTypeLabels[record.resourceType] }} · {{ record.courseName }}</p>
          <p>{{ record.chapterName }} · {{ record.batchLabel }}</p>
        </section>

        <section class="mapping-management__editor-group">
          <span class="mapping-management__editor-label">当前主知识点</span>
          <strong>{{ currentPrimaryKnowledgePoint }}</strong>
          <p>{{ currentPrimarySummary }}</p>
        </section>

        <section class="mapping-management__editor-group">
          <span class="mapping-management__editor-label">候选知识点</span>
          <div class="mapping-management__candidate-list">
            <button
              v-for="candidate in record.candidates"
              :key="candidate.id"
              type="button"
              class="mapping-management__candidate-option"
              :class="{ 'is-active': candidate.id === record.selectedCandidateId }"
              :aria-pressed="candidate.id === record.selectedCandidateId ? 'true' : 'false'"
              @click="emit('switch-primary', candidate.id)"
            >
              <strong>{{ candidate.knowledgePointName }}</strong>
              <span>{{ buildCandidateMeta(candidate) }}</span>
              <span>{{ candidate.note }}</span>
            </button>
          </div>
        </section>
      </div>
    </template>

    <template #footer>
      <footer class="mapping-management__editor-footer">
        <button type="button" class="mapping-management__bulk-button" @click="emit('ignore-record')">忽略本条</button>
        <button type="button" class="mapping-management__bulk-button is-primary" @click="emit('confirm-record')">
          确认挂载
        </button>
      </footer>
    </template>
  </WorkbenchDrawerHost>
</template>
