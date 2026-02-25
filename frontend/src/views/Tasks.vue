<template>
  <div class="tasks">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="filters">
            <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px">
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
            <el-input v-model="filters.keyword" placeholder="搜索任务" style="width: 200px; margin-left: 10px" prefix-icon="Search" clearable />
          </div>
          <el-button type="primary" @click="showCreateDialog">+ 新建任务</el-button>
        </div>
      </template>

      <el-table :data="taskStore.tasks" v-loading="taskStore.loading" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="任务标题" min-width="180" sortable>
          <template #default="{ row }">
            <router-link :to="`/tasks/${row.id}`" class="task-link">{{ row.title }}</router-link>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90" sortable>
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => updateStatus(row, cmd)">
              <el-tag :type="statusType(row.status)" class="status-tag">{{ statusText(row.status) }}</el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending">待办</el-dropdown-item>
                  <el-dropdown-item command="in_progress">进行中</el-dropdown-item>
                  <el-dropdown-item command="completed">已完成</el-dropdown-item>
                  <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" sortable>
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => updatePriority(row, cmd)">
              <el-tag :type="priorityType(row.priority)" size="small" class="priority-tag">{{ priorityText(row.priority) }}</el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="urgent">紧急</el-dropdown-item>
                  <el-dropdown-item command="high">高</el-dropdown-item>
                  <el-dropdown-item command="medium">中</el-dropdown-item>
                  <el-dropdown-item command="low">低</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <el-table-column prop="due_date" label="截止日期" width="120" sortable />
        <el-table-column prop="created_at" label="创建时间" width="120" sortable>
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="pagination-info">共 {{ taskStore.pagination.total }} 条</span>
        <el-pagination
            v-model:current-page="taskStore.pagination.page"
            v-model:page-size="taskStore.pagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            :total="taskStore.pagination.total"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新建任务" width="500px">
      <el-form :model="taskForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="taskForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="taskForm.priority" style="width: 100%">
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期">
              <el-date-picker v-model="taskForm.start_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期">
              <el-date-picker v-model="taskForm.due_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="父任务">
          <el-select v-model="taskForm.parent_id" placeholder="选择父任务（可选）" style="width: 100%" clearable>
            <el-option v-for="t in parentTasks" :key="t.id" :label="t.title" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="taskStore.loading">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useTaskStore } from '../stores/task';
import { useUserStore } from '../stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';

const taskStore = useTaskStore();
const userStore = useUserStore();

const dialogVisible = ref(false);
const formRef = ref();
const selectedIds = ref([]);
const parentTasks = ref([]);

const filters = reactive({ status: '', priority: '', keyword: '' });
const sortInfo = reactive({ prop: 'created_at', order: 'desc' });

const taskForm = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assignee_id: null,
  start_date: '',
  due_date: '',
  parent_id: null
});

const formRules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }]
};

const statusType = (s) => ({ pending: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger', overdue: 'danger' }[s] || 'info');
const statusText = (s) => ({ pending: '待办', in_progress: '进行中', completed: '已完成', cancelled: '已取消', overdue: '已逾期' }[s] || s);
const priorityType = (p) => ({ urgent: 'danger', high: 'warning', medium: '', low: 'info' }[p] || 'info');
const priorityText = (p) => ({ urgent: '紧急', high: '高', medium: '中', low: '低' }[p] || p);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.substring(0, 10);
  }
  return dateStr;
};

const fetchTasks = () => {
  taskStore.fetchTasks({ ...filters, page: 1, sort_by: sortInfo.prop, sort_order: sortInfo.order });
};

const handleSortChange = ({ prop, order }) => {
  sortInfo.prop = prop || 'created_at';
  sortInfo.order = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : 'desc';
  fetchTasks();
};

const handleSizeChange = (size) => {
  taskStore.pagination.limit = size;
  taskStore.pagination.page = 1;
  taskStore.fetchTasks({ ...filters, page: 1, limit: size, sort_by: sortInfo.prop, sort_order: sortInfo.order });
};

const handlePageChange = (page) => {
  taskStore.pagination.page = page;
  taskStore.fetchTasks({ ...filters, page, sort_by: sortInfo.prop, sort_order: sortInfo.order });
};

watch(filters, fetchTasks, { deep: true });

onMounted(() => {
  fetchTasks();
  taskStore.fetchTasks({ limit: 100 }).then(res => {
    parentTasks.value = res.data || [];
  });
});

const showCreateDialog = () => {
  Object.assign(taskForm, { title: '', description: '', priority: 'medium', assignee_id: null, start_date: '', due_date: '', parent_id: null });
  dialogVisible.value = true;
};

const handleCreate = async () => {
  await formRef.value.validate();
  await taskStore.createTask(taskForm);
  dialogVisible.value = false;
  ElMessage.success('创建成功');
};

const handleSelectionChange = (rows) => selectedIds.value = rows.map(r => r.id);

//
const quickUpdateStatus = async (task, status) => {
  await taskStore.updateStatus(task.id, { status });
  ElMessage.success('状态已更新');
};

const updateStatus = async (task, status) => {
  await taskStore.updateStatus(task.id, { status });
  ElMessage.success('状态已更新');
};

const updatePriority = async (task, priority) => {
  await taskStore.updateTask(task.id, { priority });
  ElMessage.success('优先级已更新');
};

const handleDelete = async (task) => {
  await ElMessageBox.confirm('确定要删除该任务吗？', '提示', { type: 'warning' });
  await taskStore.deleteTask(task.id);
  ElMessage.success('删除成功');
};
//

</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filters { display: flex; align-items: center; }
.task-link { color: #409eff; text-decoration: none; }
.task-link:hover { text-decoration: underline; }
.pagination-container { display: flex; justify-content: flex-end; align-items: center; margin-top: 20px; gap: 15px; }
.pagination-info { color: #606266; font-size: 14px; }
</style>