<script setup lang="ts">
import './module-workbench-shell.css'

defineProps<{
  kicker: string;
  title: string;
  description: string;
  status: string;
}>()
</script>

<template>
  <section class="module-workbench-shell workbench-surface">
    <header class="module-workbench-shell__head">
      <div class="module-workbench-shell__copy">
        <p class="panel-kicker">{{ kicker }}</p>
        <h2>{{ title }}</h2>
        <p class="module-workbench-shell__description">{{ description }}</p>
      </div>

      <span class="panel-pill">{{ status }}</span>
    </header>

    <article class="module-workbench-shell__panel">
      <slot />
    </article>
  </section>
</template>
