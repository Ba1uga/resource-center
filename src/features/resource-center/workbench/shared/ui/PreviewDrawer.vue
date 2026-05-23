<script setup lang="ts">
import { computed } from 'vue'
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import WorkbenchDrawerHost from './WorkbenchDrawerHost.vue'

const props = defineProps<{
  open: boolean
  assetId: number | null
  originName: string
  mimeType: string
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

type Renderer = 'video' | 'pdf' | 'image' | 'unsupported'

const renderer = computed<Renderer>(() => {
  if (!props.mimeType) return 'unsupported'
  if (props.mimeType.startsWith('video/')) return 'video'
  if (props.mimeType === 'application/pdf') return 'pdf'
  if (props.mimeType.startsWith('image/')) return 'image'
  return 'unsupported'
})

const streamUrl = computed(() =>
  props.assetId != null ? `/api/upload/stream/${props.assetId}` : ''
)

const downloadUrl = computed(() => streamUrl.value)
</script>

<template>
  <WorkbenchDrawerHost :open="open" width="xl" @close="emit('close')">
    <template #header>
      <div class="preview-drawer__head">
        <div class="preview-drawer__head-info">
          <h3 class="preview-drawer__head-title">资源预览</h3>
          <p class="preview-drawer__head-filename">{{ originName || '未命名文件' }}</p>
        </div>
        <button type="button" class="preview-drawer__head-close" aria-label="关闭预览" @click="emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path :d="iconPaths.x" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </button>
      </div>
    </template>

    <div class="preview-drawer__body">
      <!-- Video -->
      <div v-if="renderer === 'video'" class="preview-drawer__media">
        <video :src="streamUrl" controls autoplay class="preview-drawer__video">
          您的浏览器不支持视频播放。
        </video>
      </div>

      <!-- PDF -->
      <iframe v-else-if="renderer === 'pdf'" :src="streamUrl" class="preview-drawer__iframe" />

      <!-- Image -->
      <div v-else-if="renderer === 'image'" class="preview-drawer__media">
        <img :src="streamUrl" :alt="originName" class="preview-drawer__image" />
      </div>

      <!-- Unsupported -->
      <div v-else class="preview-drawer__unsupported">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="iconPaths.document" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <h4>暂不支持预览</h4>
        <p>{{ originName }}</p>
        <p class="preview-drawer__unsupported-hint">{{ mimeType || '未知格式' }} 无法在浏览器中直接预览</p>
        <a :href="downloadUrl" :download="originName" class="preview-drawer__download-btn">
          下载文件
        </a>
      </div>
    </div>
  </WorkbenchDrawerHost>
</template>

<style scoped>
.preview-drawer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid oklch(0.88 0.01 260);
}

.preview-drawer__head-info {
  min-width: 0;
}

.preview-drawer__head-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.preview-drawer__head-filename {
  font-size: 13px;
  color: oklch(0.5 0.02 260);
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-drawer__head-close {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  color: oklch(0.45 0.02 260);
  flex-shrink: 0;
}

.preview-drawer__head-close:hover {
  background: oklch(0.95 0.01 260);
}

.preview-drawer__head-close svg {
  width: 20px;
  height: 20px;
}

.preview-drawer__body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0.12 0.01 260);
}

.preview-drawer__media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-drawer__video {
  max-width: 100%;
  max-height: 100%;
  outline: none;
}

.preview-drawer__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-drawer__iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-drawer__unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  color: oklch(0.6 0.02 260);
}

.preview-drawer__unsupported svg {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: oklch(0.7 0.02 260);
}

.preview-drawer__unsupported h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  color: oklch(0.35 0.02 260);
}

.preview-drawer__unsupported p {
  font-size: 13px;
  margin: 0;
}

.preview-drawer__unsupported-hint {
  margin-top: 4px !important;
  color: oklch(0.55 0.02 260);
}

.preview-drawer__download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 8px 20px;
  border: 1px solid oklch(0.5 0.15 260);
  border-radius: 8px;
  color: oklch(0.5 0.15 260);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s;
}

.preview-drawer__download-btn:hover {
  background: oklch(0.95 0.05 260);
}
</style>
