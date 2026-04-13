<script setup lang="ts">
import './profile-card.css'

import type { TeacherProfile } from '@/features/resource-center/profile/model/profile.types'

defineProps<{
  profile: TeacherProfile
}>()
</script>

<template>
  <section class="profile-card" aria-label="当前登录用户">
    <div class="profile-avatar">林</div>
    <div>
      <strong>{{ profile.name }}</strong>
      <p>{{ profile.role }} · {{ profile.campus }}</p>
    </div>
  </section>
</template>
