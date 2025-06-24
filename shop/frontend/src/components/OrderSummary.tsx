import React from 'react';
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
  onClearOrder: () => void;
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
  isLoading,
  onClearOrder
}) => {
  const [isPaymentModalOpen, setPaymentModalOpen] = React.useState(false);
  const [isPaymentProcessing, setPaymentProcessing] = React.useState(false);
  const [paymentComplete, setPaymentComplete] = React.useState(false);
  
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
      <div className="flex flex-col">
        <Card className="w-full flex-grow flex flex-col shadow-sm bg-gradient-to-b from-gray-800 to-gray-900">
          <CardHeader className="flex justify-between items-center bg-gradient-to-r from-primary to-secondary">
            <h4 className="font-bold text-large text-white">订单摘要</h4>
            <div className="flex items-center gap-2">
              {hasItemsSelected && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="danger"
                  className="min-w-0 w-8 h-8"
                  onPress={onClearOrder}
                  aria-label="清空订单"
                  title="清空订单"
                  isDisabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </Button>
              )}
              {paymentComplete && (
                <Chip color="success" variant="shadow" className="border-2 border-white/20">
                  已支付
                </Chip>
              )}
            </div>
          </CardHeader>
          
          <CardBody className="flex-grow overflow-y-auto pr-2">
            {hasItemsSelected ? (
              <>
                <div className="w-full mb-4">
                  <div className="grid grid-cols-12 font-medium text-small pb-2 border-b border-gray-700">
                    <div className="col-span-6 text-gray-300">商品</div>
                    <div className="col-span-3 text-right text-gray-300">单价</div>
                    <div className="col-span-3 text-right text-gray-300">小计</div>
                  </div>
                  
                  {orderItems.map((item, index) => (
                    <div 
                      key={`${item.type}-${index}`} 
                      className="grid grid-cols-12 py-2 border-b border-gray-700/50"
                    >
                      <div className="col-span-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{item.name}</span>
                          {item.type === 'condiment' && item.quantity > 1 && (
                            <span className="text-xs text-gray-400">x{item.quantity}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 text-right text-gray-300">
                        ¥{(item.price / (item.type === 'condiment' ? item.quantity : 1)).toFixed(2)}
                      </div>
                      <div className="col-span-3 text-right font-medium text-white">
                        ¥{item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Divider className="my-3 bg-gray-700" />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">总价</p>
                    <p className="text-tiny text-gray-400">
                      总热量: {calculateTotalCalories()} 卡路里
                    </p>
                  </div>
                  <Chip
                    color="warning"
                    size="lg"
                    variant="shadow"
                    className="font-bold border-2 border-warning/20"
                  >
                    ¥{calculateTotalPrice().toFixed(2)}
                  </Chip>
                </div>
                
                {order && (
                  <>
                    <Divider className="my-3 bg-gray-700" />
                    <div>
                      <h5 className="font-medium text-white mb-1">订单状态:</h5>
                      <Chip 
                        color={
                          order.status === 'completed' ? 'success' :
                          order.status === 'processing' ? 'primary' :
                          order.status === 'cancelled' ? 'danger' : 'warning'
                        }
                        variant="shadow"
                        className="border-2 border-white/20"
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
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="text-3xl mb-3">🛒</div>
                <p>请先选择一个饮料</p>
              </div>
            )}
          </CardBody>
          
          <CardFooter className="mt-auto">
            <Button
              color="primary"
              className="w-full font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onPress={handlePayment}
              isDisabled={!hasItemsSelected || isLoading}
              isLoading={isLoading}
              data-action="place-order"
            >
              {isLoading ? '处理中...' : '立即支付'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => !isPaymentProcessing && setPaymentModalOpen(false)}
        isDismissable={!isPaymentProcessing}
        hideCloseButton={isPaymentProcessing}
        classNames={{
          base: "bg-gradient-to-b from-gray-800 to-gray-900",
          header: "border-b border-gray-700",
          body: "py-6",
          footer: "border-t border-gray-700"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h4 className="text-white font-bold">
                  {paymentComplete ? '支付成功' : '确认支付'}
                </h4>
              </ModalHeader>
              <ModalBody>
                {paymentComplete ? (
                  <div className="text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-success font-medium">您的订单已支付成功！</p>
                  </div>
                ) : isPaymentProcessing ? (
                  <div className="text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <p className="text-white">正在处理您的支付...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-white mb-2">订单详情</h5>
                      {orderItems.map((item, index) => (
                        <div key={`modal-${item.type}-${index}`} className="flex justify-between mb-2">
                          <span className="text-gray-300">
                            {item.name}
                            {item.type === 'condiment' && item.quantity > 1 ? ` x${item.quantity}` : ''}
                          </span>
                          <span className="text-white font-medium">
                            ¥{item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <Divider className="my-2 bg-gray-700" />
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-300">总计</span>
                        <span className="text-white">¥{calculateTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-center text-gray-400 mb-4">
                      请选择支付方式完成订单
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button 
                        color="primary" 
                        variant="shadow"
                        className="flex-1 bg-gradient-to-r from-primary to-secondary"
                        onPress={handleProcessPayment}
                        isDisabled={isPaymentProcessing}
                      >
                        <span className="text-lg mr-1">💳</span> 银行卡
                      </Button>
                      <Button 
                        color="success" 
                        variant="shadow"
                        className="flex-1 bg-gradient-to-r from-success to-success-500"
                        onPress={handleProcessPayment}
                        isDisabled={isPaymentProcessing}
                      >
                        <span className="text-lg mr-1">📱</span> 移动支付
                      </Button>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                {!isPaymentProcessing && !paymentComplete && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    className="text-gray-400 hover:text-danger"
                  >
                    取消
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}; 