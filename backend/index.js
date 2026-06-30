import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

// 检查环境变量
console.log('🔍 Checking environment variables...');
console.log(`- DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- PORT: ${process.env.PORT || 3000}`);

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ Error: DEEPSEEK_API_KEY is not set in .env file');
  console.error('Please create a .env file in the backend directory with:');
  console.error('DEEPSEEK_API_KEY=your_deepseek_api_key_here');
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

// 兼容OpenAI SDK
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.DEEPSEEK_API_KEY;
  console.log('✅ OPENAI_API_KEY set to DEEPSEEK_API_KEY for compatibility');
}

import express from 'express';
import cors from 'cors';
import agentRoutes from './api/agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - Vercel 生产环境允许所有来源，本地开发限定
const isVercel = !!process.env.VERCEL;
app.use(cors({
  origin: isVercel ? true : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

// API路由
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
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Vercel 环境不启动 HTTP 服务器（由 Serverless Function 处理）
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📍 Agent API: http://localhost:${PORT}/api/agent`);
    console.log('\n✅ Ready to accept requests!\n');
  });
}

// 导出 Express app 供 Vercel Serverless Function 使用
export default app;
