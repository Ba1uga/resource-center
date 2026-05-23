<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import UploadDropzone from '../../shared/ui/UploadDropzone.vue'
import UploadQueue from '../../shared/ui/UploadQueue.vue'
import { useUploader } from '../../shared/model/use-uploader.ts'
import { formatFileSize } from '../../shared/model/upload.types.ts'

import type { VideoRecord } from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'
import WorkbenchDrawerHost from '../../shared/ui/WorkbenchDrawerHost.vue'

const processingStatusLabel: Record<string, string> = {
  uploading: '上传中',
  transcoding: '转码中',
  ready: '资源就绪',
  failed: '转码失败',
}

const publishStatusLabel: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  offline: '已下架',
}

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  record: VideoRecord | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'save-draft', data: VideoDrawerDraft): void
  (event: 'save-publish', data: VideoDrawerDraft): void
  (event: 'retry-upload'): void
}>()

export interface VideoDrawerDraft {
  title: string
  course: string
  chapter: string
  knowledgePoint: string
  videoAssetId: number | null
  videoFileName: string
  videoFileSizeLabel: string
  coverAssetId: number | null
  coverFileName: string
  coverFileSizeLabel: string
}

const sessionGroupToken = crypto.randomUUID()

const videoUploader = useUploader('video', {
  maxSizeBytes: 500 * 1024 * 1024,
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedExtensions: ['.mp4', '.webm', '.mov'],
}, sessionGroupToken)

const coverUploader = useUploader('video', {
  maxSizeBytes: 10 * 1024 * 1024,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp'],
}, sessionGroupToken)

const form = reactive({
  title: '',
  course: '',
  chapter: '',
  knowledgePoint: '',
})

const videoFileInfo = ref<{ assetId: number | null; fileName: string; sizeLabel: string } | null>(null)
const coverFileInfo = ref<{ assetId: number | null; fileName: string; sizeLabel: string } | null>(null)

const isUploading = computed(() => videoUploader.hasUploading() || coverUploader.hasUploading())

watch(
  () => [props.open, props.record],
  () => {
    if (props.open && props.record) {
      form.title = props.record.title ?? ''
      form.course = props.record.course ?? ''
      form.chapter = props.record.chapter ?? ''
      form.knowledgePoint = props.record.knowledgePoint ?? ''
    } else if (props.open && props.mode === 'create') {
      form.title = ''
      form.course = ''
      form.chapter = ''
      form.knowledgePoint = ''
      videoFileInfo.value = null
      coverFileInfo.value = null
    }
  },
  { immediate: true },
)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      videoUploader.clearAll()
      coverUploader.clearAll()
      videoFileInfo.value = null
      coverFileInfo.value = null
    }
  },
)

function onVideoFilesSelected(files: File[]) {
  videoUploader.addFiles(files)
}

function onCoverFilesSelected(files: File[]) {
  coverUploader.addFiles(files)
}

async function startPendingUploads() {
  for (const entry of videoUploader.entries.value) {
    if (entry.status === 'idle' || entry.status === 'failed') {
      await videoUploader.startUpload(entry.id)
    }
  }
  for (const entry of coverUploader.entries.value) {
    if (entry.status === 'idle' || entry.status === 'failed') {
      await coverUploader.startUpload(entry.id)
    }
  }
}

function syncUploadToDraft(): VideoDrawerDraft {
  const videoSuccess = videoUploader.successEntries()
  if (videoSuccess.length > 0) {
    const latest = videoSuccess[videoSuccess.length - 1]
    videoFileInfo.value = {
      assetId: latest.assetId,
      fileName: latest.originName,
      sizeLabel: formatFileSize(latest.sizeBytes),
    }
  }

  const coverSuccess = coverUploader.successEntries()
  if (coverSuccess.length > 0) {
    const latest = coverSuccess[coverSuccess.length - 1]
    coverFileInfo.value = {
      assetId: latest.assetId,
      fileName: latest.originName,
      sizeLabel: formatFileSize(latest.sizeBytes),
    }
  }

  return {
    title: form.title.trim(),
    course: form.course.trim(),
    chapter: form.chapter.trim(),
    knowledgePoint: form.knowledgePoint.trim(),
    videoAssetId: videoFileInfo.value?.assetId ?? null,
    videoFileName: videoFileInfo.value?.fileName ?? '',
    videoFileSizeLabel: videoFileInfo.value?.sizeLabel ?? '',
    coverAssetId: coverFileInfo.value?.assetId ?? null,
    coverFileName: coverFileInfo.value?.fileName ?? '',
    coverFileSizeLabel: coverFileInfo.value?.sizeLabel ?? '',
  }
}

