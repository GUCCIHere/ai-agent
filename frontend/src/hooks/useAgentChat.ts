import { useState, useCallback, useRef } from 'react';
import { type ChatRequest, type Message } from '../types/agent'

interface UseAgentChatOptions {
  agentType?: string;
  apiBaseUrl?: string;
  onError?: (error: Error) => void;
}

interface UseAgentChatReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setAgentType: (type: string) => void;
  currentAgentType: string;
}

export function useAgentChat(options: UseAgentChatOptions = {}): UseAgentChatReturn {
  // 安全地获取环境变量（注意：fetch URL 中已包含 /api/agent/..., 所以这里不需要尾部的 /api）
  const getApiBaseUrl = () => {
    // Vercel部署时使用相对路径
    if (import.meta.env.PROD) {
      return '';
    }
    // 本地开发时使用环境变量或默认值
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  };

  const apiBaseUrl = getApiBaseUrl();

  const {
    agentType: initialAgentType = 'default',
    // apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api',
    onError
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgentType, setCurrentAgentType] = useState(initialAgentType);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // 添加空的助手消息（用于流式更新）
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, assistantMessage]);

    setIsLoading(true);

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const requestBody: ChatRequest = {
        message: content.trim(),
        agentType: currentAgentType,
        history: messages.slice(-10) // 保留最近10条历史
      };

      const response = await fetch(`${apiBaseUrl}/api/agent/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                // 更新最后一条消息
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    newMessages[newMessages.length - 1] = {
                      ...lastMessage,
                      content: accumulatedContent
                    };
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // 忽略解析错误
              console.debug('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }

      console.error('Error sending message:', error);
      onError?.(error as Error);

      // 更新最后一条消息为错误状态
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: '抱歉，发生了错误，请重试。'
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentAgentType, messages, apiBaseUrl, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    setAgentType: setCurrentAgentType,
    currentAgentType,
  };
}
