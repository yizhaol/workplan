import { defineStore } from 'pinia';
import { userApi } from '../api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    users: [],
    loading: false
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(username, password) {
      this.loading = true;
      try {
        const res = await userApi.login({ username, password });
        this.user = res.user;
        this.token = res.token;
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        return true;
      } finally { this.loading = false; }
    },
    async register(data) {
      this.loading = true;
      try {
        const res = await userApi.register(data);
        this.user = res.user;
        this.token = res.token;
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        return true;
      } finally { this.loading = false; }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});
