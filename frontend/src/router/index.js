import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../views/layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
      { path: 'tasks', name: 'Tasks', component: () => import('../views/Tasks.vue') },
      { path: 'tasks/:id', name: 'TaskDetail', component: () => import('../views/TaskDetail.vue') },
      { path: 'stats', name: 'Stats', component: () => import('../views/Stats.vue') },
      { path: 'reminders', name: 'Reminders', component: () => import('../views/Reminders.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../views/Settings.vue') },

    ]
  },
  { path: '/admin',
    component: () => import('../views/layout/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: 'users', name: 'AdminUsers', component: () => import('../views/admin/AdminUsers.vue') },
      { path: 'comparison', name: 'AdminComparison', component: () => import('../views/admin/AdminComparison.vue') },
      { path: 'tasks', name: 'AdminTasks', component: () => import('../views/admin/AdminTasks.vue') }  // 添加这行
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!to.meta.public && !token) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/');
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/');
  } else {
    next();
  }
});

export default router;
