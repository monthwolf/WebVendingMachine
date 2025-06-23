import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Chip } from '@nextui-org/react';
import { Beverage } from '../types';

export interface BeverageCardProps {
  beverage: Beverage;
  code: string | null;
  isSelected: boolean;
  onSelect: () => void;
}

export const BeverageCard: React.FC<BeverageCardProps> = ({
  beverage,
  code,
  isSelected,
  onSelect
}) => {
  return (
    <Card
      isPressable
      isHoverable
      className={`
        w-full transition-all duration-300
        ${isSelected ? 'scale-105 shadow-xl border-2 border-primary' : 'hover:scale-102'}
        bg-gradient-to-b from-gray-800 to-gray-900
      `}
      onPress={onSelect}
    >
      <CardHeader className="p-0 overflow-hidden">
        <div className="relative w-full aspect-[4/3]">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50 z-10" />
          <Image
            src={beverage.image}
            alt={beverage.name}
            radius="none"
            classNames={{
              wrapper: "!w-full !h-full",
              img: "w-full h-full object-cover"
            }}
          />
          {code && (
            <div className="absolute top-2 left-2 z-20">
              <Chip
                color="secondary"
                variant="shadow"
                size="sm"
                className="font-mono font-bold border border-white/20"
              >
                {code}
              </Chip>
            </div>
          )}
          <div className="absolute top-2 right-2 z-20">
            <Chip
              color="warning"
              variant="shadow"
              size="sm"
              className="font-bold border border-warning/30"
            >
              ¥{beverage.price.toFixed(2)}
            </Chip>
          </div>
          {isSelected && (
            <div className="absolute inset-0 bg-primary/20 z-10 flex items-center justify-center">
              <div className="bg-primary text-white px-4 py-2 rounded-full font-bold transform -rotate-12">
                已选择
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardBody className="gap-2">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-large text-white">{beverage.name}</h4>
        </div>
        
        <p className="text-small text-gray-400 line-clamp-2">
          {beverage.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Chip
            size="sm"
            variant="bordered"
            color={beverage.hot ? "danger" : "secondary"}
          >
            {beverage.hot ? "热饮" : "冷饮"}
          </Chip>
          <Chip
            size="sm"
            variant="bordered"
            color="warning"
          >
            {beverage.category}
          </Chip>
          <Chip
            size="sm"
            variant="bordered"
            color="success"
          >
            {beverage.calories} 卡路里
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
}; 