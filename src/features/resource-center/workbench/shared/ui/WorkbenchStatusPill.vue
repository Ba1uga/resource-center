<script setup lang="ts">
import '../styles/workbench-status-pill.css'

import { ref } from 'vue'

interface WorkbenchStatusPillProps {
  label: string
  message: string
  severity?: 'error' | 'warning' | 'info'
}

withDefaults(defineProps<WorkbenchStatusPillProps>(), {
  severity: 'error',
})

const visible = ref(false)
let dismissTimer: ReturnType<typeof setTimeout> | undefined

function show() {
  visible.value = true
  if (dismissTimer) {
    clearTimeout(dismissTimer)
  }
  dismissTimer = setTimeout(() => {
    visible.value = false
    dismissTimer = undefined
  }, 3200)
}

function onPointerEnter() {
  visible.value = true
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = undefined
  }
}

function onPointerLeave() {
  visible.value = false
}

function toggle() {
  visible.value = !visible.value
}

defineExpose({ show })
</script>

<template>
  <div
    class="workbench-status-pill__anchor"
    :class="`workbench-status-pill__anchor--${severity}`"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <button
      class="workbench-status-pill__button"
      type="button"
      @click="toggle"
    >
      {{ label }}
    </button>
    <div v-if="visible" class="workbench-status-pill__popover">
      {{ message }}
    </div>
  </div>
</template>
