import express from 'express';
import deepseekService from '../services/deepseek.js';

const router = express.Router();

// Agent基础对话
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationId, agentType = 'default' } = req.body;

    // 构建系统提示词（预留扩展）
    const systemPrompt = getSystemPrompt(agentType);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(req.body.history || []),
      { role: 'user', content: message }
    ];

    const response = await deepseekService.chat(messages);

    res.json({
      success: true,
      response: response.content,
      conversationId: conversationId || Date.now().toString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 流式对话
router.post('/chat-stream', async (req, res) => {
  try {
    const { message, agentType = 'default' } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const systemPrompt = getSystemPrompt(agentType);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(req.body.history || []),
      { role: 'user', content: message }
    ];

    const stream = await deepseekService.chatStream(messages);

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    // SSE 头部已发送，必须用 SSE 格式返回错误
    console.error('❌ Stream error:', error.message);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 🔧 预留扩展：Agent能力配置
function getSystemPrompt(agentType) {
  const prompts = {
    default: '你是一个有用的AI助手，可以帮助用户解决各种问题。',
    translator: '你是一个专业的翻译专家，精通多国语言翻译。',
    coder: '你是一个资深程序员，擅长代码编写、调试和优化。',
    writer: '你是一个专业作家，擅长文案创作、内容润色和创意写作。',
    // 在这里添加更多Agent类型...
  };

  return prompts[agentType] || prompts.default;
}

// 📌 预留：Agent能力扩展接口
router.get('/capabilities', (req, res) => {
  res.json({
    agents: [
      { id: 'default', name: '通用助手', description: '通用AI对话助手' },
      { id: 'translator', name: '翻译专家', description: '多语言翻译' },
      { id: 'coder', name: '编程助手', description: '代码编写与调试' },
      { id: 'writer', name: '写作助手', description: '文案创作与润色' },
      // 在这里添加更多Agent能力...
    ]
  });
});

// 🚀 预留：自定义Agent执行接口
router.post('/execute/:agentType', async (req, res) => {
  const { agentType } = req.params;
  const { action, params } = req.body;

  // 这里预留执行特定Agent能力的逻辑
  // 例如：代码执行、数据分析、文件处理等

  res.json({
    success: true,
    message: `Agent ${agentType} 执行 ${action} 功能（预留）`,
    result: '功能开发中...'
  });
});

export default router;
