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
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };
    fetchData();
  }, []);

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
        setSelectedBeverage(null);
        setSelectedCondiments([]);
        setShowCondiments(false);
        fetchHistoryData();
        fetchRecommendationData();
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  const beverageRows = chunk(Object.entries(beverages), 3);
  const condimentRows = chunk(Object.entries(condiments), 3);

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
          <div key={`bev-row-${rowIndex}`}>
            <div className="grid grid-cols-3 gap-4">
              {row.map(([id, beverage]) => (
                <div key={id} className="flex flex-col items-center gap-2">
                  <BeverageCard
                    beverage={{ ...(beverage as Beverage), id }}
                    isSelected={selectedBeverage === id}
                    onSelect={() => handleBeverageSelect(id)}
                  />
                  <div
                    className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                      selectedBeverage === id ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-700'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 h-2 w-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full shadow-inner" />
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
              {row.map(([id, condiment]) => {
                const selected = selectedCondiments.find(c => c.id === id);
                return (
                  <CondimentCard
                    key={id}
                    condiment={{ ...(condiment as Condiment), id }}
                    quantity={selected?.quantity || 0}
                    onQuantityChange={(q) => handleCondimentQuantityChange(id, q)}
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