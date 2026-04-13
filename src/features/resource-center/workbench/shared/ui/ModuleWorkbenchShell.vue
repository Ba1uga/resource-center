<script setup lang="ts">
import '../styles/module-workbench-shell.css'

defineProps<{
  title: string
}>()
</script>

<template>
  <section class="module-workbench-shell workbench-surface">
    <h2 class="module-workbench-shell__title">{{ title }}</h2>
    <slot />
  </section>
</template>
