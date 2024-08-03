import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

import Main from '../views/Main.vue'
import Subscribe from '../views/Subscribe.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/main',
    component: Home,
    children: [
      {
        path: '/main',
        component: Main
      },
      {
        path: '/subscribe',
        component: Subscribe
      },
    ]
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: Register
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.path === '/login' || to.path === '/register') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
