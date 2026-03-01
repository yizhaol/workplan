import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 保留原有 @ 别名配置
    }
  },
  // 新增 server 配置块，添加允许的主机规则
  server: {
    // 方式1：允许任意域名访问（开发环境推荐）
    allowedHosts: true,
    // 可选：配合 --host 参数，自动绑定局域网 IP（方便其他设备访问）
    host: true
    // 如果你只想允许特定域名（比如 1325.xyz），就把上面的 allowedHosts 改成：
    // allowedHosts: ['你的域名']
  }
})
