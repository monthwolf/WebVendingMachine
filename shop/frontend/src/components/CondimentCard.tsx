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
  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <Card className={`w-full ${quantity > 0 ? 'border-2 border-primary' : ''}`}>
      {condiment.image && (
        <CardHeader className="p-0">
          <Image
            src={condiment.image}
            alt={condiment.name}
            className="w-full h-32 object-cover"
          />
        </CardHeader>
      )}
      
      <CardBody className="gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-large">{condiment.name}</h4>
          <Chip color="warning" variant="flat" size="sm">
            ¥{condiment.price.toFixed(2)}
          </Chip>
        </div>
        
        <p className="text-small text-default-500 line-clamp-2">
          {condiment.description}
        </p>
        
        <div className="flex items-center gap-1">
          <span className="text-default-500 text-small">热量:</span>
          <Chip size="sm" variant="flat" color="danger">
            {condiment.calories} 卡路里
          </Chip>
        </div>
      </CardBody>
      
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={handleDecrement}
            isDisabled={quantity === 0}
          >
            -
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            isIconOnly
            size="sm"
            color="primary"
            variant="light"
            onPress={handleIncrement}
          >
            +
          </Button>
        </div>
        {quantity > 0 && (
          <p className="text-small text-default-500">
            小计: ¥{(condiment.price * quantity).toFixed(2)}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}; 