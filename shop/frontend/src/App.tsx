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

interface CondimentQuantity {
  id: string;
  quantity: number;
}

const App: React.FC = () => {
  const [beverages, setBeverages] = useState<Record<string, Beverage>>({});
  const [condiments, setCondiments] = useState<Record<string, Condiment>>({});
  const [selectedBeverage, setSelectedBeverage] = useState<string | null>(null);
  const [selectedCondiments, setSelectedCondiments] = useState<CondimentQuantity[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");

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

  // 选择饮料
  const handleBeverageSelect = (beverageId: string) => {
    setSelectedBeverage(beverageId);
  };

  // 选择/取消选择配料
  const handleCondimentToggle = (condimentId: string) => {
    setSelectedCondiments((prev) => {
      const existingCondiment = prev.find(c => c.id === condimentId);
      if (existingCondiment) {
        return prev.filter(c => c.id !== condimentId);
      } else {
        return [...prev, { id: condimentId, quantity: 1 }];
      }
    });
    setOrder(null);
  };

  // 更新配料数量
  const handleCondimentQuantityChange = (condimentId: string, quantity: number) => {
    setSelectedCondiments((prev) => {
      if (quantity === 0) {
        return prev.filter(c => c.id !== condimentId);
      }
      const existingIndex = prev.findIndex(c => c.id === condimentId);
      if (existingIndex >= 0) {
        const newCondiments = [...prev];
        newCondiments[existingIndex] = { ...newCondiments[existingIndex], quantity };
        return newCondiments;
      }
      return [...prev, { id: condimentId, quantity }];
    });
    setOrder(null);
  };

  // 使用推荐
  const handleUseRecommendation = () => {
    if (recommendation) {
      setSelectedBeverage(recommendation.beverage);
      setSelectedCondiments(recommendation.condiments.map(c => ({ id: c, quantity: 1 })));
      setOrder(null);
    }
  };

  // 提交订单
  const handlePlaceOrder = async () => {
    if (!selectedBeverage) return;

    setLoading(true);
    try {
      const response = await placeOrder(selectedBeverage, selectedCondiments);
      if (response.success && response.data) {
        setOrder(response.data.order);
        // 重置选择
        setSelectedBeverage(null);
        setSelectedCondiments([]);
        // 刷新历史订单
        fetchHistoryData();
        // 获取新的推荐
        fetchRecommendationData();
      }
    } catch (error) {
      console.error('提交订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">智能饮品机</p>
        </NavbarBrand>
      </Navbar>

      <div className="container mx-auto max-w-7xl pt-4 px-2 sm:px-4 md:px-6">
        <Tabs 
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key.toString())}
          className="justify-center"
          size="lg"
        >
          <Tab key="1" title="点单">
            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-9 flex flex-col gap-4">
                  <Card>
                    <CardBody>
                      <h3 className="text-xl font-bold mb-4">选择饮料</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(beverages).map((beverage) => (
                          <div key={beverage.id}>
                            <BeverageCard
                              beverage={beverage}
                              isSelected={selectedBeverage === beverage.id}
                              onSelect={() => handleBeverageSelect(beverage.id)}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Divider className="my-4" />
                      
                      <h3 className="text-xl font-bold mb-4">选择配料</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(condiments).map((condiment) => {
                          const selectedCondiment = selectedCondiments.find(c => c.id === condiment.id);
                          return (
                            <div key={condiment.id}>
                              <CondimentCard
                                condiment={condiment}
                                quantity={selectedCondiment?.quantity || 0}
                                onQuantityChange={(quantity) => handleCondimentQuantityChange(condiment.id, quantity)}
                              />
                            </div>
                          );
                        })}
                      </div>
                      
                      {recommendation && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <h4 className="font-bold mb-2">今日推荐</h4>
                          <p className="text-sm mb-2">{recommendation.explanation}</p>
                          <div className="flex justify-end">
                            <button
                              onClick={handleUseRecommendation}
                              className="text-primary text-sm font-medium bg-blue-100 dark:bg-blue-800/60 px-3 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                            >
                              使用推荐
                            </button>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
                
                <div className="lg:col-span-3">
                  <div className="sticky top-4 space-y-4">
                    <OrderSummary
                      selectedBeverage={selectedBeverage}
                      selectedCondiments={selectedCondiments}
                      beverages={beverages}
                      condiments={condiments}
                      order={order}
                      onPlaceOrder={handlePlaceOrder}
                      isLoading={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          
          <Tab key="2" title="历史订单">
            <div className="mt-6">
              <OrderHistory 
                orders={orderHistory} 
                beverages={beverages} 
                condiments={condiments} 
              />
            </div>
          </Tab>

          <Tab key="3" title="AI助手">
            <div className="mt-6">
              <Card>
                <CardBody>
                  <h3 className="text-xl font-bold mb-4">智能助手</h3>
                  <div className="max-w-3xl mx-auto">
                    <ChatBot />
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default App; 