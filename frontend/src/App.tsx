import React, { useState, useRef, useEffect } from 'react';
import { useAgentChat } from './hooks/useAgentChat';
import { useAgentCapabilities } from './hooks/useAgentCapabilities';
import { type Message } from './types/agent';
import './App.css';

// 子组件：消息列表
const MessageList: React.FC<{ messages: Message[]; isLoading: boolean }> = ({ 
  messages, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages-container">
      {messages.length === 0 && (
        <div className="empty-state">
          <p>开始与AI Agent对话吧！</p>
        </div>
      )}
      
      {messages.map((msg, index) => (
        <div 
          key={`${msg.role}-${msg.timestamp || index}`} 
          className={`message ${msg.role}`}
        >
          <div className="message-header">
            <strong>{msg.role === 'user' ? '👤 你' : '🤖 AI'}</strong>
            {msg.timestamp && (
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="message-content">
            {msg.content || (
              <span className="typing-indicator">正在思考...</span>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && messages[messages.length - 1]?.role === 'assistant' && 
        messages[messages.length - 1]?.content === '' && (
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

// 子组件：输入区域
const InputArea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
}> = ({ value, onChange, onSend, isLoading, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSend();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        150
      ) + 'px';
    }
  }, [value]);

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? '请选择Agent...' : '输入消息... (Enter发送, Shift+Enter换行)'}
        disabled={isLoading || disabled}
        rows={1}
      />
      <button 
        onClick={onSend} 
        disabled={!value.trim() || isLoading || disabled}
        className="send-button"
      >
        {isLoading ? '发送中...' : '发送'}
      </button>
    </div>
  );
};

// 子组件：Agent选择器
const AgentSelector: React.FC<{
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
  capabilities: Array<{ id: string; name: string; description: string }>;
  isLoading: boolean;
}> = ({ selectedAgent, onAgentChange, capabilities, isLoading }) => {
  return (
    <div className="agent-selector">
      <label htmlFor="agent-select">选择Agent能力：</label>
      <select
        id="agent-select"
        value={selectedAgent}
        onChange={(e) => onAgentChange(e.target.value)}
        disabled={isLoading}
      >
        {capabilities.map((agent) => (
          <option key={agent.id} value={agent.id} title={agent.description}>
            {agent.name}
          </option>
        ))}
      </select>
      {capabilities.find(a => a.id === selectedAgent) && (
        <span className="agent-description">
          {capabilities.find(a => a.id === selectedAgent)?.description}
        </span>
      )}
    </div>
  );
};

// 主组件
const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('default');

  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages,
    setAgentType,
    currentAgentType 
  } = useAgentChat({
    agentType: selectedAgent,
    onError: (error) => {
      console.error('Chat error:', error);
      // 可以在这里添加Toast通知
    }
  });

  const { 
    capabilities, 
    isLoading: isLoadingCapabilities 
  } = useAgentCapabilities();

  // 当Agent类型改变时更新
  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    setAgentType(agentId);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const messageToSend = input;
    setInput('');
    await sendMessage(messageToSend);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 AI Agent 助手</h1>
        <div className="header-actions">
          <button 
            onClick={clearMessages} 
            disabled={messages.length === 0}
            className="clear-button"
          >
            清空对话
          </button>
        </div>
      </header>

      <main className="app-main">
        <AgentSelector
          selectedAgent={selectedAgent}
          onAgentChange={handleAgentChange}
          capabilities={capabilities}
          isLoading={isLoadingCapabilities}
        />

        <MessageList messages={messages} isLoading={isLoading} />

        <InputArea
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          disabled={isLoadingCapabilities}
        />
      </main>

      <footer className="app-footer">
        <small>
          当前Agent: {capabilities.find(a => a.id === currentAgentType)?.name || '通用助手'}
          {' | '}
          消息数: {messages.length}
        </small>
      </footer>
    </div>
  );
};

export default App;