async function handleSaveDraft() {
  await startPendingUploads()
  const data = syncUploadToDraft()
  emit('save-draft', data)
}

async function handleSavePublish() {
  await startPendingUploads()
  const data = syncUploadToDraft()
  emit('save-publish', data)
}

function handleRetry() {
  emit('retry-upload')
}
</script>

<template>
  <WorkbenchDrawerHost :open="open" @close="emit('close')">
    <template #header>
      <div class="video-management__drawer" aria-label="视频编辑抽屉">
        <header class="video-management__drawer-head">
          <div>
            <h3>{{ mode === 'create' ? '上传视频' : '编辑视频' }}</h3>
            <p>{{ record?.id ?? '新建视频记录' }}</p>
          </div>

          <button type="button" class="video-management__icon-button" aria-label="关闭抽屉" @click="emit('close')">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="iconPaths.x"></path>
            </svg>
          </button>
        </header>
      </div>
    </template>

    <template #default>
      <div class="video-management__drawer">
        <div class="video-management__drawer-body">
          <section class="video-management__drawer-section">
            <h4>主视频</h4>

            <UploadDropzone
              accept=".mp4,.webm,.mov"
              @files-selected="onVideoFilesSelected"
            />
            <UploadQueue
              :entries="videoUploader.entries.value"
              :uploading="videoUploader.hasUploading()"
              @remove="videoUploader.removeEntry"
              @retry="videoUploader.retryEntry"
            />
            <p v-if="videoFileInfo?.fileName" class="video-management__upload-info">
              已上传视频：{{ videoFileInfo.fileName }} ({{ videoFileInfo.sizeLabel }})
            </p>
          </section>

          <section class="video-management__drawer-section">
            <h4>封面图</h4>

            <UploadDropzone
              accept=".png,.jpg,.jpeg,.webp"
              @files-selected="onCoverFilesSelected"
            />
            <UploadQueue
              :entries="coverUploader.entries.value"
              :uploading="coverUploader.hasUploading()"
              @remove="coverUploader.removeEntry"
              @retry="coverUploader.retryEntry"
            />
            <p v-if="coverFileInfo?.fileName" class="video-management__upload-info">
              已上传封面：{{ coverFileInfo.fileName }} ({{ coverFileInfo.sizeLabel }})
            </p>
          </section>

          <section class="video-management__drawer-section">
            <h4>视频信息</h4>

            <div class="video-management__drawer-grid">
              <label>
                <span>标题</span>
                <input v-model="form.title" type="text" placeholder="输入视频标题" />
              </label>
              <label>
                <span>所属课程</span>
                <input v-model="form.course" type="text" placeholder="例如：计算机网络" />
              </label>
              <label>
                <span>所属章节</span>
                <input v-model="form.chapter" type="text" placeholder="例如：第1章" />
              </label>
              <label>
                <span>关联知识点</span>
                <input v-model="form.knowledgePoint" type="text" placeholder="例如：TCP三次握手" />
              </label>
            </div>
          </section>

          <section v-if="record" class="video-management__drawer-section">
            <h4>状态信息</h4>

            <div class="video-management__drawer-grid">
              <label>
                <span>发布状态</span>
                <input type="text" :value="publishStatusLabel[record.publishStatus] ?? record.publishStatus" readonly />
              </label>
              <label>
                <span>处理状态</span>
                <input
                  type="text"
                  :value="processingStatusLabel[videoUploader.hasUploading() ? 'uploading' : record.processingStatus] ?? record.processingStatus"
                  readonly
                />
              </label>
              <label v-if="record.fileSize">
                <span>文件大小</span>
                <input type="text" :value="record.fileSize" readonly />
              </label>
              <label v-if="record.duration">
                <span>时长</span>
                <input type="text" :value="record.duration" readonly />
              </label>
            </div>
          </section>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="video-management__drawer">
        <footer class="video-management__drawer-footer">
          <button type="button" @click="emit('close')">取消</button>
          <button
            type="button"
            :disabled="isUploading"
            @click="handleSaveDraft"
          >
            {{ mode === 'create' ? '保存草稿' : '保存修改' }}
          </button>
          <button
            type="button"
            class="primary"
            :disabled="isUploading"
            @click="handleSavePublish"
          >
            {{ mode === 'create' ? '开始上传并发布' : '保存并发布' }}
          </button>
          <button
            v-if="record?.processingStatus === 'failed'"
            type="button"
            class="danger"
            @click="handleRetry"
          >
            重新上传视频
          </button>
        </footer>
      </div>
    </template>
  </WorkbenchDrawerHost>
</template>
