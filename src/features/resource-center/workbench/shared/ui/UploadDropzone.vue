<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  disabled?: boolean
  multiple?: boolean
  accept?: string
}>()

const emit = defineEmits<{
  (event: 'files-selected', files: File[]): void
}>()

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  if (props.disabled || !event.dataTransfer?.files.length) return
  emit('files-selected', Array.from(event.dataTransfer.files))
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    emit('files-selected', Array.from(input.files))
    input.value = ''
  }
}

function openFilePicker() {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}
</script>

<template>
  <div
    class="upload-dropzone"
    :class="{ 'is-dragging': isDragging, 'is-disabled': disabled }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="openFilePicker"
  >
    <input
      ref="fileInputRef"
      type="file"
      :multiple="multiple"
      :accept="accept"
      class="upload-dropzone__input"
      @change="onFileInputChange"
    />
    <div class="upload-dropzone__content">
      <svg class="upload-dropzone__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16L12 4M12 4L8 8M12 4L16 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 14V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </svg>
      <p class="upload-dropzone__text">
        <strong>拖拽文件到此处</strong>
        <span>或点击选择文件</span>
      </p>
      <p v-if="accept" class="upload-dropzone__hint">支持格式：{{ accept }}</p>
    </div>
  </div>
</template>

<style scoped>
.upload-dropzone {
  position: relative;
  border: 2px dashed oklch(0.7 0.02 260);
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  background: oklch(0.98 0.005 260);
}

.upload-dropzone:hover {
  border-color: oklch(0.55 0.18 260);
  background: oklch(0.95 0.02 260);
}

.upload-dropzone.is-dragging {
  border-color: oklch(0.5 0.2 260);
  background: oklch(0.92 0.05 260);
}

.upload-dropzone.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-dropzone__input {
  display: none;
}

.upload-dropzone__content {
  pointer-events: none;
}

.upload-dropzone__icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 8px;
  color: oklch(0.5 0.15 260);
}

.upload-dropzone__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: oklch(0.35 0.02 260);
}

.upload-dropzone__text strong {
  font-weight: 600;
}

.upload-dropzone__hint {
  margin-top: 8px;
  font-size: 12px;
  color: oklch(0.55 0.02 260);
}
</style>
