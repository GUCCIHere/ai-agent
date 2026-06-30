// 简单的测试函数，不依赖任何外部包
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'API 函数工作正常' });
}
