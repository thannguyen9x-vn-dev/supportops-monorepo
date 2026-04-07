import { createRouter, createWebHistory } from 'vue-router'
import RequestList from '../views/RequestList.vue'
import RequestDetail from '../views/RequestDetail.vue'

// Vue Router = giống React Router / Next.js App Router
// createWebHistory dùng HTML5 history API (URL sạch, không có #)
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: RequestList,
    },
    {
      path: '/requests/:id',
      component: RequestDetail,
    },
  ],
})
