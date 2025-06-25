import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Image,
  Chip
} from '@nextui-org/react';
import { Order, Beverage, Condiment, OrderItem } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  beverages: Record<string, Beverage>;
  condiments: Record<string, Condiment>;
}

const statusColorMap = {
  pending: 'warning',
  processing: 'primary',
  completed: 'success',
  cancelled: 'danger'
} as const;

const statusTextMap = {
  pending: '待处理',
  processing: '制作中',
  completed: '已完成',
  cancelled: '已取消'
} as const;

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, beverages, condiments }) => {
  if (!orders || orders.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white shadow-lg">
        <CardHeader>
          <h3 className="text-xl font-bold">订单历史</h3>
        </CardHeader>
        <CardBody className="text-center text-zinc-400">
          <p>暂无历史订单。</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const orderItems: OrderItem[] = Array.isArray(order.items) ? order.items : [];
        const beverageItem = orderItems.find(item => item.type === 'beverage');
        const beverage = beverageItem ? beverages[beverageItem.id] : null;
        
        const condimentItems = orderItems.filter(item => item.type === 'condiment');
        const condimentsTotal = condimentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        return (
          <Card key={order.id} className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 text-white shadow-lg border border-zinc-700">
            <CardHeader className="justify-between items-start">
              <div className="flex gap-4">
                {beverage && (
                    <Image
                      src={beverage.image}
                      alt={beverage.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                )}
                <div>
                  <p className="text-large font-bold">{beverage ? beverage.name : '未知饮品'}</p>
                  <p className="text-sm text-zinc-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Chip color="success" variant="shadow" className="font-bold">
                  总计: ¥{order.total.toFixed(2)}
                </Chip>
                <span className="text-xs text-zinc-500 mt-1">{order.status}</span>
              </div>
            </CardHeader>
            <Divider className="bg-zinc-700" />
            <CardBody>
                <div className="space-y-3">
                    {beverageItem && (
                        <div className="flex justify-between items-center text-zinc-300">
                            <span>{beverage?.name || '饮品'}</span>
                            <span>¥{beverageItem.price.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
                      <p className="font-medium text-zinc-400">配料:</p>
                      {condimentItems.length > 0 ? (
                        condimentItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm text-zinc-300">
                                <span>{condiments[item.id]?.name || '未知配料'} x {item.quantity}</span>
                                <span>¥{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500 italic">无额外配料</p>
                      )}
                    </div>

                    {condimentItems.length > 0 && (
                      <>
                        <Divider className="bg-zinc-700 my-1" />
                        <div className="flex justify-between items-center font-semibold text-zinc-200">
                            <span>配料合计</span>
                            <span>¥{condimentsTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}; 