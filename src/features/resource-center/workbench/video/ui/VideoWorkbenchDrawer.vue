<script setup lang="ts">
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'
import type { VideoRecord } from '@/features/resource-center/workbench/video/model/video-workbench.types.ts'
import WorkbenchDrawerHost from '../../shared/ui/WorkbenchDrawerHost.vue'

defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  record: VideoRecord | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'save-draft'): void
  (event: 'save-publish'): void
  (event: 'retry-upload'): void
}>()
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
            <h4>资源文件</h4>

            <div class="video-management__upload-panel">
              <strong>主视频上传区</strong>
              <p>支持拖拽上传、重新上传和转码反馈展示。</p>
            </div>

            <div class="video-management__upload-panel">
              <strong>封面上传区</strong>
              <p>单独维护封面，避免替换视频时影响整条记录。</p>
            </div>
          </section>

          <section class="video-management__drawer-section">
            <h4>视频信息</h4>

            <div class="video-management__drawer-grid">
              <label>
                <span>标题</span>
                <input type="text" :value="record?.title ?? ''" />
              </label>
              <label>
                <span>所属课程</span>
                <input type="text" :value="record?.course ?? ''" />
              </label>
              <label>
                <span>所属章节</span>
                <input type="text" :value="record?.chapter ?? ''" />
              </label>
              <label>
                <span>关联知识点</span>
                <input type="text" :value="record?.knowledgePoint ?? ''" />
              </label>
            </div>
          </section>

          <section class="video-management__drawer-section">
            <h4>发布设置</h4>

            <div class="video-management__drawer-grid">
              <label>
                <span>发布状态</span>
                <input type="text" :value="record?.publishStatus ?? 'draft'" />
              </label>
              <label>
                <span>资源状态</span>
                <input type="text" :value="record?.processingStatus ?? 'uploading'" />
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
          <button type="button" @click="emit('save-draft')">
            {{ mode === 'create' ? '保存草稿' : '保存修改' }}
          </button>
          <button type="button" class="primary" @click="emit('save-publish')">
            {{ mode === 'create' ? '开始上传并发布' : '保存并发布' }}
          </button>
          <button
            v-if="record?.processingStatus === 'failed'"
            type="button"
            class="danger"
            @click="emit('retry-upload')"
          >
            重新上传视频
          </button>
        </footer>
      </div>
    </template>
  </WorkbenchDrawerHost>
</template>
