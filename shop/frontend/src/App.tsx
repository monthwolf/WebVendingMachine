import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent,
  Tabs, 
  Tab, 
  Card, 
  CardBody,
  Divider,
  Button
} from '@nextui-org/react';
import { BeverageCard } from './components/BeverageCard';
import { CondimentCard } from './components/CondimentCard';
import { OrderSummary } from './components/OrderSummary';
import { ChatBot } from './components/ChatBot';
import { OrderHistory } from './components/OrderHistory';
import { 
  fetchBeverages,
  fetchCondiments,
  placeOrder,
  fetchOrderHistory,
  fetchRecommendation
} from './services/api';
import { Beverage, Condiment, Order, Recommendation } from './types';
import VendingMachineContainer from './components/VendingMachineContainer';
import './App.css';
import beverages from './config/beverages';
import condiments from './config/condiments';
import { ControlPanel } from './components/ControlPanel';

type OrderFlowStatus = 'ready' | 'selecting' | 'processing' | 'dispensing';

interface CondimentQuantity {
  id: string;
  quantity: number;
}

// Helper function to chunk array into rows
const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const App: React.FC = () => {
  const [beverages, setBeverages] = useState<Record<string, Beverage>>({});
  const [condiments, setCondiments] = useState<Record<string, Condiment>>({});
  const [selectedBeverage, setSelectedBeverage] = useState<string | null>(null);
  const [showCondiments, setShowCondiments] = useState(false);
  const [selectedCondiments, setSelectedCondiments] = useState<CondimentQuantity[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("vending");

  // New states for ControlPanel interactivity
  const [keypadInput, setKeypadInput] = useState('');
  const [orderFlowStatus, setOrderFlowStatus] = useState<OrderFlowStatus>('ready');

  // Map for beverage codes (e.g., 'A1' -> 'americano')
  const [beverageCodeMap, setBeverageCodeMap] = useState<Record<string, string>>({});

  // 获取饮料和配料数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [beveragesData, condimentsData] = await Promise.all([
          fetchBeverages(),
          fetchCondiments()
        ]);
        setBeverages(beveragesData);
        setCondiments(condimentsData);

        // Create beverage code map
        const codeMap: Record<string, string> = {};
        const beverageEntries = Object.keys(beveragesData);
        const beverageRows = chunk(beverageEntries, 3);
        beverageRows.forEach((row, rowIndex) => {
          row.forEach((beverageId, colIndex) => {
            const code = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
            codeMap[code] = beverageId;
          });
        });
        setBeverageCodeMap(codeMap);

      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };
    fetchData();
  }, []);

  // Update order flow status based on app state
  useEffect(() => {
    if (loading) {
      setOrderFlowStatus('processing');
    } else if (selectedBeverage) {
      setOrderFlowStatus('selecting');
    } else {
      setOrderFlowStatus('ready');
    }
  }, [selectedBeverage, loading]);
  
  // Handlers for Control Panel
  const handleInteractionStart = () => {
    if(selectedBeverage) {
      setSelectedBeverage(null);
    }
  }

  const handleKeypadPress = (key: string) => {
    handleInteractionStart();
    const currentLetter = keypadInput.match(/^[A-Z]/);
    const currentDigits = keypadInput.match(/\d/g) || [];
    
    if (/[A-Z]/.test(key)) {
       setKeypadInput(key);
    } else if (/\d/.test(key) && currentLetter && currentDigits.length < 1) {
       setKeypadInput(prev => `${prev}${key}`);
    } else if (!currentLetter && beverageRows.length > 0) {
      // If no letter, start with A and the number
      setKeypadInput(`A${key}`);
    }
  };

  const handleRowChange = (direction: 'up' | 'down') => {
    handleInteractionStart();
    const rows = beverageRows.map((_, i) => String.fromCharCode(65 + i));
    if (rows.length === 0) return;
    
    const currentLetter = keypadInput.match(/^[A-Z]/);
    let currentIndex = currentLetter ? rows.indexOf(currentLetter[0]) : -1;

    if (direction === 'up') {
      currentIndex = currentIndex <= 0 ? rows.length - 1 : currentIndex - 1;
    } else {
      currentIndex = currentIndex >= rows.length - 1 ? 0 : currentIndex + 1;
    }
    setKeypadInput(rows[currentIndex]);
  }

  const handleKeypadClear = () => {
    setKeypadInput('');
  };

  const handleKeypadEnter = () => {
    const beverageId = beverageCodeMap[keypadInput.toUpperCase()];
    if (beverageId) {
      handleBeverageSelect(beverageId);
    }
    setKeypadInput('');
  };

  // 获取推荐
  const fetchRecommendationData = useCallback(async () => {
    try {
      const response = await fetchRecommendation();
      if (response.success && response.data) {
        setRecommendation(response.data.recommendation);
      }
    } catch (error) {
      console.error('获取推荐失败:', error);
    }
  }, []);

  // 获取历史订单
  const fetchHistoryData = useCallback(async () => {
    try {
      const response = await fetchOrderHistory();
      if (response.success && response.data) {
        setOrderHistory(response.data.history);
      }
    } catch (error) {
      console.error('获取历史订单失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
    fetchRecommendationData();
  }, [fetchHistoryData, fetchRecommendationData]);

  const handleBeverageSelect = (beverageId: string) => {
    if (selectedBeverage === beverageId) {
      setSelectedBeverage(null);
      setShowCondiments(false);
    } else {
      setSelectedBeverage(beverageId);
      setShowCondiments(false);
    }
  };

  const handleCondimentQuantityChange = (condimentId: string, quantity: number) => {
    setSelectedCondiments(prev => {
      const existing = prev.find(c => c.id === condimentId);
      if (quantity > 0) {
        if (existing) {
          return prev.map(c => c.id === condimentId ? { ...c, quantity } : c);
        } else {
          return [...prev, { id: condimentId, quantity }];
        }
      } else {
        return prev.filter(c => c.id !== condimentId);
      }
    });
    setOrder(null);
  };

  const handleGoToCondiments = () => {
    if (selectedBeverage) {
      setShowCondiments(true);
    }
  };
  
  const handleGoToBeverages = () => {
    setShowCondiments(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedBeverage) return;
    setLoading(true);
    try {
      const response = await placeOrder(selectedBeverage, selectedCondiments);
      if (response.success && response.data) {
        setOrder(response.data.order);
        setOrderFlowStatus('dispensing');
        setTimeout(() => {
          setSelectedBeverage(null);
          setSelectedCondiments([]);
          setShowCondiments(false);
          setOrder(null);
          fetchHistoryData();
          setOrderFlowStatus('ready');
        }, 2500);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBeverageCode = (beverageId: string): string | null => {
    return Object.keys(beverageCodeMap).find(code => beverageCodeMap[code] === beverageId) || null;
  }

  const beverageRows = chunk(Object.keys(beverages), 3);
  const condimentRows = chunk(Object.keys(condiments), 3);

  // Panel for Beverage Selection
  const beverageSection = (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">选择饮品</h2>
        {selectedBeverage ? (
          <Button color="warning" variant="shadow" onPress={handleGoToCondiments}>
            选择配料
          </Button>
        ) : (
          <div className="mt-1 h-1 w-32 rounded bg-primary-500" />
        )}
      </div>
      <div className="flex flex-col gap-4">
        {beverageRows.map((row, rowIndex) => (
          <div key={`bev-row-${rowIndex}`} className="flex items-center gap-4">
            <div className="font-mono text-4xl font-bold text-gray-700">
              {String.fromCharCode(65 + rowIndex)}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                {row.map((beverageId) => {
                  const code = getBeverageCode(beverageId);
                  return (
                    <div key={beverageId} className="flex flex-col items-center gap-2">
                      <BeverageCard
                        beverage={{ ...(beverages[beverageId] as Beverage), id: beverageId }}
                        code={code}
                        isSelected={selectedBeverage === beverageId}
                        onSelect={() => handleBeverageSelect(beverageId)}
                      />
                      <div
                        className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                          selectedBeverage === beverageId ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 h-2 w-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full shadow-inner" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Panel for Condiment Selection
  const condimentSection = (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">选择配料</h2>
        <Button size="sm" color="warning" variant="bordered" onPress={handleGoToBeverages}>
          返回选择饮品
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {condimentRows.map((row, rowIndex) => (
          <div key={`cond-row-${rowIndex}`}>
            <div className="grid grid-cols-3 gap-4">
              {row.map((condimentId) => {
                const selected = selectedCondiments.find(c => c.id === condimentId);
                return (
                  <CondimentCard
                    key={condimentId}
                    condiment={{ ...(condiments[condimentId] as Condiment), id: condimentId }}
                    quantity={selected?.quantity || 0}
                    onQuantityChange={(q) => handleCondimentQuantityChange(condimentId, q)}
                  />
                );
              })}
            </div>
            <div className="mt-2 h-2 w-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full shadow-inner" />
          </div>
        ))}
      </div>
    </div>
  );

  // Side Panel with Order Summary and Controls
  const sidePanel = (
    <ControlPanel
      orderSection={
        <OrderSummary
          selectedBeverage={selectedBeverage}
          selectedCondiments={selectedCondiments}
          beverages={beverages}
          condiments={condiments}
          order={order}
          onPlaceOrder={handlePlaceOrder}
          isLoading={loading}
        />
      }
      selectedBeverageCode={selectedBeverage ? getBeverageCode(selectedBeverage) : null}
      keypadInput={keypadInput}
      orderStatus={orderFlowStatus}
      onKeypadPress={handleKeypadPress}
      onClearPress={handleKeypadClear}
      onEnterPress={handleKeypadEnter}
      onRowChange={handleRowChange}
    />
  );

  return (
    <div className="App min-h-screen bg-gray-900">
      <div className="container mx-auto px-4">
        <Tabs 
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key.toString())}
          className="pt-4"
          classNames={{
            tabList: "bg-gray-800 p-0.5 rounded-lg",
            cursor: "bg-gray-700",
            tab: "text-gray-400 data-[selected=true]:text-white",
          }}
        >
          <Tab key="vending" title="自动售货机">
            <VendingMachineContainer
              mainPanel={showCondiments && selectedBeverage ? condimentSection : beverageSection}
              sidePanel={sidePanel}
            />
          </Tab>
          <Tab key="history" title="历史订单">
            <div className="p-4">
              <OrderHistory 
                orders={orderHistory} 
                beverages={beverages} 
                condiments={condiments} 
              />
            </div>
          </Tab>
        </Tabs>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <ChatBot />
      </div>
    </div>
  );
};

export default App; 