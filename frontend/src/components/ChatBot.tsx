import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Input, Button, ScrollShadow, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch, Chip, Tooltip, Accordion, AccordionItem } from '@nextui-org/react';
import Draggable from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { SendIcon } from './SendIcon';
import { sendChatMessage, fetchAvailableModels, fetchAiRecommendation } from '../services/api';
import { ModelInfo } from '../types';
import { AUTO_SELECT_TEMPLATE } from '../types/constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import hljs from 'highlight.js';
import 'react-resizable/css/styles.css';

interface Message {
  text: string;
  sender: 'user' | 'bot' | 'system';
  modelInfo?: ModelInfo;
  code?: string;
  timestamp: number;
}



// 生成自动选择饮品和配料的代码
const generateAutoSelectCode = (beverageId: string, condiments: {id: string, quantity: number}[]) => {
  let code = AUTO_SELECT_TEMPLATE;
  
  // 转换ID格式，处理可能的连字符格式到驼峰格式
  const convertToCamelCase = (id: string): string => {
    // 检查是否包含连字符
    if (id.includes('-')) {
      // 将连字符格式转为驼峰格式，例如 'orange-juice' 转为 'orangeJuice'
      return id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
    return id;
  };
  
  const camelCaseBeverageId = convertToCamelCase(beverageId);
  
  // 替换饮品ID
  code = code.replace("{{BEVERAGE_ID}}", camelCaseBeverageId);
  
  // 如果没有配料，移除配料部分
  if (condiments.length === 0) {
    code = code.replace(/const targetCondiments = \[\n(.|\n)*?\n  \/\/ 可以添加更多配料...\n\];/, 
      'const targetCondiments = [];');
  } else {
    // 替换第一个配料，确保使用驼峰命名
    const firstCondiment = condiments[0];
    const camelCaseCondimentId = convertToCamelCase(firstCondiment.id);
    code = code.replace(
      "{ id: \"{{CONDIMENT_ID}}\", quantity: {{QUANTITY}} }",
      `{ id: "${camelCaseCondimentId}", quantity: ${firstCondiment.quantity} }`
    );
    
    // 添加额外的配料
    if (condiments.length > 1) {
      let additionalCondiments = '';
      for (let i = 1; i < condiments.length; i++) {
        const camelCaseId = convertToCamelCase(condiments[i].id);
        additionalCondiments += `  { id: "${camelCaseId}", quantity: ${condiments[i].quantity} },\n`;
      }
      code = code.replace("  // 可以添加更多配料...", additionalCondiments + "  // 可以添加更多配料...");
    }
  }
  
  return code;
};

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: '您好！有什么可以帮您的吗？我可以为您推荐饮品或解答疑问。', sender: 'bot', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [providerModels, setProviderModels] = useState<Record<string, string[]>>({});
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(() => {
    // 从本地存储中获取窗口大小设置
    const savedSize = localStorage.getItem('chatbot-size');
    if (savedSize) {
      try {
        return JSON.parse(savedSize);
      } catch (e) {
        console.error('Failed to parse saved size:', e);
      }
    }
    // 默认大小
    return { width: 384, height: 500 };
  });
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // 获取可用模型
  useEffect(() => {
    const getAvailableModels = async () => {
      try {
        const response = await fetchAvailableModels();
        if (response.data?.providers && response.data.providers.length > 0) {
          setAvailableProviders(response.data.providers);
          setProviderModels(response.data.provider_models || {});
          
          // 设置默认提供商
          const defaultProvider = response.data.providers[0];
          setSelectedProvider(defaultProvider);
          
          // 设置默认模型
          if (response.data.provider_models && 
              response.data.provider_models[defaultProvider] && 
              response.data.provider_models[defaultProvider].length > 0) {
            setSelectedModel(response.data.provider_models[defaultProvider][0]);
          }
          
          setUseAI(true);
        }
      } catch (error) {
        console.error('获取可用模型失败:', error);
        setAvailableProviders([]);
        setProviderModels({});
        setUseAI(false);
      }
    };
    
    getAvailableModels();
  }, []);

  // 当提供商变化时，更新模型选择
  useEffect(() => {
    if (selectedProvider && providerModels[selectedProvider]?.length > 0) {
      setSelectedModel(providerModels[selectedProvider][0]);
    } else {
      setSelectedModel('');
    }
  }, [selectedProvider, providerModels]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // 检查是否是生成自动选择代码的请求
    const autoSelectRegex = /自动选择\s*(\w+)(?:\s*和\s*([\w\s,]+))?/i;
    const match = inputValue.match(autoSelectRegex);
    
    if (match) {
      const beverageId = match[1];
      const condimentsText = match[2] || '';
      const condimentsList = condimentsText.split(/[,，]/).filter(Boolean).map(c => c.trim());
      
      // 简单解析，实际应用中可能需要更复杂的逻辑
      const condiments = condimentsList.map(c => {
        const parts = c.split(/\s+/);
        const id = parts[0];
        const quantity = parseInt(parts[1] || '1', 10);
        return { id, quantity };
      });
      
      // 生成代码
      const code = generateAutoSelectCode(beverageId, condiments);
      
      // 添加用户消息
      const userMessage: Message = {
        text: inputValue,
        sender: 'user',
        timestamp: Date.now()
      };
      
      // 添加机器人回复，包含生成的代码
      const botMessage: Message = {
        text: `已为您生成自动选择${beverageId}的代码，点击下方可查看并运行。`,
        sender: 'bot',
        code: code,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage, botMessage]);
      setInputValue('');
      return;
    }
    
    // 添加用户消息
    const userMessage: Message = {
      text: inputValue,
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 保存当前输入并清空输入框
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    try {
      if (currentInput.toLowerCase().includes('推荐') || currentInput.toLowerCase().includes('recommend')) {
        await handleRecommendation(currentInput);
      } else {
        // 正常的聊天消息
        const response = await sendChatMessage(
          currentInput, 
          useAI, 
          useAI ? selectedProvider : undefined,
          useAI ? selectedModel : undefined
        );
        const botMessage: Message = { 
          text: response.data?.content || '抱歉，我无法处理您的请求。', 
          sender: 'bot',
          modelInfo: response.data?.model_info,
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = { 
        text: '抱歉，发送消息时出现错误，请稍后再试。', 
        sender: 'system',
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendation = async (userInput: string) => {
    try {
      setIsLoading(true);
      
      // 检查是否使用AI，以及是否有选择的提供商和模型
      const providerName = useAI && selectedProvider ? selectedProvider : undefined;
      const modelName = useAI && selectedModel ? selectedModel : undefined;
      
      // 发送推荐请求
      const response = await fetchAiRecommendation(
        userInput, 
        providerName, 
        modelName,
        AUTO_SELECT_TEMPLATE
      );
      
      setIsLoading(false);
      
      if (response.success && response.data) {
        const { recommendation, code, model_info } = response.data;
        
        // 构建回复文本
        let replyText = '';
        
        if (recommendation) {
          // 优先使用中文名称，如果没有则使用ID
          let beverageName = recommendation.beverageName || recommendation.beverage;
          replyText = `我为您推荐: **${beverageName}**`;
          
          // 处理配料列表，优先使用中文名称
          if (recommendation.condiments && recommendation.condiments.length > 0) {
            replyText += '\n\n配料:';
            recommendation.condiments.forEach((condiment: any) => {
              if (typeof condiment === 'string') {
                // 旧格式，直接显示配料名称
                replyText += `\n- *${condiment}*`;
              } else if (typeof condiment === 'object') {
                // 新格式，显示配料中文名称和数量
                const name = condiment.name || condiment.id || '';
                const quantity = condiment.quantity || 1;
                replyText += `\n- *${name}* x ${quantity}`;
              }
            });
          }
          
          replyText += `\n\n原因: ${recommendation.reason}`;
          if (recommendation.explanation) {
            replyText += `\n\n${recommendation.explanation}`;
          }
        }

        const botMessage: Message = { 
          text: replyText, 
          sender: 'bot',
          modelInfo: model_info || undefined,
          code: code || undefined,
          timestamp: Date.now() 
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('获取AI推荐失败:', error);
      setIsLoading(false);
      const errorMessage: Message = { 
        text: '抱歉，获取推荐时出现错误，请稍后再试。', 
        sender: 'system',
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const executeGeneratedCode = (code: string) => {
    try {
      console.log('开始执行自动选择代码...');
      
      // 添加错误处理包装器
      const wrappedCode = `
        try {
          // 原始代码
          ${code}
        } catch (error) {
          console.error('代码执行过程中出错:', error);
          alert('执行过程中出错: ' + (error.message || String(error)));
        }
      `;
      
      // 使用Function构造函数创建可执行的函数
      const executableFunction = new Function(wrappedCode);
      
      // 执行代码
      executableFunction();
      console.log('代码执行函数已启动');
    } catch (error) {
      console.error('创建或执行代码函数时出错:', error);
      // 向用户显示错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`执行代码时出错: ${errorMessage}`);
      
      // 添加错误消息到聊天
      setMessages(prev => [...prev, {
        text: `代码执行失败: ${errorMessage}`,
        sender: 'system',
        timestamp: Date.now()
      }]);
    }
  };

  // 检测是否要执行代码
  useEffect(() => {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (lastUserMessage && 
        (lastUserMessage.text.toLowerCase().includes('执行代码') || 
         lastUserMessage.text.toLowerCase().includes('run code'))) {
      
      // 查找最近带有代码的消息
      const codeMessage = [...messages].reverse().find(m => m.code);
      
      if (codeMessage && codeMessage.code) {
        executeGeneratedCode(codeMessage.code);
      } else {
        const noCodeMessage: Message = { 
          text: '没有找到可执行的代码。', 
          sender: 'system',
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, noCodeMessage]);
      }
    }
  }, [messages]);

  useEffect(() => {
    // 滚动到聊天框底部
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // 渲染消息内容，支持Markdown
  const renderMessageContent = (text: string) => {
    return (
      <ReactMarkdown 
        className="text-sm markdown-content" 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {text}
      </ReactMarkdown>
    );
  };

  // 应用代码高亮的函数
  const applyHighlighting = useCallback(() => {
    setTimeout(() => {
      const codeBlocks = document.querySelectorAll('pre code.language-javascript');
      if (codeBlocks.length > 0) {
        codeBlocks.forEach(block => {
          hljs.highlightElement(block as HTMLElement);
        });
      }
    }, 100);
  }, []);
  
  // 在组件挂载和消息更新时应用高亮
  useEffect(() => {
    applyHighlighting();
  }, [messages, applyHighlighting]);
  
  // 窗口大小变化后滚动到底部
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [size]);

  // 渲染代码折叠框
  const renderCodeAccordion = (code: string) => {
    return (
      <Accordion 
        variant="bordered" 
        className="mt-2 bg-zinc-800/70 border border-zinc-600 rounded-lg"
        onExpandedChange={() => setTimeout(applyHighlighting, 50)}
      >
        <AccordionItem 
          key="code" 
          aria-label="查看可执行代码" 
          title={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-medium text-blue-300">查看可执行代码</span>
              <Button 
                size="sm" 
                color="success" 
                variant="shadow" 
                className="ml-2 h-7 px-3 py-0 text-xs bg-emerald-600 hover:bg-emerald-500"
                onClick={(e) => {
                  e.stopPropagation();
                  executeGeneratedCode(code);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                自动选择
              </Button>
            </div>
          }
        >
          <div className="markdown-content">
            <pre className="code-executable bg-zinc-900 p-3 rounded-md overflow-x-auto border border-zinc-700">
              <code className="language-javascript">{code}</code>
            </pre>
          </div>
        </AccordionItem>
      </Accordion>
    );
  };

  // 测试多份配料选择
  const testMultipleCondiments = () => {
    try {
      const testCode = `
        // 测试多份配料选择
        const targetBeverage = "coffee"; // 饮品ID
        const targetCondiments = [
          { id: "milk", quantity: 2 },
          { id: "sugar", quantity: 3 },
          { id: "vanilla", quantity: 1 }
        ];

        // 清空当前选择并返回到饮品选择页
        function clearCurrentSelection() {
          console.log('正在清空当前选择...');
          
          // 查找清空按钮并点击
          const clearButton = document.querySelector('button[title="清空订单"]');
          if (clearButton) {
            clearButton.click();
            console.log('已点击清空按钮');
            return true;
          }
          
          // 如果没找到清空按钮，可能是没有选择饮品，直接返回
          return true;
        }

        // 检查当前是否在配料选择页，如果是则返回到饮品选择页
        function checkAndReturnToBeveragePage(callback) {
          // 检查是否在配料选择页（通过查找返回按钮）
          const backButton = document.querySelector('button[aria-label="返回饮品选择"]');
          if (backButton) {
            console.log('当前在配料选择页，返回到饮品选择页');
            backButton.click();
            setTimeout(callback, 300);
          } else {
            // 如果已经在饮品选择页，直接执行回调
            callback();
          }
        }

        // 执行选择饮品
        function selectBeverage() {
          // 获取所有饮品卡片
          const beverageCards = document.querySelectorAll('[data-beverage-id]');
          let found = false;
          
          // 遍历查找目标饮品
          beverageCards.forEach(card => {
            const beverageId = card.getAttribute('data-beverage-id');
            if (beverageId === targetBeverage) {
              // 模拟点击选择饮品
              card.click();
              found = true;
              console.log(\`已选择饮品: \${beverageId}\`);
              
              // 选择饮品后，点击"添加配料"按钮
              setTimeout(() => {
                const addCondimentsBtn = document.querySelector('[data-action="add-condiments"]');
                if (addCondimentsBtn) {
                  addCondimentsBtn.click();
                  console.log('点击添加配料按钮');
                  
                  // 添加延迟以确保配料面板已加载
                  setTimeout(selectCondiments, 300);
                }
              }, 300);
            }
          });
          
          if (!found) {
            console.error(\`未找到指定饮品: \${targetBeverage}\`);
          }
        }

        // 执行选择配料
        function selectCondiments() {
          // 使用顺序处理配料，而不是并行处理
          const processCondiments = (index) => {
            if (index >= targetCondiments.length) {
              // 所有配料都处理完毕，点击下单按钮
              setTimeout(() => {
                const orderButton = document.querySelector('[data-action="place-order"]');
                if (orderButton) {
                  orderButton.click();
                  console.log('点击下单按钮');
                }
              }, 500);
              return;
            }
            
            const targetItem = targetCondiments[index];
            // 获取所有配料卡片
            const condimentCards = document.querySelectorAll('[data-condiment-id]');
            let found = false;
            
            // 遍历查找目标配料
            condimentCards.forEach(card => {
              const condimentId = card.getAttribute('data-condiment-id');
              if (condimentId === targetItem.id) {
                found = true;
                
                // 先检查当前已选择的份数（显示在UI上的数量）
                const quantityElement = card.querySelector('span.font-mono.text-white');
                let currentQuantity = 0;
                if (quantityElement) {
                  currentQuantity = parseInt(quantityElement.textContent || '0', 10) || 0;
                }
                
                // 如果已经有足够份数，不需要再点击
                if (currentQuantity >= targetItem.quantity) {
                  console.log(\`配料 \${condimentId} 已经有 \${currentQuantity} 份，无需再点击\`);
                  setTimeout(() => processCondiments(index + 1), 300);
                  return;
                }
                
                // 计算需要点击的次数（targetItem.quantity - currentQuantity）
                const clicksNeeded = targetItem.quantity - currentQuantity;
                console.log(\`配料 \${condimentId} 需要点击 \${clicksNeeded} 次，从 \${currentQuantity} 到 \${targetItem.quantity}\`);
                
                // 查找加号按钮
                const plusButton = card.querySelector('[data-action="increase"]');
                if (plusButton) {
                  // 逐个点击，每次点击之间添加延迟
                  const clickButton = (clickCount) => {
                    if (clickCount >= clicksNeeded) {
                      // 完成当前配料的点击，处理下一个配料
                      console.log(\`完成配料: \${condimentId}, 从 \${currentQuantity} 增加到 \${targetItem.quantity}\`);
                      setTimeout(() => processCondiments(index + 1), 300);
                      return;
                    }
                    
                    // 执行点击
                    plusButton.click();
                    console.log(\`点击配料: \${condimentId}, 第 \${clickCount + 1}次/\${clicksNeeded}次\`);
                    
                    // 延迟后进行下一次点击
                    setTimeout(() => clickButton(clickCount + 1), 150);
                  };
                  
                  // 开始点击
                  clickButton(0);
                } else {
                  // 如果找不到按钮，继续处理下一个配料
                  console.error(\`未找到配料增加按钮: \${condimentId}\`);
                  setTimeout(() => processCondiments(index + 1), 300);
                }
              }
            });
            
            if (!found) {
              console.error(\`未找到指定配料: \${targetItem.id}\`);
              // 继续处理下一个配料
              setTimeout(() => processCondiments(index + 1), 300);
            }
          };
          
          // 开始处理第一个配料
          processCondiments(0);
        }

        // 开始执行自动选择流程
        clearCurrentSelection();
        checkAndReturnToBeveragePage(function() {
          setTimeout(selectBeverage, 500);
        });
      `;
      
      executeGeneratedCode(testCode);
      
      // 添加一条消息到聊天
      setMessages(prev => [...prev, {
        text: "正在测试多份配料选择功能...",
        sender: 'system',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('测试多份配料选择失败:', error);
      setMessages(prev => [...prev, {
        text: `测试失败: ${error instanceof Error ? error.message : String(error)}`,
        sender: 'system',
        timestamp: Date.now()
      }]);
    }
  };

  // 处理大小调整
  const handleResize = (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    const newSize = { width: size.width, height: size.height };
    setSize(newSize);
    
    // 保存到本地存储
    try {
      localStorage.setItem('chatbot-size', JSON.stringify(newSize));
    } catch (e) {
      console.error('Failed to save size to localStorage:', e);
    }
  };

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
        <ResizableBox
          width={size.width}
          height={size.height}
          minConstraints={[300, 400]}
          maxConstraints={[800, 800]}
          resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 's', 'n']}
          onResize={handleResize}
          className="resize-container"
        >
          <Card className="w-full h-full flex flex-col bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-white shadow-2xl overflow-hidden">
            <CardHeader className="handle flex justify-between items-center cursor-grab active:cursor-grabbing p-3 bg-zinc-800/80 border-b border-zinc-700">
              <div className="flex flex-col">
                <h4 className="font-bold text-medium">智能助手</h4>
                {availableProviders.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        isSelected={useAI}
                        onValueChange={setUseAI}
                        color="primary"
                      />
                      <span className="text-xs">使用大模型</span>
                    </div>
                    
                    {useAI && (
                      <div className="flex flex-wrap gap-2 items-center">
                        {/* 提供商选择 */}
                        <Dropdown>
                          <DropdownTrigger>
                            <Button 
                              size="sm" 
                              variant="flat" 
                              className="text-xs h-6 min-w-0 px-2 bg-zinc-800 text-blue-300 border border-zinc-600"
                            >
                              {selectedProvider || '选择提供商'}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu 
                            aria-label="提供商选择"
                            variant="flat"
                            disallowEmptySelection
                            selectionMode="single"
                            selectedKeys={new Set([selectedProvider])}
                            onSelectionChange={(selection) => {
                              const selected = Array.from(selection)[0] as string;
                              if (selected) setSelectedProvider(selected);
                            }}
                            classNames={{
                              base: "bg-zinc-800 border border-zinc-600"
                            }}
                          >
                            {availableProviders.map((provider) => (
                              <DropdownItem key={provider} className="text-white hover:bg-zinc-700 data-[selected=true]:bg-blue-800 data-[selected=true]:text-white">
                                {provider}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                        
                        {/* 模型选择 */}
                        {selectedProvider && providerModels[selectedProvider]?.length > 0 && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button 
                                size="sm" 
                                variant="flat" 
                                className="text-xs h-6 min-w-0 px-2 bg-zinc-800 text-blue-300 border border-zinc-600"
                              >
                                {selectedModel || '选择模型'}
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu 
                              aria-label="模型选择"
                              variant="flat"
                              disallowEmptySelection
                              selectionMode="single"
                              selectedKeys={new Set([selectedModel])}
                              onSelectionChange={(selection) => {
                                const selected = Array.from(selection)[0] as string;
                                if (selected) setSelectedModel(selected);
                              }}
                              classNames={{
                                base: "bg-zinc-800 border border-zinc-600"
                              }}
                            >
                              {providerModels[selectedProvider].map((model) => (
                                <DropdownItem key={model} className="text-white hover:bg-zinc-700 data-[selected=true]:bg-blue-800 data-[selected=true]:text-white">
                                  {model}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  onPress={testMultipleCondiments}
                  className="h-7 px-2 min-w-0"
                  title="测试多份配料功能"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </Button>
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
              </div>
            </CardHeader>
            <ScrollShadow hideScrollBar ref={chatBodyRef} className="flex-grow p-3">
              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`py-2 px-3 rounded-2xl max-w-[85%] w-fit ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 self-end rounded-br-none' 
                        : msg.sender === 'system'
                          ? 'bg-orange-600 self-start rounded-bl-none'
                          : 'bg-zinc-700 self-start rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    ) : (
                      renderMessageContent(msg.text)
                    )}
                    
                    {msg.modelInfo && (
                      <div className="mt-1 text-xs text-zinc-300 flex items-center">
                        <Tooltip content={`提供者: ${msg.modelInfo.provider || '未知'}, 模型: ${msg.modelInfo.model || '未知'}`}>
                          <Chip size="sm" variant="flat" className="bg-zinc-800 text-xs h-5 border border-zinc-600 text-blue-300">
                            {msg.modelInfo.provider || '大模型'} {msg.modelInfo.model ? `(${msg.modelInfo.model})` : ''} {msg.modelInfo.error ? '(错误)' : ''}
                          </Chip>
                        </Tooltip>
                      </div>
                    )}
                    
                    {msg.code && renderCodeAccordion(msg.code)}
                  </div>
                ))}
                {isLoading && (
                  <div className="py-2 px-3 rounded-2xl bg-zinc-700 self-start rounded-bl-none max-w-[85%] w-fit">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
                      <span className="text-sm text-gray-300">思考中...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollShadow>
            <CardFooter className="m-1 bg-zinc-800/50">
              <Input
                fullWidth
                placeholder="输入消息..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                variant="bordered"
                disabled={isLoading}
                classNames={{
                  inputWrapper: "border-zinc-600",
                }}
              />
              <Button 
                isIconOnly
                color="primary" 
                className="ml-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700"
                onPress={handleSendMessage}
                isLoading={isLoading}
                aria-label="Send Message"
              >
                {!isLoading && <SendIcon />}
              </Button>
            </CardFooter>
          </Card>
        </ResizableBox>
      </div>
    </Draggable>
  );
};