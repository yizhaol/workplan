import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useDateFilterStore = defineStore('dateFilter', () => {
  // 默认不筛选（显示全部）
  const dateRange = ref(null);

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 获取开始日期
  const startDate = computed(() => {
    if (!dateRange.value || !dateRange.value[0]) return null;
    return formatDate(dateRange.value[0]);
  });

  // 获取结束日期
  const endDate = computed(() => {
    if (!dateRange.value || !dateRange.value[1]) return null;
    return formatDate(dateRange.value[1]);
  });

  // 是否有筛选
  const hasFilter = computed(() => {
    return startDate.value !== null && endDate.value !== null;
  });

  // 设置日期范围
  const setDateRange = (range) => {
    dateRange.value = range;
  };

  // 清除筛选
  const clearFilter = () => {
    dateRange.value = null;
  };

  // 快捷设置：今天
  const setToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateRange.value = [today, today];
  };

  // 快捷设置：本周
  const setThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek + 1); // 周一
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // 周日
    dateRange.value = [start, end];
  };

  // 快捷设置：本月
  const setThisMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    dateRange.value = [start, end];
  };

  // 快捷设置：最近N天
  const setLastDays = (days) => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    dateRange.value = [start, end];
  };

  return {
    dateRange,
    startDate,
    endDate,
    hasFilter,
    setDateRange,
    clearFilter,
    setToday,
    setThisWeek,
    setThisMonth,
    setLastDays
  };
});
