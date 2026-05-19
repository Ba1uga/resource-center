import { createRouter, createWebHistory } from 'vue-router'

import ResourceCenterPage from '../views/resource-center/ResourceCenterPage.vue'
import { createResourceCenterRouteRecords } from '../features/resource-center/navigation/model/navigation.routes.ts'

export const router = createRouter({
  history: createWebHistory(),
  routes: createResourceCenterRouteRecords(ResourceCenterPage),
})

export default router
