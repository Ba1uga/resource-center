<script setup lang="ts">
import './resource-center-topbar.css'

import ProfileCard from '@/features/resource-center/profile/ui/ProfileCard.vue'
import type { TeacherProfile } from '@/features/resource-center/profile/model/profile.types'
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'

defineProps<{
  profile: TeacherProfile
}>()
</script>

<template>
  <header class="topbar topbar-shell">
    <div class="topbar-leading" aria-hidden="true">
      <div class="topbar-leading-pill"></div>
    </div>

    <div class="topbar-actions topbar-actions-compact">
      <button class="notify-button quiet" type="button" aria-label="快捷消息">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="iconPaths.mail"></path>
        </svg>
      </button>

      <span class="topbar-status-dot" aria-hidden="true"></span>

      <button class="notify-button" type="button" aria-label="提示消息">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="iconPaths.bell"></path>
        </svg>
        <span class="notify-badge">3</span>
      </button>

      <ProfileCard :profile="profile" />
    </div>
  </header>
</template>
