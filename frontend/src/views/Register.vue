<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2>注册 WorkPlan</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称" prefix-icon="UserFilled" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱（可选）" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="userStore.loading" @click="handleRegister" style="width: 100%">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="links">
        <router-link to="/login">已有账号？去登录</router-link>
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

const form = reactive({ username: '', nickname: '', email: '', password: '', confirmPassword: '' });
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次密码不一致'));
        else callback();
      }, 
      trigger: 'blur' 
    }
  ]
};

const handleRegister = async () => {
  await formRef.value.validate();
  const success = await userStore.register(form);
  if (success) {
    router.push('/');
  } else {
    ElMessage.error('注册失败');
  }
};
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 350px;
  padding: 20px;
}

.register-card h2 {
  text-align: center;
  margin-bottom: 30px;
}

.links {
  text-align: center;
}
</style>
