<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>登录 WorkPlan</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="userStore.loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="links">
        <router-link to="/register">还没有账号？去注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();
const formRef = ref();

const form = reactive({ username: '', password: '' });
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  await formRef.value.validate();
  const success = await userStore.login(form.username, form.password);
  if (success) {
    router.push('/');
  } else {
    ElMessage.error('登录失败');
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 350px;
  padding: 20px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
}

.links {
  text-align: center;
}
</style>
