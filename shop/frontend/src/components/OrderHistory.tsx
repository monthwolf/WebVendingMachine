import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Image,
  Chip
} from '@nextui-org/react';
import { Order, Beverage, Condiment } from '../types';

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

export const OrderHistory: React.FC<OrderHistoryProps> = ({ 
  orders,
  beverages,
  condiments
}) => {
  if (!orders.length) {
    return (
      <Card className="w-full">
        <CardBody className="flex flex-col items-center justify-center py-8 text-default-500">
          <div className="text-3xl mb-3">📝</div>
          <p>暂无订单历史</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="w-full">
          <CardHeader className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-small text-default-500">
                订单 #{order.id}
              </p>
              <p className="text-small text-default-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <Chip
              color={statusColorMap[order.status]}
              variant="flat"
            >
              {statusTextMap[order.status]}
            </Chip>
          </CardHeader>
          <Divider/>
          <CardBody>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={`${item.beverage}-${index}`} className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {beverages[item.beverage]?.name || item.beverage}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.condiments.map((condiment, idx) => (
                          <Chip
                            key={`${condiment.id}-${idx}`}
                            size="sm"
                            variant="flat"
                            color="default"
                          >
                            {condiments[condiment.id]?.name || condiment.id} x{condiment.quantity}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <p className="font-medium">
                      ¥{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Divider className="my-4"/>
            <div className="flex justify-end items-center">
              <Chip
                color="warning"
                size="lg"
                variant="flat"
                className="font-bold"
              >
                总计: ¥{order.total.toFixed(2)}
              </Chip>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}; 