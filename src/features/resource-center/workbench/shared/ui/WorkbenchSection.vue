<script setup lang="ts">
import CoursewareWorkbenchSection from '../../courseware/ui/CoursewareWorkbenchSection.vue'
import MappingWorkbenchSection from '../../mapping/ui/MappingWorkbenchSection.vue'
import OutlineWorkbenchSection from '../../outline/ui/OutlineWorkbenchSection.vue'
import QuestionWorkbenchSection from '../../question/ui/QuestionWorkbenchSection.vue'
import TextbookWorkbenchSection from '../../textbook/ui/TextbookWorkbenchSection.vue'
import VideoWorkbenchSection from '../../video/ui/VideoWorkbenchSection.vue'

import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

defineProps<{
  section: WorkbenchSectionMeta
  currentTeacherName: string
}>()
</script>

<template>
  <section class="workbench-section-host">
    <OutlineWorkbenchSection
      v-if="section.key === 'outline'"
      :section="section"
      :current-teacher-name="currentTeacherName"
      class="workbench-section-host__content"
    />
    <TextbookWorkbenchSection
      v-else-if="section.key === 'textbook'"
      :section="section"
      class="workbench-section-host__content"
    />
    <QuestionWorkbenchSection
      v-else-if="section.key === 'question'"
      :section="section"
      class="workbench-section-host__content"
    />
    <CoursewareWorkbenchSection
      v-else-if="section.key === 'courseware'"
      :section="section"
      class="workbench-section-host__content"
    />
    <VideoWorkbenchSection
      v-else-if="section.key === 'video'"
      :section="section"
      class="workbench-section-host__content"
    />
    <MappingWorkbenchSection
      v-else
      :section="section"
      class="workbench-section-host__content"
    />
  </section>
</template>

<style scoped>
.workbench-section-host {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
}

.workbench-section-host__content {
  width: 100%;
  height: 100%;
  min-height: 100%;
  display: grid;
  align-self: stretch;
}
</style>
