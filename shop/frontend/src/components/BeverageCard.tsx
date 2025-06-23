import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Chip } from '@nextui-org/react';
import { Beverage } from '../types';

export interface BeverageCardProps {
  beverage: Beverage;
  isSelected: boolean;
  onSelect: () => void;
}

export const BeverageCard: React.FC<BeverageCardProps> = ({
  beverage,
  isSelected,
  onSelect
}) => {
  return (
    <Card
      isPressable
      isHoverable
      className={`w-full ${isSelected ? 'border-2 border-secondary' : ''}`}
      onPress={onSelect}
    >
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={beverage.image}
            alt={beverage.name}
            radius="none"
            classNames={{
              wrapper: "!w-full !h-full",
              img: "w-full h-full object-cover"
            }}
          />
          <div className="absolute top-2 right-2 z-10">
            <Chip color="warning" variant="solid" size="sm">
              ¥{beverage.price.toFixed(2)}
            </Chip>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-large">{beverage.name}</h4>
        </div>
        
        <p className="text-small text-default-500 line-clamp-2">
          {beverage.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={beverage.hot ? "danger" : "secondary"}
          >
            {beverage.hot ? "热饮" : "冷饮"}
          </Chip>
          <Chip
            size="sm"
            variant="flat"
            color="default"
          >
            {beverage.category}
          </Chip>
        </div>
      </CardBody>
      
      <CardFooter className="gap-2 justify-between">
        <div className="flex items-center gap-1">
          <span className="text-default-500 text-small">热量:</span>
          <Chip size="sm" variant="flat" color="danger">
            {beverage.calories} 卡路里
          </Chip>
        </div>
        <Button
          color={isSelected ? "secondary" : "default"}
          variant={isSelected ? "solid" : "bordered"}
          size="sm"
          onPress={onSelect}
        >
          {isSelected ? '已选择' : '选择'}
        </Button>
      </CardFooter>
    </Card>
  );
}; 