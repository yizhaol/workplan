<template>
  <div class="app-container">
    <el-container v-if="isLoggedIn">
      <el-aside width="220px" class="sidebar">
        <div class="logo">📋 WorkPlan</div>
        <el-menu
          :default-active="$route.path"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/tasks">
            <el-icon><List /></el-icon>
            <span>任务管理</span>
          </el-menu-item>
          <el-menu-item index="/reminders">
            <el-icon><Bell /></el-icon>
            <span>提醒设置</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>个人设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                {{ user?.nickname || user?.username }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = computed(() => JSON.parse(localStorage.getItem('user') || 'null'));
const isLoggedIn = computed(() => !!localStorage.getItem('token'));

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  } else if (command === 'profile') {
    router.push('/settings');
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
}
.sidebar {
  background: #304156;
  height: 100vh;
  flex-shrink: 0;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}
.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.main {
  flex: 1;
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  height: 100vh;
}
</style>
