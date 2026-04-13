<script setup lang="ts">
import type { QuestionChoiceOption, QuestionChoiceType } from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

const props = defineProps<{
  type: QuestionChoiceType
  options: QuestionChoiceOption[]
  error?: string
}>()

const emit = defineEmits<{
  (event: 'update:options', value: QuestionChoiceOption[]): void
}>()

function updateOptionText(index: number, text: string) {
  emit(
    'update:options',
    props.options.map((option, optionIndex) => (optionIndex === index ? { ...option, text } : { ...option })),
  )
}

function toggleCorrect(index: number) {
  if (props.type === 'single') {
    emit(
      'update:options',
      props.options.map((option, optionIndex) => ({
        ...option,
        correct: optionIndex === index,
      })),
    )
    return
  }

  emit(
    'update:options',
    props.options.map((option, optionIndex) =>
      optionIndex === index ? { ...option, correct: !option.correct } : { ...option },
    ),
  )
}

function addOption() {
  if (props.options.length >= 8) {
    return
  }

  emit('update:options', [
    ...props.options.map((option) => ({ ...option })),
    {
      key: String.fromCharCode(65 + props.options.length),
      text: '',
      correct: false,
    },
  ])
}

function removeOption(index: number) {
  if (props.options.length <= 2) {
    return
  }

  const nextOptions = props.options
    .filter((_, optionIndex) => optionIndex !== index)
    .map((option, optionIndex) => ({
      ...option,
      key: String.fromCharCode(65 + optionIndex),
    }))

  if (props.type === 'single' && nextOptions[0] && !nextOptions.some((option) => option.correct)) {
    nextOptions[0] = {
      ...nextOptions[0],
      correct: true,
    }
  }

  emit('update:options', nextOptions)
}
</script>

<template>
  <section class="question-management-editor__section">
    <div class="question-management-editor__section-head">
      <div>
        <strong>{{ type === 'single' ? '选择题选项' : '多选题选项' }}</strong>
        <p>默认 4 个选项，支持扩展到 8 个，选项标识会自动重排。</p>
      </div>

      <button class="question-button question-button--ghost" type="button" :disabled="options.length >= 8" @click="addOption">
        添加选项
      </button>
    </div>

    <div class="question-choice-editor">
      <article v-for="(option, index) in options" :key="option.key" class="question-choice-editor__row">
        <label class="question-choice-editor__toggle">
          <input
            :checked="option.correct"
            :type="type === 'single' ? 'radio' : 'checkbox'"
            :name="type === 'single' ? 'question-choice-radio' : undefined"
            @change="toggleCorrect(index)"
          />
          <span>{{ option.key }}</span>
        </label>

        <input
          class="question-choice-editor__input"
          :value="option.text"
          type="text"
          :placeholder="`请输入选项 ${option.key}`"
          @input="updateOptionText(index, ($event.target as HTMLInputElement).value)"
        />

        <button class="question-text-button danger" type="button" :disabled="options.length <= 2" @click="removeOption(index)">
          删除
        </button>
      </article>
    </div>

    <small v-if="error" class="question-management-editor__error">{{ error }}</small>
  </section>
</template>
