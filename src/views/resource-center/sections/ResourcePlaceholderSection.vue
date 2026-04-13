<script setup lang="ts">
import type { NavigationItem } from '@/features/resource-center/navigation/model/navigation.types'

defineProps<{
  activeNavigation?: NavigationItem
}>()
</script>

<template>
  <section class="module-placeholder">
    <article class="panel module-placeholder-card">
      <div class="panel-head">
        <div>
          <p class="panel-kicker">模块视图</p>
          <h3>{{ activeNavigation?.label }}</h3>
        </div>
        <span class="panel-pill">待展开</span>
      </div>

      <p class="module-placeholder-copy">
        当前先将“资源总览”作为主入口。后续这里可以承接对应模块的详情页、列表页或工作台视图。
      </p>
    </article>
  </section>
</template>
