<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkbenchFormDrawer from '../../shared/ui/WorkbenchFormDrawer.vue'

import type {
  MappingCandidate,
  MappingConfidenceLevel,
  MappingRecord,
  MappingResourceType,
} from '@/features/resource-center/workbench/mapping/model/mapping-workbench.types.ts'
import type { MountPreview } from '@/api/mount.ts'

const props = defineProps<{
  open: boolean
  record: MappingRecord | null
  mountPreview: MountPreview | null
  mountPreviewLoading: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'confirm-record'): void
  (event: 'ignore-record'): void
  (event: 'switch-primary', candidateId: string): void
  (event: 'load-preview'): void
}>()

const previewExpanded = ref(false)

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

const overallConfidenceLabel = computed(() => {
  if (!props.mountPreview?.overallConfidence) return ''
  const labels: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return labels[props.mountPreview.overallConfidence] || ''
})

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

function formatScore(score: number): string {
  return Math.round(score * 100) + '%'
}

function scoreClass(score: number): string {
  if (score >= 0.85) return 'is-high'
  if (score >= 0.6) return 'is-medium'
  return 'is-low'
}
</script>

<template>
  <WorkbenchFormDrawer
    :open="open && !!record"
    :title="record?.resourceTitle ?? '单条审核'"
    cancel-text="关闭"
    confirm-text="确认挂载"
    @close="emit('close')"
    @confirm="emit('confirm-record')"
  >
    <template #footer-extra>
      <button type="button" class="workbench-drawer-form__action-btn workbench-drawer-form__action-btn--ghost" @click="emit('ignore-record')">
        忽略本条
      </button>
    </template>

    <div v-if="record" class="mapping-management__editor-body">
      <p class="workbench-drawer-form__body-description">核对当前资源上下文，并确认最终知识点挂载结果。</p>

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

      <!-- Mount Preview (collapsible) -->
      <section class="mapping-management__mount-preview">
        <details :open="previewExpanded" @toggle="previewExpanded = ($event.target as HTMLDetailsElement).open">
          <summary @click.prevent="previewExpanded = !previewExpanded; if (previewExpanded) emit('load-preview')">
            AI 智能挂载分析
            <span v-if="mountPreview" class="mount-preview-badge" :class="scoreClass(mountPreview.knowledgePointMatches[0]?.fusionScore || 0)">
              {{ overallConfidenceLabel }}置信度
            </span>
          </summary>

          <div v-if="mountPreviewLoading" style="padding: 12px; text-align: center; color: oklch(0.5 0 0); font-size: 13px;">
            正在加载 AI 分析...
          </div>

          <div v-else-if="mountPreview" class="mapping-management__mount-decision-list">
            <p style="font-size: 12px; color: oklch(0.45 0 0); margin-bottom: 8px;">{{ mountPreview.summary }}</p>

            <div v-if="mountPreview.courseMatches.length > 0">
              <strong style="font-size: 12px; color: oklch(0.4 0 0);">课程匹配</strong>
              <div v-for="d in mountPreview.courseMatches" :key="'c-'+d.nodeId" class="mapping-management__mount-decision">
                <div class="mapping-management__mount-decision__head">
                  <span class="mapping-management__mount-decision__name">{{ d.nodeName }}</span>
                  <span class="mapping-management__mount-decision__score" :class="scoreClass(d.fusionScore)">{{ formatScore(d.fusionScore) }}</span>
                </div>
                <div class="mapping-management__mount-decision__meta">{{ d.topStrategy }} · {{ d.contributingStrategies.join(', ') }}</div>
              </div>
            </div>

            <div v-if="mountPreview.knowledgePointMatches.length > 0">
              <strong style="font-size: 12px; color: oklch(0.4 0 0);">知识点匹配</strong>
              <div v-for="d in mountPreview.knowledgePointMatches.slice(0, 5)" :key="'kp-'+d.nodeId" class="mapping-management__mount-decision">
                <div class="mapping-management__mount-decision__head">
                  <span class="mapping-management__mount-decision__name">{{ d.nodeName }}</span>
                  <span class="mapping-management__mount-decision__score" :class="scoreClass(d.fusionScore)">{{ formatScore(d.fusionScore) }}</span>
                </div>
                <div class="mapping-management__mount-decision__meta">
                  {{ d.mountPath }} · {{ d.topStrategy }}
                </div>
                <div v-if="d.evidence" class="mapping-management__mount-decision__evidence">{{ d.evidence }}</div>
              </div>
            </div>

            <div v-if="!mountPreview.courseMatches.length && !mountPreview.knowledgePointMatches.length"
              style="font-size: 12px; color: oklch(0.5 0 0); text-align: center; padding: 12px;">
              暂无匹配结果，建议人工判断
            </div>
          </div>

          <div v-else style="font-size: 12px; color: oklch(0.5 0 0); text-align: center; padding: 12px;">
            点击展开加载 AI 挂载分析
          </div>
        </details>
      </section>
    </div>
  </WorkbenchFormDrawer>
</template>
