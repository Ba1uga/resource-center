import { createRouter, createWebHistory } from 'vue-router'

import ResourceCenterPage from '../views/resource-center/ResourceCenterPage.vue'
import { resourceCenterSectionRouteName } from '../features/resource-center/navigation/model/navigation.routes.ts'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/resource-center/outline',
    },
    {
      path: '/resource-center/:section',
      name: resourceCenterSectionRouteName,
      component: ResourceCenterPage,
    },
  ],
})

export default router
