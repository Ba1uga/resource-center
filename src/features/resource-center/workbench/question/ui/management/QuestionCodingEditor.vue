<script setup lang="ts">
import {
  createEmptyCodingExample,
  createEmptyCodingTestCase,
} from '@/features/resource-center/workbench/question/model/question-workbench.editor.ts'

import type {
  CodingExample,
  CodingTestCase,
  QuestionValidationErrors,
} from '@/features/resource-center/workbench/question/model/question-workbench.types.ts'

const props = defineProps<{
  prompt: string
  inputDescription: string
  outputDescription: string
  examples: CodingExample[]
  testCases: CodingTestCase[]
  referenceSolution: string
  errors: QuestionValidationErrors
}>()

const emit = defineEmits<{
  (event: 'update:prompt', value: string): void
  (event: 'update:input-description', value: string): void
  (event: 'update:output-description', value: string): void
  (event: 'update:examples', value: CodingExample[]): void
  (event: 'update:test-cases', value: CodingTestCase[]): void
  (event: 'update:reference-solution', value: string): void
}>()

function updateExample(index: number, key: keyof CodingExample, value: string) {
  emit(
    'update:examples',
    props.examples.map((example, exampleIndex) =>
      exampleIndex === index ? { ...example, [key]: value } : { ...example },
    ),
  )
}

function updateTestCase(index: number, key: keyof CodingTestCase, value: string) {
  emit(
    'update:test-cases',
    props.testCases.map((testCase, testCaseIndex) =>
      testCaseIndex === index ? { ...testCase, [key]: value } : { ...testCase },
    ),
  )
}

function addExample() {
  emit('update:examples', [...props.examples.map((example) => ({ ...example })), createEmptyCodingExample(props.examples.length + 1)])
}

function addTestCase() {
  emit('update:test-cases', [...props.testCases.map((testCase) => ({ ...testCase })), createEmptyCodingTestCase(props.testCases.length + 1)])
}

function removeExample(index: number) {
  emit(
    'update:examples',
    props.examples.filter((_, exampleIndex) => exampleIndex !== index),
  )
}

function removeTestCase(index: number) {
  emit(
    'update:test-cases',
    props.testCases.filter((_, testCaseIndex) => testCaseIndex !== index),
  )
}
</script>

<template>
  <section class="question-management-editor__section">
    <label class="question-management-editor__field">
      <span>题目描述</span>
      <textarea :value="prompt" rows="4" @input="emit('update:prompt', ($event.target as HTMLTextAreaElement).value)" />
      <small v-if="errors.codingPrompt" class="question-management-editor__error">{{ errors.codingPrompt }}</small>
    </label>

    <div class="question-management-editor__split">
      <label class="question-management-editor__field">
        <span>输入说明</span>
        <textarea
          :value="inputDescription"
          rows="3"
          @input="emit('update:input-description', ($event.target as HTMLTextAreaElement).value)"
        />
        <small v-if="errors.codingInputDescription" class="question-management-editor__error">
          {{ errors.codingInputDescription }}
        </small>
      </label>

      <label class="question-management-editor__field">
        <span>输出说明</span>
        <textarea
          :value="outputDescription"
          rows="3"
          @input="emit('update:output-description', ($event.target as HTMLTextAreaElement).value)"
        />
        <small v-if="errors.codingOutputDescription" class="question-management-editor__error">
          {{ errors.codingOutputDescription }}
        </small>
      </label>
    </div>

    <div class="question-management-editor__section-head">
      <div>
        <strong>示例</strong>
        <p>至少保留一组，用于讲清输入输出格式。</p>
      </div>

      <button class="question-button question-button--ghost" type="button" @click="addExample">添加示例</button>
    </div>

    <div class="question-coding-editor">
      <article v-for="(example, index) in examples" :key="example.id" class="question-coding-editor__card">
        <header>
          <strong>示例 {{ index + 1 }}</strong>
          <button class="question-text-button danger" type="button" :disabled="examples.length <= 1" @click="removeExample(index)">
            删除
          </button>
        </header>

        <label class="question-management-editor__field">
          <span>输入</span>
          <textarea :value="example.input" rows="3" @input="updateExample(index, 'input', ($event.target as HTMLTextAreaElement).value)" />
        </label>

        <label class="question-management-editor__field">
          <span>输出</span>
          <textarea :value="example.output" rows="3" @input="updateExample(index, 'output', ($event.target as HTMLTextAreaElement).value)" />
        </label>

        <label class="question-management-editor__field">
          <span>说明</span>
          <textarea
            :value="example.explanation"
            rows="2"
            @input="updateExample(index, 'explanation', ($event.target as HTMLTextAreaElement).value)"
          />
        </label>
      </article>
    </div>

    <small v-if="errors.codingExamples" class="question-management-editor__error">{{ errors.codingExamples }}</small>

    <div class="question-management-editor__section-head">
      <div>
        <strong>测试用例</strong>
        <p>首版只维护输入输出，不接判题器。</p>
      </div>

      <button class="question-button question-button--ghost" type="button" @click="addTestCase">添加测试用例</button>
    </div>

    <div class="question-coding-editor">
      <article v-for="(testCase, index) in testCases" :key="testCase.id" class="question-coding-editor__card">
        <header>
          <strong>测试 {{ index + 1 }}</strong>
          <button class="question-text-button danger" type="button" :disabled="testCases.length <= 1" @click="removeTestCase(index)">
            删除
          </button>
        </header>

        <label class="question-management-editor__field">
          <span>输入</span>
          <textarea
            :value="testCase.input"
            rows="3"
            @input="updateTestCase(index, 'input', ($event.target as HTMLTextAreaElement).value)"
          />
        </label>

        <label class="question-management-editor__field">
          <span>输出</span>
          <textarea
            :value="testCase.output"
            rows="3"
            @input="updateTestCase(index, 'output', ($event.target as HTMLTextAreaElement).value)"
          />
        </label>
      </article>
    </div>

    <small v-if="errors.codingTestCases" class="question-management-editor__error">{{ errors.codingTestCases }}</small>

    <label class="question-management-editor__field">
      <span>参考解法</span>
      <textarea
        :value="referenceSolution"
        rows="4"
        @input="emit('update:reference-solution', ($event.target as HTMLTextAreaElement).value)"
      />
      <small v-if="errors.codingReferenceSolution" class="question-management-editor__error">
        {{ errors.codingReferenceSolution }}
      </small>
    </label>
  </section>
</template>
