<template>
  <div class="comparison-page">
    <div class="toolbar">
      <div class="user-select">
        <label>选择用户:</label>
        <select v-model="selectedUsers" multiple @change="fetchComparison">
          <option v-for="user in userList" :key="user.id" :value="user.id">
            {{ user.username }}
          </option>
        </select>
        <span class="hint">按住 Ctrl/Cmd 多选</span>
      </div>
      <button @click="fetchComparison" class="refresh-btn">刷新数据</button>
    </div>

    <div v-if="comparisonData.length > 0" class="charts">
      <div class="chart-card">
        <h3>任务完成数对比</h3>
        <div class="bar-chart">
          <div 
            v-for="item in comparisonData" 
            :key="item.id" 
            class="bar-item"
          >
            <div class="bar-label">{{ item.username }}</div>
            <div class="bar-wrapper">
              <div 
                class="bar completed" 
                :style="{ width: getPercent(item.completed) + '%' }"
              >
                {{ item.completed }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3>任务状态分布</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>用户</th>
                <th>待办</th>
                <th>进行中</th>
                <th>已完成</th>
                <th>逾期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in comparisonData" :key="item.id">
                <td>{{ item.username }}</td>
                <td>{{ item.todo }}</td>
                <td>{{ item.in_progress }}</td>
                <td>{{ item.completed }}</td>
                <td class="overdue">{{ item.overdue }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="chart-card">
        <h3>完成率排名</h3>
        <div class="ranking">
          <div 
            v-for="(item, index) in sortedByRate" 
            :key="item.id" 
            class="rank-item"
          >
            <span class="rank-num">{{ index + 1 }}</span>
            <span class="rank-user">{{ item.username }}</span>
            <div class="rank-bar">
              <div 
                class="rank-progress" 
                :style="{ width: item.completionRate + '%' }"
              ></div>
            </div>
            <span class="rank-rate">{{ item.completionRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      请选择至少一个用户进行对比
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userApi, statsApi } from '@/api';

const userList = ref([]);
const selectedUsers = ref([]);
const comparisonData = ref([]);

const sortedByRate = computed(() => {
  return [...comparisonData.value].sort((a, b) => b.completionRate - a.completionRate);
});

const getPercent = (val) => {
  const max = Math.max(...comparisonData.value.map(d => d.completed));
  return max > 0 ? (val / max) * 100 : 0;
};

const fetchUsers = async () => {
  try {
    userList.value = await userApi.getAllUsers();
    // 默认选择前5个用户
    selectedUsers.value = userList.value.slice(0, 5).map(u => u.id);
  } catch (err) {
    console.error('获取用户列表失败:', err);
  }
};

const fetchComparison = async () => {
  if (selectedUsers.value.length === 0) {
    comparisonData.value = [];
    return;
  }

  try {
    const results = await Promise.all(
      selectedUsers.value.map(async (userId) => {
        const user = userList.value.find(u => u.id === userId);
        const stats = await statsApi.getUserStats(userId);
        return {
          id: userId,
          username: user?.username || 'Unknown',
          todo: stats.todo || 0,
          in_progress: stats.in_progress || 0,
          completed: stats.completed || 0,
          overdue: stats.overdue || 0,
          completionRate: stats.completionRate || 0
        };
      })
    );
    comparisonData.value = results;
  } catch (err) {
    console.error('获取对比数据失败:', err);
  }
};

onMounted(async () => {
  await fetchUsers();
  await fetchComparison();
});
</script>

<style scoped>
.comparison-page {
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

.user-select {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-select select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  min-width: 200px;
  height: 100px;
}

.hint {
  color: #9ca3af;
  font-size: 12px;
}

.refresh-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #2563eb;
}

.charts {
  display: grid;
  gap: 20px;
}

.chart-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.chart-card h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #374151;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  width: 80px;
  font-size: 14px;
  color: #374151;
}

.bar-wrapper {
  flex: 1;
  height: 24px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 12px;
  color: white;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar.completed {
  background: #10b981;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.overdue {
  color: #dc2626;
  font-weight: 500;
}

.ranking {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-num {
  width: 24px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.rank-item:first-child .rank-num {
  background: #fbbf24;
  color: white;
}

.rank-item:nth-child(2) .rank-num {
  background: #9ca3af;
  color: white;
}

.rank-item:nth-child(3) .rank-num {
  background: #cd7f32;
  color: white;
}

.rank-user {
  width: 80px;
  font-size: 14px;
}

.rank-bar {
  flex: 1;
  height: 20px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.rank-progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rank-rate {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #9ca3af;
}
</style>
