import React, { useRef } from 'react';
import gsap from 'gsap';

interface BeverageImageProps {
  type: string;
  size?: number;
  animate?: boolean;
  imageSrc?: string;
}

export const BeverageImage: React.FC<BeverageImageProps> = ({ 
  type,
  size = 100,
  animate = false,
  imageSrc
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLImageElement>(null);
  const beverageImageRef = useRef<HTMLImageElement>(null);
  
  // 鼠标悬停动画
  const handleMouseEnter = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  };
  
  const handleMouseLeave = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  };

  return (
    <div className="flex items-center justify-center py-5">
      <div 
        ref={containerRef}
        className="cursor-pointer relative"
        style={{ 
          width: `${size}px`,
          height: `${size * 2}px`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* 瓶子图像 */}
        <img 
          ref={bottleRef}
          src="/images/bottle.svg" 
          alt="Bottle"
          className="w-full h-full absolute top-0 left-0 z-10"
        />
        
        {/* 饮料图像，放在瓶子里面 */}
        {imageSrc && (
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/4 h-1/2 overflow-hidden z-0">
            <img
              ref={beverageImageRef}
              src={imageSrc}
              alt={type}
              className="w-full h-full object-contain"
              style={{
                mixBlendMode: 'multiply',
                opacity: 0.9,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 