import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Divider, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { Order, Beverage, Condiment } from '../types';

interface CondimentQuantity {
  id: string;
  quantity: number;
}

interface OrderSummaryProps {
  selectedBeverage: string | null;
  selectedCondiments: CondimentQuantity[];
  beverages: Record<string, Beverage>;
  condiments: Record<string, Condiment>;
  order: Order | null;
  onPlaceOrder: () => void;
  isLoading: boolean;
}

// 定义订单项接口
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  type: 'beverage' | 'condiment';
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedBeverage,
  selectedCondiments,
  beverages,
  condiments,
  order,
  onPlaceOrder,
  isLoading
}) => {
  // 支付模态框状态
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isPaymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // 计算总价
  const calculateTotalPrice = () => {
    if (!selectedBeverage || !beverages[selectedBeverage]) return 0;
    
    let total = beverages[selectedBeverage].price;
    
    selectedCondiments.forEach(condiment => {
      if (condiments[condiment.id]) {
        total += condiments[condiment.id].price * condiment.quantity;
      }
    });
    
    return total;
  };
  
  // 计算总热量
  const calculateTotalCalories = () => {
    if (!selectedBeverage || !beverages[selectedBeverage]) return 0;
    
    let total = beverages[selectedBeverage].calories;
    
    selectedCondiments.forEach(condiment => {
      if (condiments[condiment.id]) {
        total += condiments[condiment.id].calories * condiment.quantity;
      }
    });
    
    return total;
  };

  // 准备订单项数据
  const orderItems: OrderItem[] = [];
  if (selectedBeverage && beverages[selectedBeverage]) {
    orderItems.push({
      name: beverages[selectedBeverage].name,
      price: beverages[selectedBeverage].price,
      quantity: 1,
      type: 'beverage'
    });
  }

  selectedCondiments.forEach(condiment => {
    if (condiments[condiment.id]) {
      orderItems.push({
        name: condiments[condiment.id].name,
        price: condiments[condiment.id].price * condiment.quantity,
        quantity: condiment.quantity,
        type: 'condiment'
      });
    }
  });

  // 处理支付按钮点击
  const handlePayment = () => {
    setPaymentModalOpen(true);
  };

  // 处理支付过程
  const handleProcessPayment = async () => {
    setPaymentProcessing(true);
    try {
      // 模拟支付过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentComplete(true);
      // 模拟支付完成后的处理
      setTimeout(() => {
        setPaymentModalOpen(false);
        setPaymentProcessing(false);
        setPaymentComplete(false);
        onPlaceOrder();
      }, 1000);
    } catch (error) {
      console.error('支付处理失败:', error);
      setPaymentProcessing(false);
    }
  };

  // 检查是否有商品被选中
  const hasItemsSelected = selectedBeverage !== null;

  return (
    <>
      <Card className="w-full shadow-sm">
        <CardHeader className="flex justify-between items-center bg-primary-500 text-white">
          <h4 className="font-bold text-large">订单摘要</h4>
          {paymentComplete && <Chip color="success" variant="shadow">已支付</Chip>}
        </CardHeader>
        <CardBody>
          {hasItemsSelected ? (
            <>
              {/* 订单项表格 */}
              <div className="w-full mb-4">
                <div className="grid grid-cols-12 font-medium text-small pb-2 border-b">
                  <div className="col-span-6">商品</div>
                  <div className="col-span-3 text-right">单价</div>
                  <div className="col-span-3 text-right">小计</div>
                </div>
                
                {orderItems.map((item, index) => (
                  <div 
                    key={`${item.type}-${index}`} 
                    className="grid grid-cols-12 py-2 border-b border-dashed"
                  >
                    <div className="col-span-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        {item.type === 'condiment' && item.quantity > 1 && (
                          <span className="text-xs text-default-400">x{item.quantity}</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      ¥{(item.price / (item.type === 'condiment' ? item.quantity : 1)).toFixed(2)}
                    </div>
                    <div className="col-span-3 text-right font-medium">
                      ¥{item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Divider className="my-3" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">总价</p>
                  <p className="text-tiny text-default-500">
                    总热量: {calculateTotalCalories()} 卡路里
                  </p>
                </div>
                <Chip color="warning" size="lg" variant="shadow" className="font-bold">
                  ¥{calculateTotalPrice().toFixed(2)}
                </Chip>
              </div>
              
              {order && (
                <>
                  <Divider className="my-3" />
                  <div>
                    <h5 className="font-medium mb-1">订单状态:</h5>
                    <Chip 
                      color={
                        order.status === 'completed' ? 'success' :
                        order.status === 'processing' ? 'primary' :
                        order.status === 'cancelled' ? 'danger' : 'warning'
                      }
                      variant="flat"
                    >
                      {
                        order.status === 'completed' ? '已完成' :
                        order.status === 'processing' ? '制作中' :
                        order.status === 'cancelled' ? '已取消' : '待处理'
                      }
                    </Chip>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-default-500">
              <div className="text-3xl mb-3">🛒</div>
              <p>请先选择一个饮料</p>
            </div>
          )}
        </CardBody>
        <CardFooter className="flex flex-col gap-2">
          {hasItemsSelected && !paymentComplete && (
            <Button
              color="success"
              className="w-full"
              onClick={handlePayment}
              size="lg"
              variant="shadow"
              startContent={<span className="text-lg">💳</span>}
              isDisabled={isLoading}
            >
              前往支付
            </Button>
          )}
          
          {paymentComplete && (
            <div className="w-full p-2 bg-success-100 text-success rounded-medium text-center">
              ✅ 支付成功
            </div>
          )}
        </CardFooter>
      </Card>

      {/* 支付模态框 */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => !isPaymentProcessing && setPaymentModalOpen(false)}
        isDismissable={!isPaymentProcessing}
        placement="center"
        backdrop="blur"
        classNames={{
          body: "py-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {paymentComplete ? '支付成功' : '确认支付'}
              </ModalHeader>
              <ModalBody>
                {paymentComplete ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-large font-medium text-success">支付成功！</p>
                    <p className="text-center text-default-500 mt-2">
                      您已成功支付 ¥{calculateTotalPrice().toFixed(2)}
                    </p>
                    <p className="text-center text-default-500 mt-1">
                      您的饮料正在制作中，请稍候...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-default-100 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-2">订单详情</h5>
                      {orderItems.map((item, index) => (
                        <div key={`modal-${item.type}-${index}`} className="flex justify-between mb-2">
                          <span>{item.name}{item.type === 'condiment' && item.quantity > 1 ? ` x${item.quantity}` : ''}</span>
                          <span>¥{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      <Divider className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>总计</span>
                        <span>¥{calculateTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-center text-default-500">
                      请选择支付方式完成订单
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <Button color="primary" variant="flat" className="flex-1">
                        <span className="text-lg mr-1">💳</span> 银行卡
                      </Button>
                      <Button color="success" variant="flat" className="flex-1">
                        <span className="text-lg mr-1">📱</span> 移动支付
                      </Button>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                {paymentComplete ? (
                  <Button color="success" variant="light" onPress={onClose} className="w-full">
                    关闭
                  </Button>
                ) : (
                  <>
                    <Button color="danger" variant="light" onPress={onClose}>
                      取消
                    </Button>
                    <Button
                      color="success" 
                      onPress={handleProcessPayment}
                      isLoading={isPaymentProcessing}
                      className="font-medium"
                    >
                      {isPaymentProcessing ? '处理中...' : '确认支付'}
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}; 