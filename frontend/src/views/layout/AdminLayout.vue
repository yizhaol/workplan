<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">WorkPlan Admin</div>
      <nav>
        <router-link to="/admin/users">👥 用户管理</router-link>
        <router-link to="/admin/comparison">📊 用户对比</router-link>
        <router-link to="/admin/tasks">📋 全部任务</router-link>
        <div class="divider"></div>
        <router-link to="/dashboard" class="back">← 返回前台</router-link>
      </nav>
    </aside>
    <main class="content">
      <header class="header">
        <h2>{{ currentPage }}</h2>
        <div class="user-info">
          <span>{{ userStore.user?.username }}</span>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
      </header>
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const currentPage = computed(() => {
  const names = {
    'AdminUsers': '用户管理',
    'AdminComparison': '用户对比'
  };
  return names[route.name] || '管理后台';
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #1f2937;
  color: white;
  padding: 20px 0;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  padding: 0 20px 20px;
  border-bottom: 1px solid #374151;
  margin-bottom: 20px;
}

.sidebar nav a {
  display: block;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: 0.2s;
}

.sidebar nav a:hover,
.sidebar nav a.router-link-active {
  background: #374151;
  color: white;
}

.divider {
  height: 1px;
  background: #374151;
  margin: 15px 20px;
}

.back {
  color: #9ca3af !important;
}

.content {
  flex: 1;
  background: #f3f4f6;
}

.header {
  background: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #dc2626;
}

.page-content {
  padding: 30px;
}
</style>
