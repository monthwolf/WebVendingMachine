import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Chip } from '@nextui-org/react';
import { Condiment } from '../types';
import gsap from 'gsap';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonPlusRef = useRef<HTMLButtonElement>(null);
  const buttonMinusRef = useRef<HTMLButtonElement>(null);
  
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
  
  // 处理选中状态的动画(根据数量判断)
  useEffect(() => {
    if (cardRef.current) {
      if (quantity > 0) {
        // 选中时的动画
        gsap.to(cardRef.current, {
          scale: 1.02,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "2px solid #d946ef", // secondary color
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
            y: -3,
            duration: 0.3,
            ease: "power1.out"
          });
        }
        
        // 按钮动画
        if (buttonPlusRef.current) {
          gsap.to(buttonPlusRef.current, {
            backgroundColor: "rgba(217, 70, 239, 0.6)",
            scale: 1.05,
            duration: 0.2,
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
        
        // 按钮恢复
        if (buttonPlusRef.current) {
          gsap.to(buttonPlusRef.current, {
            backgroundColor: "rgba(217, 70, 239, 0.5)",
            scale: 1,
            duration: 0.2,
            ease: "power1.out"
          });
        }
      }
    }
  }, [quantity]);
  
  // 鼠标悬停动画
  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
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
      
      // 按钮突出显示
      if (buttonPlusRef.current) {
        gsap.to(buttonPlusRef.current, {
          backgroundColor: "rgba(217, 70, 239, 0.7)",
          scale: 1.1,
          duration: 0.3,
          ease: "back.out(1.5)"
        });
      }
    }
  };
  
  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        duration: 0.3,
        ease: "power2.inOut"
      });
      
      // 图片恢复正常
      if (imageRef.current) {
        gsap.to(imageRef.current.querySelector('img'), {
          scale: quantity > 0 ? 1.05 : 1,
          filter: "brightness(1)",
          duration: 0.3,
          ease: "power1.inOut"
        });
      }
      
      // 按钮恢复
      if (buttonPlusRef.current) {
        gsap.to(buttonPlusRef.current, {
          backgroundColor: quantity > 0 ? "rgba(217, 70, 239, 0.6)" : "rgba(217, 70, 239, 0.5)",
          scale: quantity > 0 ? 1.05 : 1,
          duration: 0.3,
          ease: "power1.inOut"
        });
      }
    }
  };
  
  // 按钮点击动画
  const handlePlusClick = () => {
    if (buttonPlusRef.current) {
      gsap.timeline()
        .to(buttonPlusRef.current, {
          scale: 0.9,
          duration: 0.1,
          ease: "power1.in"
        })
        .to(buttonPlusRef.current, {
          scale: quantity > 0 ? 1.05 : 1,
          duration: 0.2,
          ease: "back.out(1.5)"
        });
    }
    onQuantityChange(quantity + 1);
  };
  
  const handleMinusClick = () => {
    if (buttonMinusRef.current) {
      gsap.timeline()
        .to(buttonMinusRef.current, {
          scale: 0.9,
          duration: 0.1,
          ease: "power1.in"
        })
        .to(buttonMinusRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.5)"
        });
    }
    onQuantityChange(Math.max(0, quantity - 1));
  };

  return (
    <Card
      className="w-full bg-gradient-to-b from-gray-800 to-gray-900"
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="p-0 overflow-hidden">
        <div ref={imageRef} className="relative w-full aspect-[4/3]">
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
      
      <CardBody>
        <div ref={contentRef}>
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-medium text-white">{condiment.name}</h4>
          </div>
          
          <p className="text-xs text-gray-400 line-clamp-2">
            {condiment.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mt-2">
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
        </div>
      </CardBody>
      
      <CardFooter className="justify-between p-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            color="default"
            isIconOnly
            ref={buttonMinusRef}
            onPress={handleMinusClick}
            className="bg-danger/50 hover:bg-danger/60 font-bold text-lg flex items-center justify-center text-white"
          >
            -
          </Button>
          <span className="font-medium text-white w-4 text-center">{quantity}</span>
          <Button
            size="sm"
            variant="flat"
            color="default"
            isIconOnly
            ref={buttonPlusRef}
            onPress={handlePlusClick}
            className="bg-secondary/50 hover:bg-secondary/60 font-bold text-lg flex items-center justify-center text-white"
          >
            +
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 