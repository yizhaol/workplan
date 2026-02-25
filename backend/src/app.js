require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api', require('./routes'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 初始化并启动
const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 WorkPlan 后端服务运行在 http://localhost:${PORT}`);
  });
};

start();
