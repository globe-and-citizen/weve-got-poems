import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PoemView from '../views/PoemView.vue'
import PoemCreateView from '@/views/PoemCreateView.vue'
import PoemEditView from '@/views/PoemEditView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/poems/create',
      name: 'create_poem',
      component: PoemCreateView
    },
    {
      path: '/poems/:id/update',
      name: 'update_poem',
      component: PoemEditView
    },
    {
      path: '/poems/:id',
      name: 'show_poem',
      component: PoemView
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue')
    }
  ]
})

export default router
