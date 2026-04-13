<script setup lang="ts">
import ModuleWorkbenchShell from '@/features/resource-center/workbench/shared/ui/ModuleWorkbenchShell.vue'

import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

const props = defineProps<{
  section: WorkbenchSectionMeta
}>()
</script>

<template>
  <ModuleWorkbenchShell :title="props.section.title">
    <div class="module-workbench-placeholder">
      <strong>{{ props.section.placeholderTitle }}</strong>
      <p>{{ props.section.placeholderDescription }}</p>
    </div>
  </ModuleWorkbenchShell>
</template>
