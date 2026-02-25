import request from './request';

export const userApi = {
  login: (data) => request.post('/user/login', data),
  register: (data) => request.post('/user/register', data),
  getProfile: () => request.get('/user/profile'),
  changePassword: (data) => request.put('/user/password', data),
  getAllUsers: () => request.get('/user/users'),
  toggleUserStatus: (id, status) => request.put(`/user/users/${id}/status`, { status }),
  resetPassword: (id, newPassword) => request.put(`/user/users/${id}/reset-password`, { new_password: newPassword })
};

export const taskApi = {
  getList: (params) => request.get('/task', { params }),
  getDetail: (id) => request.get(`/task/${id}`),
  create: (data) => request.post('/task', data),
  update: (id, data) => request.put(`/task/${id}`, data),
  updateStatus: (id, data) => request.put(`/task/${id}/status`, data),
  bulkUpdateStatus: (data) => request.post('/task/bulk/status', data),
  delete: (id) => request.delete(`/task/${id}`),
  getLogs: (id) => request.get(`/task/${id}/logs`),
  getAllTasks: (params) => request.get('/task/all', { params })
};

export const reminderApi = {
  getConfigs: () => request.get('/reminder/configs'),
  saveConfig: (data) => request.post('/reminder/configs', data),
  deleteConfig: (id) => request.delete(`/reminder/configs/${id}`),
  getRecords: (params) => request.get('/reminder/records', { params }),
  testReminder: (data) => request.post('/reminder/test', data)
};

export const statsApi = {
  getPersonal: (params) => request.get('/stats/personal', { params }),
  getAllUsers: (params) => request.get('/stats/all', { params }),
  getUserStats: (userId) => request.get(`/stats/user/${userId}`)
};