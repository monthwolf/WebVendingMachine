import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import Bottle3D from './3D/Bottle3D';

interface VendingMachineContainerProps {
  mainPanel: React.ReactNode;
  sidePanel: React.ReactNode;
  orderFlowStatus: 'ready' | 'selecting' | 'processing' | 'dispensing';
  dispensedBeverageImage: string | null;
}

const VendingMachineContainer: React.FC<VendingMachineContainerProps> = ({
  mainPanel,
  sidePanel,
  orderFlowStatus,
  dispensedBeverageImage,
}) => {
  const isDispensing = orderFlowStatus === 'dispensing';
  const flapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispenserContainerRef = useRef<HTMLDivElement>(null);
  const [startBottleAnimation, setStartBottleAnimation] = useState(false);
  const [flapOpened, setFlapOpened] = useState(false);
  
  // 调试输出
  useEffect(() => {
    console.log('VendingMachineContainer rendered');
    console.log('Order flow status:', orderFlowStatus);
    console.log('Is dispensing:', isDispensing);
    console.log('Dispensed beverage image:', dispensedBeverageImage);
    console.log('Start bottle animation:', startBottleAnimation);
  }, [orderFlowStatus, isDispensing, dispensedBeverageImage, startBottleAnimation]);
  
  // 处理出货口盖子动画
  useEffect(() => {
    if (isDispensing && flapRef.current) {
      console.log('Starting flap animation');
      setFlapOpened(false);
      setStartBottleAnimation(false);
      
      // 出货口盖子动画
      gsap.timeline()
        .to(flapRef.current, {
          rotateX: -90,
          duration: 0.6,
          ease: "power2.inOut",
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
          onComplete: () => {
            // 盖子打开后，开始瓶子动画
            setFlapOpened(true);
            setStartBottleAnimation(true);
            console.log('Flap opened, starting bottle animation');
          }
        })
        .to(flapRef.current, {
          rotateX: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)",
          delay: 2.5
        });
      
      // 售货机震动效果
      if (containerRef.current) {
        gsap.timeline({ delay: 1.2 })
          .to(containerRef.current, {
            x: -2,
            duration: 0.05,
            ease: "none"
          })
          .to(containerRef.current, {
            x: 2,
            duration: 0.05,
            ease: "none",
            repeat: 2,
            yoyo: true
          })
          .to(containerRef.current, {
            x: -3,
            duration: 0.06,
            delay: 0.5,
            ease: "none"
          })
          .to(containerRef.current, {
            x: 3,
            duration: 0.06,
            ease: "none",
            repeat: 3,
            yoyo: true
          })
          .to(containerRef.current, {
            x: 0,
            duration: 0.1,
            ease: "power1.out"
          });
      }
    } else {
      // 重置状态
      setFlapOpened(false);
      setStartBottleAnimation(false);
    }
  }, [isDispensing]);

  // 处理瓶子动画完成事件
  const handleBottleAnimationComplete = () => {
    console.log('Bottle animation complete');
  };

  return (
    <div className="relative w-full p-4 sm:p-8">
      {/* 售货机外壳 */}
      <div 
        ref={containerRef} 
        className="relative mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-gray-700 to-gray-800 p-2 shadow-2xl"
      >
        {/* 金属纹理边框 */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-gray-600 to-gray-700 opacity-50 shadow-inner" />
        
        {/* 机器显示屏和按钮区域 */}
        <div className="relative rounded-2xl bg-gray-800 p-6 shadow-inner flex flex-col">
          {/* 金属纹理装饰条 */}
          <div className="absolute top-0 left-1/2 h-2 w-1/3 -translate-x-1/2 transform rounded-b-lg bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600" />
          
          {/* 主要内容区域 - 第一行 */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* 主动态面板 (饮料/配料) */}
            <div className="flex-1 rounded-xl bg-gray-900 p-4 shadow-inner">
              {mainPanel}
            </div>
            
            {/* 侧边控制面板 (订单/控制器) */}
            <div className="lg:w-1/4 min-w-[250px]">
              {sidePanel}
            </div>
          </div>
          
          {/* 出货口 - 第二行，独占一行 */}
          <div className="mt-4 flex justify-center items-center">
            {/* 出货口背景 */}
            <div className="w-4/5 h-64 mx-auto bg-gray-900 rounded-t-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/30 rounded-t-xl"></div>
              
              {/* 出货口盖子 */}
              <div 
                ref={flapRef}
                className="w-full h-16 bg-gradient-to-b from-gray-800 to-black rounded-t-xl shadow-inner flex items-center justify-center p-1 absolute bottom-0 z-20"
              >
                <div className="w-full h-full bg-black/50 rounded-t-lg flex items-center justify-center">
                  <span className="text-sm font-mono text-gray-500 tracking-widest">PUSH</span>
                </div>
              </div>
              
              {/* 饮料容器区域 - 调整高度，确保能看到瓶子从上到下的动画 */}
              <div 
                ref={dispenserContainerRef}
                className="absolute top-0 left-0 right-0 bottom-16 z-10"
                style={{ 
                  perspective: '800px'
                }}
              >
                {/* 3D瓶子 */}
                {isDispensing && dispensedBeverageImage && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: '0', 
                      right: '0', 
                      top: '0', 
                      bottom: '0',
                      zIndex: 15
                    }}
                  >
                    <Bottle3D
                      beverageImage={dispensedBeverageImage}
                      isRolling={startBottleAnimation}
                      onAnimationComplete={handleBottleAnimationComplete}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendingMachineContainer; 