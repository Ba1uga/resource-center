<script setup lang="ts">
import '../styles/workbench-drawer-form.css'

import WorkbenchDrawerHost from './WorkbenchDrawerHost.vue'

withDefaults(
  defineProps<{
    open: boolean
    width?: 'md' | 'lg' | 'xl'
    title: string
    closeButtonLabel?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    confirmDisabled?: boolean
    hideFooter?: boolean
    closeOnBackdrop?: boolean
  }>(),
  {
    width: 'md',
    closeButtonLabel: '关闭抽屉',
    confirmText: '保存',
    cancelText: '取消',
    loading: false,
    confirmDisabled: false,
    hideFooter: false,
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'confirm'): void
}>()
</script>

<template>
  <WorkbenchDrawerHost
    :open="open"
    :width="width"
    :close-on-backdrop="closeOnBackdrop"
    @close="emit('close')"
  >
    <template #header>
      <div class="workbench-drawer-form__head">
        <h3 class="workbench-drawer-form__head-title">{{ title }}</h3>
        <button
          type="button"
          class="workbench-drawer-form__head-close"
          :aria-label="closeButtonLabel"
          @click="emit('close')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
    </template>

    <template #default>
      <div class="workbench-drawer-form__body">
        <slot />
      </div>
    </template>

    <template v-if="!hideFooter" #footer>
      <div class="workbench-drawer-form__actions">
        <slot name="footer-extra" />
        <button
          type="button"
          class="workbench-drawer-form__action-btn workbench-drawer-form__action-btn--ghost"
          :disabled="loading"
          @click="emit('close')"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="workbench-drawer-form__action-btn workbench-drawer-form__action-btn--solid"
          :class="{ 'workbench-drawer-form__action-btn--loading': loading }"
          :disabled="loading || confirmDisabled"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </WorkbenchDrawerHost>
</template>
