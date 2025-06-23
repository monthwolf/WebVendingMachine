import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, ScrollShadow } from '@nextui-org/react';
import Draggable from 'react-draggable';
import { SendIcon } from './SendIcon'; // A simple SVG icon component

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: '您好！有什么可以帮您的吗？我可以为您推荐饮品或解答疑问。', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const nodeRef = useRef(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage: Message = { text: inputValue, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      // Simulate bot response
      setTimeout(() => {
        const botMessage: Message = { text: '感谢您的提问，我正在思考...', sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      }, 800);
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the chat body when new messages are added
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  if (isCollapsed) {
    return (
      <Button 
        isIconOnly 
        className="fixed bottom-5 right-5 z-[100] bg-gradient-to-tr from-blue-500 to-purple-600 text-white shadow-lg"
        onPress={() => setIsCollapsed(false)}
        aria-label="Open Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </Button>
    );
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".handle">
      <div ref={nodeRef} className="fixed bottom-5 right-5 z-[100]">
        <Card className="w-96 max-h-[70vh] flex flex-col bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-white shadow-2xl">
          <CardHeader className="handle flex justify-between items-center cursor-grab active:cursor-grabbing p-3 bg-zinc-800/80 border-b border-zinc-700">
            <h4 className="font-bold text-medium">智能助手</h4>
            <Button 
              isIconOnly 
              size="sm"
              variant="flat"
              className="bg-transparent hover:bg-zinc-700 text-zinc-400"
              onPress={() => setIsCollapsed(true)}
              aria-label="Collapse Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </Button>
          </CardHeader>
          <ScrollShadow hideScrollBar ref={chatBodyRef} className="flex-grow p-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`py-2 px-3 rounded-2xl max-w-[85%] w-fit ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 self-end rounded-br-none' 
                      : 'bg-zinc-700 self-start rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}
            </div>
          </ScrollShadow>
          <CardFooter className="p-2 bg-zinc-800/50 border-t border-zinc-700">
            <Input
              fullWidth
              placeholder="输入消息..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              variant="bordered"
              classNames={{
                inputWrapper: "border-zinc-600",
              }}
            />
            <Button 
              isIconOnly
              color="primary" 
              className="ml-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
              onPress={handleSendMessage}
              aria-label="Send Message"
            >
              <SendIcon />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Draggable>
  );
};