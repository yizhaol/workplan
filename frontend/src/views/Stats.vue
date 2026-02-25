<template>
  <div class="stats">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>统计分析</span>
          <div class="filters">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="fetchStats"
            />
            <el-select v-model="groupBy" @change="fetchStats" style="width: 120px; margin-left: 10px">
              <el-option label="按日" value="day" />
              <el-option label="按周" value="week" />
              <el-option label="按月" value="month" />
            </el-select>
          </div>
        </div>
      </template>

      <!-- 个人统计 -->
      <div v-if="!isAdmin">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总任务" :value="stats.summary?.total || 0" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="已完成" :value="stats.summary?.completed || 0" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="进行中" :value="stats.summary?.in_progress || 0" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="逾期数" :value="stats.summary?.overdue || 0" />
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 30px;">
          <el-col :span="12">
            <el-card>
              <template #header>状态分布</template>
              <div ref="statusChartRef" style="height: 300px;"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>创建趋势</template>
              <div ref="trendChartRef" style="height: 300px;"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 管理员视图：所有用户统计 -->
      <div v-else>
        <el-table :data="userStats" stripe>
          <el-table-column prop="nickname" label="用户" />
          <el-table-column prop="username" label="账号" />
          <el-table-column prop="total_tasks" label="总任务" />
          <el-table-column prop="completed_tasks" label="已完成">
            <template #default="{ row }">
              <span style="color: #67c23a">{{ row.completed_tasks }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="overdue_tasks" label="已逾期">
            <template #default="{ row }">
              <span style="color: #f56c6c">{{ row.overdue_tasks }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="completion_rate" label="完成率">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.total_tasks ? Math.round(row.completed_tasks / row.total_tasks * 100) : 0" 
                :status="row.total_tasks && row.completed_tasks / row.total_tasks > 0.8 ? 'success' : undefined"
              />
            </template>
          </el-table-column>
        </el-table>

        <el-card style="margin-top: 20px;">
          <template #header>全局趋势</template>
          <div ref="globalChartRef" style="height: 300px;"></div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import * as echarts from 'echarts';
import { statsApi } from '../api';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.role === 'admin');

const dateRange = ref([]);
const groupBy = ref('day');
const stats = ref({ summary: {}, by_status: [], by_priority: [], trend: [] });
const userStats = ref([]);

const statusChartRef = ref();
const trendChartRef = ref();
const globalChartRef = ref();

const statusText = (s) => ({ pending: '待办', in_progress: '进行中', completed: '已完成', cancelled: '已取消', overdue: '已逾期' }[s] || s);

const initCharts = () => {
  if (isAdmin.value) {
    if (globalChartRef.value && userStats.value.length) {
      const chart = echarts.init(globalChartRef.value);
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: userStats.value.map(u => u.nickname) },
        yAxis: { type: 'value' },
        series: [
          { name: '总任务', type: 'bar', data: userStats.value.map(u => u.total_tasks) },
          { name: '已完成', type: 'bar', data: userStats.value.map(u => u.completed_tasks) }
        ]
      });
    }
    return;
  }

  // 个人图表
  if (statusChartRef.value && stats.value.by_status.length) {
    const chart = echarts.init(statusChartRef.value);
    chart.setOption({
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: stats.value.by_status.map(s => ({ name: statusText(s.status), value: s.count }))
      }]
    });
  }

  if (trendChartRef.value && stats.value.trend?.length) {
    const chart = echarts.init(trendChartRef.value);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.value.trend.map(t => t.date) },
      yAxis: { type: 'value' },
      series: [
        { name: '创建', type: 'line', data: stats.value.trend.map(t => t.created) },
        { name: '完成', type: 'line', data: stats.value.trend.map(t => t.completed) }
      ]
    });
  }
};

const fetchStats = async () => {
  const [start_date, end_date] = dateRange.value || [];
  
  if (isAdmin.value) {
    const res = await statsApi.getAllUsers({ start_date, end_date });
    userStats.value = res.users;
  } else {
    stats.value = await statsApi.getPersonal({ start_date, end_date, group_by: groupBy.value });
  }
  setTimeout(initCharts, 100);
};

onMounted(fetchStats);
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.filters { display: flex; }
</style>
