import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // 加载.env文件

class DeepSeekService {
  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error(
        'DeepSeek API Key is required. Please set DEEPSEEK_API_KEY in .env file'
      );
    }

    console.log('✅ Initializing DeepSeek service...');

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.deepseek.com/v1',
      timeout: 60000,
      maxRetries: 2,
    });

    console.log('✅ DeepSeek service initialized successfully');
  }

  async chat(messages, options = {}) {
    try {
      console.log(`📤 Sending ${messages.length} messages to DeepSeek API`);

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0,
        ...options
      });

      console.log('✅ Received response from DeepSeek API');
      return completion.choices[0].message;
    } catch (error) {
      console.error('❌ DeepSeek API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  async chatStream(messages, options = {}) {
    try {
      console.log(`📤 Sending stream request with ${messages.length} messages`);

      const stream = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        stream: true,
        ...options
      });

      return stream;
    } catch (error) {
      console.error('❌ DeepSeek API Stream Error:', error.message);
      throw error;
    }
  }

  // 测试API连接
  async testConnection() {
    try {
      const response = await this.chat([
        { role: 'user', content: 'Hello, this is a test message.' }
      ]);
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new DeepSeekService();
