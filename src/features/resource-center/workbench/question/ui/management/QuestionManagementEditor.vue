<script setup lang="ts">
import QuestionChoiceEditor from './QuestionChoiceEditor.vue'
import QuestionCodingEditor from './QuestionCodingEditor.vue'
import QuestionShortAnswerEditor from './QuestionShortAnswerEditor.vue'

import type {
  QuestionDifficulty,
  QuestionEditorDraft,
  QuestionEditorMode,
  QuestionSelectOption,
  QuestionStatus,
  QuestionType,
  QuestionValidationErrors,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

const props = defineProps<{
  open: boolean
  mode: QuestionEditorMode
  draft: QuestionEditorDraft
  errors: QuestionValidationErrors
  subjectOptions: QuestionSelectOption[]
  chapterOptions: QuestionSelectOption[]
  typeLocked: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'save'): void
  (event: 'patch', patch: Partial<QuestionEditorDraft>): void
  (event: 'set-type', type: QuestionType): void
}>()

const typeOptions: Array<{ value: QuestionType; label: string }> = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'short', label: '简答题' },
  { value: 'coding', label: '编程题' },
]

const difficultyOptions: Array<{ value: QuestionDifficulty; label: string }> = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

const statusOptions: Array<{ value: QuestionStatus; label: string }> = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
]

function patchField<K extends keyof QuestionEditorDraft>(key: K, value: QuestionEditorDraft[K]) {
  emit('patch', { [key]: value } as Partial<QuestionEditorDraft>)
}

function handleTypeChange(event: Event) {
  emit('set-type', (event.target as HTMLSelectElement).value as QuestionType)
}

function handleSubjectChange(event: Event) {
  patchField('subjectId', (event.target as HTMLSelectElement).value)
}

function handleChapterChange(event: Event) {
  patchField('chapterId', (event.target as HTMLSelectElement).value)
}

function handleDifficultyChange(event: Event) {
  patchField('difficulty', (event.target as HTMLSelectElement).value as QuestionDifficulty)
}

function handleStatusChange(event: Event) {
  patchField('status', (event.target as HTMLSelectElement).value as QuestionStatus)
}
</script>

<template>
  <div v-if="open" class="question-management__editor-shell" role="dialog" aria-modal="true" aria-label="习题编辑器">
    <button class="question-management__editor-backdrop" type="button" aria-label="关闭习题编辑器" @click="emit('close')"></button>

    <section class="question-management__editor-panel">
      <header class="question-management__editor-head">
        <div class="question-management__editor-copy">
          <p class="panel-kicker">统一编辑器</p>
          <h3>
            {{
              mode === 'create'
                ? '新增习题'
                : mode === 'copy'
                  ? '复制习题'
                  : '编辑习题'
            }}
          </h3>
          <p>公共字段统一维护，题型专属字段按当前题型动态展开。</p>
        </div>

        <button class="question-button question-button--ghost" type="button" @click="emit('close')">关闭</button>
      </header>

      <div class="question-management__editor-scroll">
        <section class="question-management-editor__section question-management-editor__section--grid">
          <label class="question-management-editor__field">
            <span>题型</span>
            <select :value="draft.type" :disabled="typeLocked" @change="handleTypeChange">
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <small v-if="typeLocked" class="question-management-editor__hint">题型在编辑模式下不可切换</small>
          </label>

          <label class="question-management-editor__field">
            <span>学科</span>
            <select :value="draft.subjectId" @change="handleSubjectChange">
              <option v-for="option in subjectOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
            <small v-if="errors.subjectId" class="question-management-editor__error">{{ errors.subjectId }}</small>
          </label>

          <label class="question-management-editor__field">
            <span>章节</span>
            <select :value="draft.chapterId" @change="handleChapterChange">
              <option v-for="option in chapterOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
            <small v-if="errors.chapterId" class="question-management-editor__error">{{ errors.chapterId }}</small>
          </label>

          <label class="question-management-editor__field">
            <span>难度</span>
            <select :value="draft.difficulty" @change="handleDifficultyChange">
              <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="question-management-editor__field">
            <span>状态</span>
            <select :value="draft.status" @change="handleStatusChange">
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </section>

        <section class="question-management-editor__section">
          <label class="question-management-editor__field">
            <span>题干</span>
            <textarea :value="draft.stem" rows="3" @input="patchField('stem', ($event.target as HTMLTextAreaElement).value)" />
            <small v-if="errors.stem" class="question-management-editor__error">{{ errors.stem }}</small>
          </label>

          <div class="question-management-editor__split">
            <label class="question-management-editor__field">
              <span>知识点</span>
              <input
                :value="draft.knowledgePoint"
                type="text"
                placeholder="例如：一次函数"
                @input="patchField('knowledgePoint', ($event.target as HTMLInputElement).value)"
              />
            </label>

            <label class="question-management-editor__field">
              <span>解析</span>
              <textarea
                :value="draft.analysis"
                rows="3"
                placeholder="补充解题思路或教学备注"
                @input="patchField('analysis', ($event.target as HTMLTextAreaElement).value)"
              />
            </label>
          </div>
        </section>

        <QuestionChoiceEditor
          v-if="draft.type === 'single' || draft.type === 'multiple'"
          :type="draft.type"
          :options="draft.choiceOptions"
          :error="errors.choiceOptions"
          @update:options="patchField('choiceOptions', $event)"
        />

        <QuestionShortAnswerEditor
          v-else-if="draft.type === 'short'"
          :answer="draft.shortAnswer"
          :scoring-points="draft.scoringPoints"
          :answer-error="errors.shortAnswer"
          :points-error="errors.scoringPoints"
          @update:answer="patchField('shortAnswer', $event)"
          @update:scoring-points="patchField('scoringPoints', $event)"
        />

        <QuestionCodingEditor
          v-else-if="draft.type === 'coding'"
          :prompt="draft.codingPrompt"
          :input-description="draft.codingInputDescription"
          :output-description="draft.codingOutputDescription"
          :examples="draft.codingExamples"
          :test-cases="draft.codingTestCases"
          :reference-solution="draft.codingReferenceSolution"
          :errors="errors"
          @update:prompt="patchField('codingPrompt', $event)"
          @update:input-description="patchField('codingInputDescription', $event)"
          @update:output-description="patchField('codingOutputDescription', $event)"
          @update:examples="patchField('codingExamples', $event)"
          @update:test-cases="patchField('codingTestCases', $event)"
          @update:reference-solution="patchField('codingReferenceSolution', $event)"
        />
      </div>

      <footer class="question-management__editor-foot">
        <button class="question-button question-button--ghost" type="button" @click="emit('close')">取消</button>
        <button class="question-button question-button--solid" type="button" @click="emit('save')">保存习题</button>
      </footer>
    </section>
  </div>
</template>
