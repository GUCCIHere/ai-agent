// Vercel Serverless Function 入口
// 自动发现：Vercel 会检测到 /api 目录并将此文件作为 Serverless Function 部署
import app from '../backend/index.js';

export default app;
