// 消息类型定义
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// Agent类型定义
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// 对话请求参数
export interface ChatRequest {
  message: string;
  agentType: string;
  history?: Message[];
  conversationId?: string;
}

// 对话响应
export interface ChatResponse {
  success: boolean;
  response: string;
  conversationId: string;
  error?: string;
}

// Agent执行请求
export interface AgentExecuteRequest {
  action: string;
  params: Record<string, any>;
}

// Agent执行响应
export interface AgentExecuteResponse {
  success: boolean;
  message: string;
  result?: any;
}
