// Vercel Serverless Function 入口（独立版）
// 不依赖 backend/index.js，避免其顶层副作用在 Serverless 环境中出问题
import express from 'express';
import cors from 'cors';
import agentRoutes from '../backend/api/agent.js';

const app = express();

// 中间件
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

// API路由 - 与后端保持一致
app.use('/api/agent', agentRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;
