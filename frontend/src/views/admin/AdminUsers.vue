<template>
  <div class="users-page">
    <div class="toolbar">
      <div class="search-box">
        <input v-model="search" placeholder="搜索用户名..." @input="fetchUsers" />
      </div>
      <div class="stats">
        <span>总计: {{ total }}</span>
        <span>启用: {{ enabled }}</span>
        <span>禁用: {{ disabled }}</span>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email || '-' }}</td>
            <td>
              <span :class="['role-tag', user.role]">{{ user.role }}</span>
            </td>
            <td>
              <span :class="['status-tag', user.status]">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td class="actions">
              <button 
                @click="toggleStatus(user)" 
                :class="user.status === 'active' ? 'btn-success' : 'btn-danger'"
              >
                {{ user.status === 'active' ? '禁用' : '启用' }}
              </button>
              <button @click="openResetDialog(user)" class="btn-secondary">重置密码</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 重置密码弹窗 -->
    <div v-if="showResetDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>重置密码 - {{ currentUser?.username }}</h3>
        <div class="form-group">
          <label>新密码:</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码" />
        </div>
        <div class="dialog-actions">
          <button @click="showResetDialog = false" class="btn-secondary">取消</button>
          <button @click="confirmResetPassword" class="btn-primary">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userApi } from '@/api';

const users = ref([]);
const search = ref('');
const showResetDialog = ref(false);
const currentUser = ref(null);
const newPassword = ref('');

const total = computed(() => users.value.length);
const enabled = computed(() => users.value.filter(u => u.status === 'active').length);
const disabled = computed(() => users.value.filter(u => u.status === 'disabled').length);

const fetchUsers = async () => {
  try {
    const res = await userApi.getAllUsers();
    users.value = res.data;
  } catch (err) {
    console.error('获取用户列表失败:', err);
  }
};

const toggleStatus = async (user) => {
  const action = user.status === 'active' ? '禁用' : '启用';
  if (!confirm(`确定要${action}用户 ${user.username} 吗？`)) return;
  
  try {
    await userApi.toggleUserStatus(user.id, user.status === 'active' ? 'disabled' : 'active');
    await fetchUsers();
  } catch (err) {
    alert('操作失败: ' + (err.response?.data?.error || '未知错误'));
  }
};

const openResetDialog = (user) => {
  currentUser.value = user;
  newPassword.value = '';
  showResetDialog.value = true;
};

const confirmResetPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    alert('密码长度至少6位');
    return;
  }
  
  try {
    await userApi.resetPassword(currentUser.value.id, newPassword.value);
    alert('密码重置成功');
    showResetDialog.value = false;
  } catch (err) {
    alert('操作失败: ' + (err.response?.data?.error || err.message));
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(fetchUsers);
</script>

<style scoped>
.users-page {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 200px;
}

.stats {
  display: flex;
  gap: 20px;
  color: #6b7280;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.role-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.role-tag.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-tag.user {
  background: #dbeafe;
  color: #1e40af;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag.active {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.disabled {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background: #fecaca;
}

.btn-success {
  background: #d1fae5;
  color: #059669;
}

.btn-success:hover {
  background: #a7f3d0;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 360px;
}

.dialog h3 {
  margin: 0 0 20px;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
