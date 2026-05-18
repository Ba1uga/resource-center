<script setup lang="ts">
import '../styles/workbench-data-view.css'

withDefaults(
  defineProps<{
    density?: 'comfortable' | 'compact'
    mobileMode?: 'auto' | 'table' | 'cards'
    hasSelection?: boolean
    selectedCount?: number
    loading?: boolean
  }>(),
  {
    density: 'comfortable',
    mobileMode: 'auto',
    hasSelection: false,
    selectedCount: 0,
    loading: false,
  },
)
</script>

<template>
  <section
    class="workbench-data-view workbench-surface"
    :class="{ 'is-compact': density === 'compact', 'is-loading': loading }"
  >
    <div class="workbench-data-view__controls">
      <slot name="summary" />
      <slot name="feedback" />
      <slot name="toolbar" />
    </div>

    <div class="workbench-data-view__body">
      <div v-if="$slots.bulk && selectedCount > 0" class="workbench-data-view__bulk">
        <slot name="bulk" />
      </div>
      <div class="workbench-data-view__table-frame">
        <div class="workbench-data-view__table">
          <slot name="table" />
        </div>
        <div class="workbench-data-view__pagination">
          <slot name="pagination" />
        </div>
      </div>
    </div>

    <div class="workbench-data-view__drawer">
      <slot name="drawer" />
    </div>
  </section>
</template>
