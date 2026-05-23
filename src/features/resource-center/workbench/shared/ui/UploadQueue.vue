<script setup lang="ts">
import type { UploadFileEntry } from '../model/upload.types.ts'

defineProps<{
  entries: UploadFileEntry[]
  uploading: boolean
}>()

const emit = defineEmits<{
  (event: 'remove', entryId: string): void
  (event: 'retry', entryId: string): void
}>()

function statusLabel(entry: UploadFileEntry): string {
  switch (entry.status) {
    case 'idle': return '等待上传'
    case 'init': return '准备中...'
    case 'uploading': return `${entry.progress}%`
    case 'success': return '已完成'
    case 'failed': return '失败'
  }
}
</script>

<template>
  <div v-if="entries.length > 0" class="upload-queue">
    <div
      v-for="entry in entries"
      :key="entry.id"
      class="upload-queue__item"
      :class="`is-${entry.status}`"
    >
      <div class="upload-queue__info">
        <div class="upload-queue__name-row">
          <svg class="upload-queue__file-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
          <span class="upload-queue__name" :title="entry.originName">{{ entry.originName }}</span>
          <span class="upload-queue__size">{{ entry.sizeLabel }}</span>
        </div>

        <div class="upload-queue__meta-row">
          <span class="upload-queue__status" :class="`is-${entry.status}`">
            <span v-if="entry.status === 'uploading'" class="upload-queue__spinner"></span>
            <span v-else-if="entry.status === 'success'" class="upload-queue__check">&#10003;</span>
            <span v-else-if="entry.status === 'failed'" class="upload-queue__cross">&#10007;</span>
            {{ statusLabel(entry) }}
          </span>

          <span v-if="entry.errorMessage" class="upload-queue__error">{{ entry.errorMessage }}</span>
        </div>

        <div v-if="entry.status === 'uploading'" class="upload-queue__progress-track">
          <div
            class="upload-queue__progress-fill"
            :style="{ width: entry.progress + '%' }"
          ></div>
        </div>
      </div>

      <div class="upload-queue__actions">
        <button
          v-if="entry.status === 'failed'"
          type="button"
          class="upload-queue__action-btn retry"
          title="重试"
          :disabled="uploading"
          @click="emit('retry', entry.id)"
        >
          重试
        </button>
        <button
          v-if="entry.status !== 'uploading'"
          type="button"
          class="upload-queue__action-btn remove"
          title="移除"
          @click="emit('remove', entry.id)"
        >
          移除
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.upload-queue__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid oklch(0.88 0.01 260);
  border-radius: 6px;
  background: oklch(0.99 0.002 260);
  transition: border-color 0.2s;
}

.upload-queue__item.is-uploading {
  border-color: oklch(0.6 0.15 240);
}

.upload-queue__item.is-success {
  border-color: oklch(0.6 0.15 150);
  background: oklch(0.97 0.03 150);
}

.upload-queue__item.is-failed {
  border-color: oklch(0.6 0.18 20);
  background: oklch(0.97 0.02 20);
}

.upload-queue__info {
  flex: 1;
  min-width: 0;
}

.upload-queue__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.upload-queue__file-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: oklch(0.5 0.02 260);
}

.upload-queue__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.upload-queue__size {
  font-size: 12px;
  color: oklch(0.5 0.02 260);
  flex-shrink: 0;
}

.upload-queue__meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.upload-queue__status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.upload-queue__status.is-uploading { color: oklch(0.5 0.15 240); }
.upload-queue__status.is-success { color: oklch(0.5 0.15 150); }
.upload-queue__status.is-failed { color: oklch(0.5 0.18 20); }
.upload-queue__status.is-idle { color: oklch(0.5 0.02 260); }
.upload-queue__status.is-init { color: oklch(0.5 0.05 260); }

.upload-queue__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid oklch(0.8 0.05 240);
  border-top-color: oklch(0.5 0.15 240);
  border-radius: 50%;
  animation: upload-spin 0.8s linear infinite;
}

@keyframes upload-spin {
  to {
    transform: rotate(360deg);
  }
}

.upload-queue__check { color: oklch(0.5 0.15 150); font-weight: 700; }
.upload-queue__cross { color: oklch(0.5 0.18 20); font-weight: 700; }

.upload-queue__error {
  font-size: 12px;
  color: oklch(0.5 0.18 20);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-queue__progress-track {
  width: 100%;
  height: 4px;
  margin-top: 6px;
  border-radius: 2px;
  background: oklch(0.9 0.02 260);
  overflow: hidden;
}

.upload-queue__progress-fill {
  height: 100%;
  background: oklch(0.5 0.15 240);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.upload-queue__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-items: flex-start;
  padding-top: 2px;
}

.upload-queue__action-btn {
  padding: 2px 8px;
  font-size: 12px;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  transition: opacity 0.15s;
}

.upload-queue__action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.upload-queue__action-btn.retry {
  color: oklch(0.5 0.15 240);
}

.upload-queue__action-btn.retry:hover:not(:disabled) {
  background: oklch(0.9 0.05 240);
}

.upload-queue__action-btn.remove {
  color: oklch(0.5 0.1 20);
}

.upload-queue__action-btn.remove:hover {
  background: oklch(0.95 0.02 20);
}
</style>
