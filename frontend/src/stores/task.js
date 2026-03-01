import { defineStore } from 'pinia';
import { taskApi } from '../api';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    currentTask: null,
    logs: [],
    pagination: { total: 0, page: 1, limit: 20 },
    loading: false
  }),
  actions: {
    async fetchTasks(params = {}) {
      this.loading = true;
      try {
        const res = await taskApi.getList(params);
        this.tasks = res.data;
        this.pagination = res.pagination;
        return res;
      } finally {
        this.loading = false;
      }
    },
    async fetchTask(id) {
      this.loading = true;
      try {
        this.currentTask = await taskApi.getDetail(id);
        return this.currentTask;
      } finally {
        this.loading = false;
      }
    },
    async createTask(data) {
      await taskApi.create(data);
      await this.fetchTasks();
    },
    async updateTask(id, data) {
      await taskApi.update(id, data);
      // 更新本地 tasks 数组中的对应任务
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...data };
      }
      // 如果是当前任务详情，也更新
      if (this.currentTask?.id === id) {
        this.currentTask = { ...this.currentTask, ...data };
      }
    },
    async updateStatus(id, data) {
      await taskApi.updateStatus(id, data);
      // 更新本地 tasks 数组中的对应任务状态
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...data };
      }
      // 如果是当前任务详情，也更新
      if (this.currentTask?.id === id) {
        this.currentTask = { ...this.currentTask, ...data };
      }
    },
    async bulkUpdateStatus(data) {
      await taskApi.bulkUpdateStatus(data);
      await this.fetchTasks();
    },
    async deleteTask(id) {
      await taskApi.delete(id);
      this.tasks = this.tasks.filter(t => t.id !== id);
    },
    async fetchLogs(id) {
      this.logs = await taskApi.getLogs(id);
      return this.logs;
    }
  }
});
