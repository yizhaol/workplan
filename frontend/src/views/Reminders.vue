<template>
  <div class="reminders">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="提醒配置" name="config">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>我的提醒规则</span>
              <el-button type="primary" @click="showConfigDialog = true">+ 添加规则</el-button>
            </div>
          </template>

          <el-table :data="configs" v-loading="loading">
            <el-table-column prop="reminder_type" label="提醒类型" width="120">
              <template #default="{ row }">
                {{ typeText(row.reminder_type) }}
              </template>
            </el-table-column>
            <el-table-column prop="channel" label="渠道" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ channelText(row.channel) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="100" />
            <el-table-column prop="week_days" label="周几" width="120" />
            <el-table-column prop="is_enabled" label="状态" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.is_enabled" @change="toggleConfig(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="deleteConfig(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="提醒记录" name="records">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>发送记录</span>
              <el-date-picker
                v-model="recordFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                value-format="YYYY-MM-DD"
                @change="fetchRecords"
                style="width: 250px"
              />
            </div>
          </template>

          <el-table :data="records" v-loading="loading">
            <el-table-column prop="send_at" label="发送时间" width="180" />
            <el-table-column prop="reminder_type" label="类型" width="100" />
            <el-table-column prop="channel" label="渠道" width="100">
              <template #default="{ row }">
                {{ channelText(row.channel) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'sent' ? 'success' : row.status === 'failed' ? 'danger' : 'info'" size="small">
                  {{ row.status === 'sent' ? '成功' : row.status === 'failed' ? '失败' : '待发送' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" show-overflow-tooltip />
          </el-table>

          <el-pagination
            v-if="pagination.total > pagination.limit"
            style="margin-top: 20px; justify-content: flex-end"
            layout="prev, pager, next"
            :total="pagination.total"
            :page-size="pagination.limit"
            :current-page="pagination.page"
            @current-change="handlePageChange"
          />
        </el-card>
      </el-tab-pane>

    </el-tabs>

    <!-- 添加/编辑配置弹窗 -->
    <el-dialog v-model="showConfigDialog" title="添加提醒规则" width="450px">
      <el-form :model="configForm" label-width="100px">
        <el-form-item label="提醒类型">
          <el-select v-model="configForm.reminder_type" style="width: 100%">
            <el-option label="每日任务提醒" value="daily" />
            <el-option label="每周总结提醒" value="weekly" />
            <el-option label="任务开始提醒" value="start" />
            <el-option label="截止日期提醒" value="due" />
            <el-option label="逾期提醒" value="overdue" />
            <el-option label="状态变更提醒" value="status_change" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒渠道">
          <el-select v-model="configForm.channel" style="width: 100%">
            <el-option label="邮箱" value="email" />
            <el-option label="钉钉" value="dingtalk" />
            <el-option label="企业微信" value="wecom" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒时间" v-if="['daily', 'weekly'].includes(configForm.reminder_type)">
          <el-time-picker v-model="configForm.time" format="HH:mm" style="width: 100%" placeholder="选择时间" />
        </el-form-item>
        <el-form-item label="周几提醒" v-if="configForm.reminder_type === 'weekly'">
          <el-checkbox-group v-model="configForm.week_days">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="configForm.is_enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig" :loading="loading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { reminderApi } from '../api';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.role === 'admin');

const activeTab = ref('config');
const loading = ref(false);
const configs = ref([]);
const records = ref([]);
const globalConfigs = ref([]);
const showConfigDialog = ref(false);

const recordFilter = reactive({ dateRange: [] });
const pagination = reactive({ page: 1, limit: 20, total: 0 });

const configForm = reactive({
  reminder_type: 'daily',
  channel: 'email',
  time: null,
  week_days: [],
  is_enabled: true
});

const typeText = (t) => ({ daily: '每日提醒', weekly: '每周', start: '开始提醒', due: '截止提醒', overdue: '逾期', status_change: '状态变更' }[t] || t);
const channelText = (c) => ({ email: '邮箱', dingtalk: '钉钉', wecom: '企微' }[c] || c);

const fetchConfigs = async () => {
  loading.value = true;
  try {
    configs.value = await reminderApi.getConfigs();
    globalConfigs.value = configs.value.filter(c => c.is_global);
  } finally {
    loading.value = false;
  }
};

const fetchRecords = async (page = 1) => {
  loading.value = true;
  try {
    const [start_date, end_date] = recordFilter.dateRange || [];
    const res = await reminderApi.getRecords({ 
      page, 
      limit: pagination.limit,
      start_date, 
      end_date 
    });
    records.value = res.data;
    Object.assign(pagination, res.pagination);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => fetchRecords(page);

const saveConfig = async () => {
  loading.value = true;
  try {
    await reminderApi.saveConfig({
      ...configForm,
      time: configForm.time ? new Date(configForm.time).toTimeString().slice(0, 5) : null,
      week_days: configForm.week_days.join(',')
    });
    showConfigDialog.value = false;
    await fetchConfigs();
    ElMessage.success('保存成功');
  } finally {
    loading.value = false;
  }
};

const toggleConfig = async (row) => {
  await reminderApi.saveConfig({ id: row.id, is_enabled: row.is_enabled });
};

const deleteConfig = async (id) => {
  await reminderApi.deleteConfig(id);
  await fetchConfigs();
  ElMessage.success('删除成功');
};

onMounted(() => {
  fetchConfigs();
  fetchRecords();
});
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
