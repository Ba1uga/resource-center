<script setup lang="ts">
defineProps<{
  answer: string
  scoringPoints: string[]
  answerError?: string
  pointsError?: string
}>()

const emit = defineEmits<{
  (event: 'update:answer', value: string): void
  (event: 'update:scoring-points', value: string[]): void
}>()

function updatePoint(index: number, value: string, scoringPoints: string[]) {
  emit(
    'update:scoring-points',
    scoringPoints.map((point, pointIndex) => (pointIndex === index ? value : point)),
  )
}

function addPoint(scoringPoints: string[]) {
  emit('update:scoring-points', [...scoringPoints, ''])
}

function removePoint(index: number, scoringPoints: string[]) {
  emit(
    'update:scoring-points',
    scoringPoints.filter((_, pointIndex) => pointIndex !== index),
  )
}
</script>

<template>
  <section class="question-management-editor__section">
    <label class="question-management-editor__field">
      <span>参考答案</span>
      <textarea :value="answer" rows="4" @input="emit('update:answer', ($event.target as HTMLTextAreaElement).value)" />
      <small v-if="answerError" class="question-management-editor__error">{{ answerError }}</small>
    </label>

    <div class="question-management-editor__section-head">
      <div>
        <strong>评分要点</strong>
        <p>按点拆分，便于后续做教研标注与评分规则维护。</p>
      </div>

      <button class="question-button question-button--ghost" type="button" @click="addPoint(scoringPoints)">添加要点</button>
    </div>

    <div class="question-short-editor">
      <div v-for="(point, index) in scoringPoints" :key="`scoring-point-${index}`" class="question-short-editor__row">
        <input
          class="question-short-editor__input"
          :value="point"
          type="text"
          :placeholder="`评分要点 ${index + 1}`"
          @input="updatePoint(index, ($event.target as HTMLInputElement).value, scoringPoints)"
        />

        <button class="question-text-button danger" type="button" :disabled="scoringPoints.length <= 1" @click="removePoint(index, scoringPoints)">
          删除
        </button>
      </div>
    </div>

    <small v-if="pointsError" class="question-management-editor__error">{{ pointsError }}</small>
  </section>
</template>
