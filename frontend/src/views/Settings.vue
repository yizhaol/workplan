<template>
  <div class="settings">
    <el-row :gutter="20">
      <!-- 个人信息 -->
      <el-col :span="12">
        <el-card>
          <template #header>个人信息</template>
          <el-form :model="profileForm" label-width="80px">
            <el-form-item label="账号">
              <el-input :value="userStore.user?.username" disabled />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 修改密码 -->
      <el-col :span="12">
        <el-card>
          <template #header>修改密码</template>
          <el-form :model="passwordForm" :rules="passwordRules" ref="pwdFormRef" label-width="80px">
            <el-form-item label="原密码" prop="old_password">
              <el-input v-model="passwordForm.old_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="new_password">
              <el-input v-model="passwordForm.new_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirm_password">
              <el-input v-model="passwordForm.confirm_password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="loading">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { userApi } from '../api';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.role === 'admin');

const loading = ref(false);
const usersLoading = ref(false);
const users = ref([]);
const pwdFormRef = ref();

const profileForm = reactive({
  nickname: userStore.user?.nickname || '',
  email: userStore.user?.email || ''
});

const passwordForm = reactive({ old_password: '', new_password: '', confirm_password: '' });
const passwordRules = {
  old_password: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  new_password: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirm_password: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (r, v, cb) => v !== passwordForm.new_password ? cb(new Error('两次密码不一致')) : cb(),
      trigger: 'blur'
    }
  ]
};

const updateProfile = async () => {
  // 实际项目中应该调用更新接口
  ElMessage.info('个人信息修改功能待实现');
};

const changePassword = async () => {
  await pwdFormRef.value.validate();
  loading.value = true;
  try {
    await userApi.changePassword(passwordForm);
    passwordForm.old_password = '';
    passwordForm.new_password = '';
    passwordForm.confirm_password = '';
    ElMessage.success('密码修改成功');
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  if (!isAdmin.value) return;
  usersLoading.value = true;
  try {
    const res = await userApi.getUsers({ limit: 100 });
    users.value = res.data;
  } finally {
    usersLoading.value = false;
  }
};

const toggleUserStatus = async (user) => {
  await userApi.toggleUserStatus(user.id);
  ElMessage.success('状态已更新');
};

const resetUserPassword = async (user) => {
  await userApi.resetPassword(user.id, { new_password: '123456' });
  ElMessage.success(`已重置用户 ${user.username} 的密码为 123456`);
};

onMounted(fetchUsers);
</script>
