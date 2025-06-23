import React from 'react';

interface BeverageImageProps {
  type: string;
  size?: number;
  animate?: boolean;
}

export const BeverageImage: React.FC<BeverageImageProps> = ({ 
  type,
  size = 100,
  animate = false
}) => {
  // 根据饮料类型返回不同的表情符号和背景色
  const getBeverageEmoji = () => {
    switch (type.toLowerCase()) {
      case 'coffee':
      case 'coffees':
        return { emoji: '☕', filter: 'drop-shadow(0 0 8px rgba(193, 154, 107, 0.6))' };
      case 'cola':
      case 'coke':
        return { emoji: '🥤', filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.4))' };
      case 'tea':
        return { emoji: '🍵', filter: 'drop-shadow(0 0 8px rgba(22, 163, 74, 0.4))' };
      case 'juice':
        return { emoji: '🧃', filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' };
      case 'energy':
        return { emoji: '⚡', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' };
      case 'water':
        return { emoji: '💧', filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))' };
      default:
        return { emoji: '🥤', filter: 'drop-shadow(0 0 8px rgba(100, 100, 100, 0.4))' };
    }
  };

  const { emoji, filter } = getBeverageEmoji();
  const animationClass = animate ? 'hover:scale-110 transition-transform' : '';

  return (
    <div 
      className={`flex items-center justify-center ${animationClass} py-5`}
      style={{ 
        fontSize: `${size * 0.8}px`,
        filter: filter
      }}
    >
      {emoji}
    </div>
  );
}; 