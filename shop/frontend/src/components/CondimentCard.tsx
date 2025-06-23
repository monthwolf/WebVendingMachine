import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Chip } from '@nextui-org/react';
import { Condiment } from '../types';

export interface CondimentCardProps {
  condiment: Condiment;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const CondimentCard: React.FC<CondimentCardProps> = ({
  condiment,
  quantity,
  onQuantityChange
}) => {
  return (
    <Card
      className={`
        w-full transition-all duration-300
        ${quantity > 0 ? 'scale-102 shadow-xl border-2 border-secondary' : 'hover:scale-101'}
        bg-gradient-to-b from-gray-800 to-gray-900
      `}
    >
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative w-full aspect-[4/3]">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50 z-10" />
          <Image
            src={condiment.image}
            alt={condiment.name}
            radius="none"
            classNames={{
              wrapper: "!w-full !h-full",
              img: "w-full h-full object-cover"
            }}
          />
          <div className="absolute top-2 right-2 z-20">
            <Chip
              color="warning"
              variant="shadow"
              size="sm"
              className="font-bold border border-warning/30"
            >
              ¥{condiment.price.toFixed(2)}
            </Chip>
          </div>
          {quantity > 0 && (
            <div className="absolute top-2 left-2 z-20">
              <Chip
                color="secondary"
                variant="shadow"
                size="sm"
                className="font-bold border border-secondary/30"
              >
                x{quantity}
              </Chip>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardBody className="p-2 gap-1">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-medium text-white">{condiment.name}</h4>
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-2">
          {condiment.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Chip
            size="sm"
            variant="bordered"
            color="warning"
          >
            {condiment.category}
          </Chip>
          <Chip
            size="sm"
            variant="bordered"
            color="success"
          >
            {condiment.calories} 卡路里
          </Chip>
        </div>
      </CardBody>
      
      <CardFooter className="justify-between p-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            color="danger"
            isIconOnly
            onPress={() => onQuantityChange(Math.max(0, quantity - 1))}
            className="bg-danger/20 hover:bg-danger/30"
          >
            -
          </Button>
          <span className="font-medium text-white w-4 text-center">{quantity}</span>
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            isIconOnly
            onPress={() => onQuantityChange(quantity + 1)}
            className="bg-secondary/20 hover:bg-secondary/30"
          >
            +
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 