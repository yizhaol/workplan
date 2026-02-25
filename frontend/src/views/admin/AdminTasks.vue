<template>
  <div class="admin-tasks">
    <div class="toolbar">
      <div class="filters">
        <el-select v-model="filters.userId" placeholder="所有用户" clearable style="width: 150px">
          <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.username"
              :value="user.id"
          />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px; margin-left: 10px">
          <el-option label="待办" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已逾期" value="overdue" />
        </el-select>
        <el-select v-model="filters.priority" placeholder="优先级" clearable style="width: 120px; margin-left: 10px">
          <el-option label="紧急" value="urgent" />
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
        <el-input
            v-model="filters.keyword"
            placeholder="搜索任务标题"
            style="width: 200px; margin-left: 10px"
            clearable
        />
        <el-button type="primary" @click="fetchTasks" style="margin-left: 10px">搜索</el-button>
      </div>
      <div class="stats">
        <span>总计: {{ total }}</span>
      </div>
    </div>

    <el-table :data="tasks" v-loading="loading" @sort-change="handleSort">
      <el-table-column prop="title" label="任务标题" min-width="200">
        <template #default="{ row }">
          <router-link :to="`/tasks/${row.id}`" class="task-link">{{ row.title }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="创建人" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="80">
        <template #default="{ row }">
          <el-tag :type="priorityType(row.priority)" size="small">{{ priorityText(row.priority) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="due_date" label="截止日期" width="110">
        <template #default="{ row }">
          {{ row.due_date ? formatDate(row.due_date) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="110" sortable>
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchTasks"
          @current-change="fetchTasks"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { userApi, taskApi } from '@/api';
import { ElMessage } from 'element-plus';

const tasks = ref([]);
const userList = ref([]);
const loading = ref(false);

const filters = ref({
  userId: null,
  status: null,
  priority: null,
  keyword: ''
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0
});

const total = computed(() => pagination.value.total);

const statusType = (status) => {
  const map = { pending: 'info', in_progress: 'warning', completed: 'success', overdue: 'danger' };
  return map[status] || 'info';
};

const statusText = (status) => {
  const map = { pending: '待办', in_progress: '进行中', completed: '已完成', overdue: '逾期' };
  return map[status] || status;
};

const priorityType = (p) => {
  const map = { urgent: 'danger', high: 'warning', medium: '', low: 'info' };
  return map[p] || '';
};

const priorityText = (p) => {
  const map = { urgent: '紧急', high: '高', medium: '中', low: '低' };
  return map[p] || p;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

const fetchUsers = async () => {
  try {
    const res = await userApi.getAllUsers();
    userList.value = res.data || [];
  } catch (err) {
    console.error('获取用户列表失败:', err);
  }
};

const fetchTasks = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    };
    if (filters.value.userId) params.creator_id = filters.value.userId;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.priority) params.priority = filters.value.priority;
    if (filters.value.keyword) params.keyword = filters.value.keyword;

    const res = await taskApi.getAllTasks(params);
    tasks.value = res.data || [];
    pagination.value.total = res.pagination?.total || 0;
  } catch (err) {
    ElMessage.error('获取任务列表失败');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleSort = ({ prop, order }) => {
  // 排序逻辑
};

onMounted(() => {
  fetchUsers();
  fetchTasks();
});

watch(filters, () => {
  pagination.value.page = 1;
  fetchTasks();
}, { deep: true });
</script>

<style scoped>
.admin-tasks {
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

.filters {
  display: flex;
  align-items: center;
}

.stats {
  color: #6b7280;
  font-size: 14px;
}

.task-link {
  color: #3b82f6;
  text-decoration: none;
}

.task-link:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>