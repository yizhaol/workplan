<template>
  <div class="task-detail">
    <el-page-header @back="$router.back()" style="margin-bottom: 20px;">
      <template #content>
        <span class="task-title">{{ task?.title }}</span>
      </template>
    </el-page-header>

    <el-row :gutter="20" v-if="task">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务详情</span>
              <el-button-group>
                <el-button @click="showEditDialog = true">编辑</el-button>
                <el-button type="danger" @click="handleDelete">删除</el-button>
              </el-button-group>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <el-tag :type="statusType(task.status)">{{ statusText(task.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="priorityType(task.priority)" size="small">{{ task.priority }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建人">{{ task.creator?.nickname }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ task.assignee?.nickname || '-' }}</el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ task.start_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="截止日期">{{ task.due_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ task.created_at }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ task.completed_at || '-' }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ task.description || '暂无描述' }}</el-descriptions-item>
          </el-descriptions>

          <div style="margin-top: 20px;">
            <h4>操作</h4>
            <el-button-group>
              <el-button v-if="task.status !== 'in_progress'" type="warning" @click="updateStatus('in_progress')">开始任务</el-button>
              <el-button v-if="task.status !== 'completed'" type="success" @click="updateStatus('completed')">标记完成</el-button>
              <el-button v-if="task.status !== 'cancelled'" @click="updateStatus('cancelled')">取消任务</el-button>
            </el-button-group>
          </div>
        </el-card>

        <!-- 子任务 -->
        <el-card style="margin-top: 20px;" v-if="task.subtasks?.length">
          <template #header>
            <div class="card-header">
              <span>子任务 ({{ task.subtasks.length }})</span>
            </div>
          </template>
          <el-table :data="task.subtasks" size="small">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 操作日志 -->
        <el-card>
          <template #header>操作日志</template>
          <el-timeline>
            <el-timeline-item
              v-for="log in taskStore.logs"
              :key="log.id"
              :timestamp="log.created_at"
              placement="top"
            >
              <p>
                <strong>{{ log.operator?.nickname }}</strong>
                {{ actionText(log.action) }}
                <el-tag v-if="log.field_name" size="small">{{ log.field_name }}</el-tag>
              </p>
              <p v-if="log.remark" class="remark">{{ log.remark }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="showEditDialog" title="编辑任务" width="500px">
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="taskForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="taskForm.priority" style="width: 100%">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
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
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskStore } from '../stores/task';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const taskStore = useTaskStore();

const task = ref(null);
const showEditDialog = ref(false);
const taskForm = reactive({ title: '', description: '', priority: '', start_date: '', due_date: '' });

const statusType = (s) => ({ pending: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger', overdue: 'danger' }[s] || 'info');
const statusText = (s) => ({ pending: '待办', in_progress: '进行中', completed: '已完成', cancelled: '已取消', overdue: '已逾期' }[s] || s);
const priorityType = (p) => ({ urgent: 'danger', high: 'warning', medium: '', low: 'info' }[p] || 'info');
const actionText = (a) => ({ create: '创建了任务', update: '更新了', status: '更新状态为' }[a] || a);

onMounted(async () => {
  task.value = await taskStore.fetchTask(route.params.id);
  taskStore.fetchLogs(route.params.id);
  Object.assign(taskForm, {
    title: task.value.title,
    description: task.value.description,
    priority: task.value.priority,
    start_date: task.value.start_date,
    due_date: task.value.due_date
  });
});

const updateStatus = async (status) => {
  await taskStore.updateStatus(task.value.id, { status });
  task.value = await taskStore.fetchTask(route.params.id);
  ElMessage.success('状态已更新');
};

const handleUpdate = async () => {
  await taskStore.updateTask(task.value.id, taskForm);
  task.value = await taskStore.fetchTask(route.params.id);
  showEditDialog.value = false;
  ElMessage.success('更新成功');
};

const handleDelete = async () => {
  await ElMessageBox.confirm('确定删除该任务？', '提示', { type: 'warning' });
  await taskStore.deleteTask(task.value.id);
  ElMessage.success('删除成功');
  router.push('/tasks');
};
</script>

<style scoped>
.task-title { font-size: 18px; font-weight: bold; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.remark { color: #909399; font-size: 12px; margin-top: 5px; }
</style>
