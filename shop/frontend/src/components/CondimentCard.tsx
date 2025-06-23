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
      className={`w-full ${quantity > 0 ? 'border-2 border-secondary' : ''}`}
    >
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={condiment.image}
            alt={condiment.name}
            radius="none"
            classNames={{
              wrapper: "!w-full !h-full",
              img: "w-full h-full object-cover"
            }}
          />
          <div className="absolute top-2 right-2 z-10">
            <Chip color="warning" variant="solid" size="sm">
              ¥{condiment.price.toFixed(2)}
            </Chip>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-large">{condiment.name}</h4>
        </div>
        
        <p className="text-small text-default-500 line-clamp-2">
          {condiment.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Chip
            size="sm"
            variant="flat"
            color="default"
          >
            {condiment.category}
          </Chip>
          <Chip
            size="sm"
            variant="flat"
            color="danger"
          >
            {condiment.calories} 卡路里
          </Chip>
        </div>
      </CardBody>
      
      <CardFooter className="gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => quantity > 0 && onQuantityChange(quantity - 1)}
            isDisabled={quantity === 0}
          >
            -
          </Button>
          <span className="text-small font-medium w-4 text-center">{quantity}</span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onQuantityChange(quantity + 1)}
          >
            +
          </Button>
        </div>
        <Button
          color={quantity > 0 ? "secondary" : "default"}
          variant={quantity > 0 ? "solid" : "bordered"}
          size="sm"
          onPress={() => onQuantityChange(quantity > 0 ? 0 : 1)}
        >
          {quantity > 0 ? '已添加' : '添加'}
        </Button>
      </CardFooter>
    </Card>
  );
}; 