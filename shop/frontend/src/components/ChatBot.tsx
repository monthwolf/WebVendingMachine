import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, ScrollShadow } from '@nextui-org/react';
import { sendChatMessage } from '../services/api';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 添加消息
  const addMessage = (content: string, type: 'user' | 'bot') => {
    setMessages(prev => [...prev, {
      type,
      content,
      time: new Date().toLocaleTimeString()
    }]);
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage);
      if (response.success && response.data) {
        addMessage(response.data.content, 'bot');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      addMessage('抱歉，我现在无法回应，请稍后再试。', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-content1 rounded-large shadow-small">
        <ScrollShadow
          ref={scrollRef}
          className="h-[500px] p-4 space-y-4"
          hideScrollBar
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-default-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-tiny mt-1 opacity-80">{message.time}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-default-100">
                <p className="text-sm">正在思考...</p>
              </div>
            </div>
          )}
        </ScrollShadow>

        <div className="p-4 border-t-1 border-default-200">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1"
            />
            <Button
              color="primary"
              isLoading={isLoading}
              onPress={handleSend}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};