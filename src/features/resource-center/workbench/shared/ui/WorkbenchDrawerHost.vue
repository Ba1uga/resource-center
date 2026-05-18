<script setup lang="ts">
import '../styles/workbench-drawer-host.css'

withDefaults(
  defineProps<{
    open: boolean
    width?: 'md' | 'lg' | 'xl'
    closeOnBackdrop?: boolean
  }>(),
  {
    width: 'lg',
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="workbench-drawer-host">
      <button
        type="button"
        class="workbench-drawer-host__backdrop"
        aria-label="关闭抽屉"
        @click="closeOnBackdrop ? emit('close') : undefined"
      />

      <aside class="workbench-drawer-host__panel" :class="`is-${width}`">
        <slot name="header" />
        <div class="workbench-drawer-host__body">
          <slot />
        </div>
        <slot name="footer" />
      </aside>
    </div>
  </teleport>
</template>
