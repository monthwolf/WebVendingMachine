import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Chip } from '@nextui-org/react';
import { Beverage } from '../types';
import gsap from 'gsap';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 初始动画设置
  useEffect(() => {
    if (cardRef.current) {
      // 卡片初始化动画
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          ease: "power3.out",
          clearProps: "all" 
        }
      );
    }
  }, []);
  
  // 处理选中状态的动画
  useEffect(() => {
    if (cardRef.current) {
      if (isSelected) {
        // 选中时的动画
        gsap.to(cardRef.current, {
          scale: 1.05,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "2px solid #06b6d4", // primary color
          duration: 0.3,
          ease: "back.out(1.7)"
        });
        
        // 图片轻微放大
        if (imageRef.current) {
          gsap.to(imageRef.current.querySelector('img'), {
            scale: 1.05,
            duration: 0.4,
            ease: "power2.out"
          });
        }
        
        // 内容轻微上移
        if (contentRef.current) {
          gsap.to(contentRef.current, {
            y: -5,
            duration: 0.3,
            ease: "power1.out"
          });
        }
      } else {
        // 未选中时恢复默认状态
        gsap.to(cardRef.current, {
          scale: 1,
          boxShadow: "",
          border: "",
          duration: 0.3,
          ease: "power3.out"
        });
        
        // 图片恢复原始大小
        if (imageRef.current) {
          gsap.to(imageRef.current.querySelector('img'), {
            scale: 1,
            duration: 0.4,
            ease: "power2.out"
          });
        }
        
        // 内容恢复位置
        if (contentRef.current) {
          gsap.to(contentRef.current, {
            y: 0,
            duration: 0.3,
            ease: "power1.out"
          });
        }
      }
    }
  }, [isSelected]);
  
  // 鼠标悬停动画
  const handleMouseEnter = () => {
    if (!isSelected && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1.02,
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // 图片轻微放大并添加光晕效果
      if (imageRef.current) {
        gsap.to(imageRef.current.querySelector('img'), {
          scale: 1.03,
          filter: "brightness(1.05)",
          duration: 0.3,
          ease: "power1.out"
        });
      }
    }
  };
  
  const handleMouseLeave = () => {
    if (!isSelected && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.inOut"
      });
      
      // 图片恢复正常
      if (imageRef.current) {
        gsap.to(imageRef.current.querySelector('img'), {
          scale: 1,
          filter: "brightness(1)",
          duration: 0.3,
          ease: "power1.inOut"
        });
      }
    }
  };

  return (
    <Card
      isPressable
      isHoverable
      className="w-full bg-gradient-to-b from-gray-800 to-gray-900"
      onPress={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
      data-beverage-id={beverage.id}
    >
      <CardHeader className="p-0 overflow-hidden">
        <div ref={imageRef} className="relative w-full aspect-[4/3]">
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
              <div className="bg-primary text-white px-4 py-2 rounded-full font-bold">
                已选择
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardBody>
        <div ref={contentRef}>
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
        </div>
      </CardBody>
    </Card>
  );
}; 