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
    },
    
    async updateStatus(id, data) {
      await taskApi.updateStatus(id, data);
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
