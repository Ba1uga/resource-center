<script setup lang="ts">
import './profile-card.css'

import { computed } from 'vue'

import type { AdminProfile } from '@/features/resource-center/profile/model/profile.types'

const props = defineProps<{
  profile: AdminProfile
}>()

const profileInitial = computed(() => props.profile.name.trim().charAt(0) || '?')
</script>

<template>
  <section class="profile-card" aria-label="当前登录用户">
    <div class="profile-avatar" aria-hidden="true">{{ profileInitial }}</div>
    <div class="profile-copy">
      <strong>{{ profile.name }}</strong>
    </div>
  </section>
</template>
