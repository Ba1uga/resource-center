<script setup lang="ts">
import ProfileCard from '@/features/resource-center/profile/ui/ProfileCard.vue'
import { iconPaths } from '@/features/resource-center/shared/config/icons.ts'

import type { AdminProfile } from '@/features/resource-center/profile/model/profile.types'
import type { NavigationItem } from '@/features/resource-center/navigation/model/navigation.types'

defineProps<{
  items: NavigationItem[]
  profile: AdminProfile
}>()

const emit = defineEmits<{
  select: [item: NavigationItem]
}>()

function handleSelect(item: NavigationItem) {
  emit('select', item)
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand-block">
      <div class="brand-mark">
        <span></span>
      </div>
      <h1 class="brand-title">资源中台</h1>
    </div>

    <div class="sidebar-navigation">
      <p class="sidebar-group-label">MENU</p>

      <nav class="sidebar-nav" aria-label="主导航">
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          class="nav-item"
          :class="{ active: item.active }"
          :aria-current="item.active ? 'page' : undefined"
          @click="handleSelect(item)"
        >
          <span class="nav-item-main">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths[item.icon]"></path>
              </svg>
            </span>
            <span class="nav-item-label">{{ item.label }}</span>
          </span>
          <span v-if="item.hasUnsavedChanges" class="nav-unsaved-dot" aria-hidden="true"></span>
        </button>
      </nav>
    </div>

    <div class="sidebar-profile">
      <ProfileCard :profile="profile" />
    </div>
  </aside>
</template>

<style src="./resource-center-sidebar.css"></style>
