<script setup lang="ts">
import ModuleWorkbenchShell from './ModuleWorkbenchShell.vue'

import type { WorkbenchSectionMeta } from '@/features/resource-center/index.ts'

defineProps<{
  section: WorkbenchSectionMeta
}>()
</script>

<template>
  <ModuleWorkbenchShell
    :kicker="section.kicker"
    :title="section.title"
    :description="section.description"
    :status="section.status"
  >
    <div class="module-workbench-placeholder">
      <strong>{{ section.placeholderTitle }}</strong>
      <p>{{ section.placeholderDescription }}</p>
    </div>
  </ModuleWorkbenchShell>
</template>
