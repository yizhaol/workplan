<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总任务</template>
          <div class="stat-value">{{ stats.summary?.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>已完成</template>
          <div class="stat-value completed">{{ stats.summary?.completed || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>进行中</template>
          <div class="stat-value in-progress">{{ stats.summary?.in_progress || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>已逾期</template>
          <div class="stat-value overdue">{{ stats.summary?.overdue || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>按状态分布</template>
          <div ref="statusChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>按优先级分布</template>
          <div ref="priorityChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>最近任务</span>
          <router-link to="/tasks">查看全部 →</router-link>
        </div>
      </template>
      <el-table :data="recentTasks" stripe>
        <el-table-column prop="title" label="任务标题" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="priorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="due_date" label="截止日期" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import * as echarts from 'echarts';
import { statsApi, taskApi } from '../api';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const stats = ref({ summary: {}, by_status: [], by_priority: [], trend: [] });
const recentTasks = ref([]);
const statusChartRef = ref();
const priorityChartRef = ref();

const statusType = (status) => {
  const map = { pending: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger', overdue: 'danger' };
  return map[status] || 'info';
};

const statusText = (status) => {
  const map = { pending: '待办', in_progress: '进行中', completed: '已完成', cancelled: '已取消', overdue: '已逾期' };
  return map[status] || status;
};

const priorityType = (p) => {
  const map = { urgent: 'danger', high: 'warning', medium: '', low: 'info' };
  return map[p] || 'info';
};

const initCharts = () => {
  if (statusChartRef.value && stats.value.by_status.length) {
    const chart = echarts.init(statusChartRef.value);
    chart.setOption({
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: stats.value.by_status.map(s => ({ 
          name: statusText(s.status), 
          value: s.count 
        }))
      }]
    });
  }

  if (priorityChartRef.value && stats.value.by_priority.length) {
    const chart = echarts.init(priorityChartRef.value);
    chart.setOption({
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: stats.value.by_priority.map(p => ({ 
          name: p.priority, 
          value: p.count 
        }))
      }]
    });
  }
};

onMounted(async () => {
  stats.value = await statsApi.getPersonal();
  const res = await taskApi.getList({ limit: 5 });
  recentTasks.value = res.data;
  setTimeout(initCharts, 100);
});

watch(stats, initCharts, { deep: true });
</script>

<style scoped>
.stat-value {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
}

.stat-value.completed { color: #67c23a; }
.stat-value.in-progress { color: #e6a23c; }
.stat-value.overdue { color: #f56c6c; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
