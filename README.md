# WorkPlan - 个人任务管理系统

## 项目结构

```
workplan/
├── backend/          # Node.js + Express 后端
│   ├── src/
│   │   ├── config/   # 数据库配置
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中间件 (认证)
│   │   ├── models/   # Sequelize 模型
│   │   ├── routes/   # API 路由
│   │   ├── services/ # 业务服务 (定时任务)
│   │   └── app.js    # 入口文件
│   └── .env.example  # 环境变量示例
│
└── frontend/         # Vue3 + Vite 前端
    └── src/
        ├── api/      # API 请求封装
        ├── router/   # 路由配置
        ├── stores/   # Pinia 状态管理
        └── views/    # 页面组件
```

## 快速开始
### 1.数据库
导入数据库文件workplan.sql

### 2. 后端

```bash
cd backend

# 安装依赖
npm install

# 配置数据库
cp .env.example .env
# 编辑 .env 设置数据库连接信息

# 启动服务
npm run dev
```

后端运行在 http://localhost:3000

### 3. 前端

```bash
cd frontend

# 安装依赖
npm install

# 配置 API
cp .env.example .env

# 启动开发服务器
npm run dev
```

前端运行在 http://localhost:5173

## 功能特性

### 用户管理
- 注册 / 登录
- 管理员：用户管理、状态控制、密码重置

### 任务管理
- 创建/编辑/删除任务
- 子任务支持
- 状态流转 (待办 → 进行中 → 已完成)
- 操作日志记录
- 自定义拓展字段

### 提醒功能
- 每日任务提醒
- 截止日期提醒
- 逾期提醒
- 邮箱 / 钉钉 / 企业微信 渠道支持

### 统计分析
- 个人任务统计
- 图表可视化
- 趋势分析
- (管理员) 用户对比

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Pinia + Element Plus |
| 后端 | Node.js + Express + Sequelize |
| 数据库 | MySQL |
| 认证 | JWT |
| 定时任务 | node-cron |
