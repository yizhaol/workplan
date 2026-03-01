<template>
  <div class="dashboard">
    <!-- 时间筛选区域 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <div class="filter-container">
        <span class="filter-label">时间筛选：</span>
        <el-date-picker
          v-model="dateFilterStore.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="true"
          @change="handleDateChange"
        />
        <el-button-group style="margin-left: 12px;">
          <el-button size="small" @click="dateFilterStore.setToday()">今天</el-button>
          <el-button size="small" @click="dateFilterStore.setThisWeek()">本周</el-button>
          <el-button size="small" @click="dateFilterStore.setThisMonth()">本月</el-button>
          <el-button size="small" @click="dateFilterStore.setLastDays(7)">近7天</el-button>
          <el-button size="small" @click="dateFilterStore.setLastDays(30)">近30天</el-button>
        </el-button-group>
        <el-button
          v-if="dateFilterStore.hasFilter"
          type="text"
          @click="dateFilterStore.clearFilter()"
          style="margin-left: 12px;"
        >
          清除筛选
        </el-button>
        <span v-if="dateFilterStore.hasFilter" class="filter-info">
          当前筛选: {{ dateFilterStore.startDate }} 至 {{ dateFilterStore.endDate }}
        </span>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总任务</template>
          <div class="stat-value">{{ summary.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>已完成</template>
          <div class="stat-value completed">{{ summary.completed || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>进行中</template>
          <div class="stat-value in-progress">{{ summary.in_progress || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>已逾期</template>
          <div class="stat-value overdue">{{ summary.overdue || 0 }}</div>
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
            <el-tag :type="priorityType(row.priority)">{{ priorityText(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="due_date" label="截止日期" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { taskApi } from '../api';
import { useDateFilterStore } from '../stores/dateFilter';

const dateFilterStore = useDateFilterStore();

const summary = ref({
  total: 0,
  completed: 0,
  in_progress: 0,
  overdue: 0
});
const byStatus = ref([]);
const byPriority = ref([]);
const recentTasks = ref([]);
const statusChartRef = ref();
const priorityChartRef = ref();

const statusType = (status) => {
  const map = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
    overdue: 'danger'
  };
  return map[status] || 'info';
};

const statusText = (status) => {
  const map = {
    pending: '待办',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    overdue: '已逾期'
  };
  return map[status] || status;
};

const priorityType = (p) => {
  const map = {
    urgent: 'danger',
    high: 'warning',
    medium: '',
    low: 'info'
  };
  return map[p] || 'info';
};

const priorityText = (p) => {
  const map = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  };
  return map[p] || p;
};

const initCharts = () => {
  if (statusChartRef.value && byStatus.value.length) {
    const chart = echarts.init(statusChartRef.value);
    chart.setOption({
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: byStatus.value.map(s => ({
          name: statusText(s.status),
          value: s.count
        }))
      }]
    });
  }
  if (priorityChartRef.value && byPriority.value.length) {
    const chart = echarts.init(priorityChartRef.value);
    chart.setOption({
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: byPriority.value.map(p => ({
          name: priorityText(p.priority),
          value: p.count
        }))
      }]
    });
  }
};

const fetchData = async () => {
  const params = { limit: 1000 };
  
  // 添加时间筛选参数
  if (dateFilterStore.startDate) {
    params.start_date = dateFilterStore.startDate;
  }
  if (dateFilterStore.endDate) {
    params.end_date = dateFilterStore.endDate;
  }

  const res = await taskApi.getList(params);
  const tasks = res.data || [];

  // 计算统计数据
  summary.value = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  };

  // 按状态分组
  const statusMap = {};
  const priorityMap = {};
  tasks.forEach(t => {
    statusMap[t.status] = (statusMap[t.status] || 0) + 1;
    priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
  });

  byStatus.value = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
  byPriority.value = Object.entries(priorityMap).map(([priority, count]) => ({ priority, count }));

  recentTasks.value = tasks.slice(0, 5);

  setTimeout(initCharts, 100);
};

const handleDateChange = () => {
  fetchData();
};

onMounted(() => {
  fetchData();
});

// 监听时间筛选变化
watch(
  () => dateFilterStore.dateRange,
  () => {
    fetchData();
  },
  { deep: true }
);

watch([byStatus, byPriority], initCharts, { deep: true });
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #606266;
}

.filter-info {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
}

.stat-value.completed {
  color: #67c23a;
}

.stat-value.in-progress {
  color: #e6a23c;
}

.stat-value.overdue {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
