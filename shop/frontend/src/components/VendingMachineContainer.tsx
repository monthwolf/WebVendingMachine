import React from 'react';

interface VendingMachineContainerProps {
  mainPanel: React.ReactNode;
  sidePanel: React.ReactNode;
}

const VendingMachineContainer: React.FC<VendingMachineContainerProps> = ({
  mainPanel,
  sidePanel,
}) => {
  return (
    <div className="relative w-full p-4 sm:p-8">
      {/* 售货机外壳 */}
      <div className="relative mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-gray-700 to-gray-800 p-2 shadow-2xl">
        {/* 金属纹理边框 */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-gray-600 to-gray-700 opacity-50 shadow-inner" />
        
        {/* 机器显示屏和按钮区域 */}
        <div className="relative rounded-2xl bg-gray-800 p-6 shadow-inner">
          {/* 金属纹理装饰条 */}
          <div className="absolute top-0 left-1/2 h-2 w-1/3 -translate-x-1/2 transform rounded-b-lg bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600" />
          
          {/* 主要内容区域 */}
          <div className="grid grid-cols-12 gap-6">
            {/* 主动态面板 (饮料/配料) */}
            <div className="col-span-12 lg:col-span-8 rounded-xl bg-gray-900 p-4 shadow-inner">
              {mainPanel}
            </div>
            
            {/* 侧边控制面板 (订单/控制器) */}
            <div className="col-span-12 lg:col-span-4">
              {sidePanel}
            </div>
          </div>
          
          {/* 出货口 */}
          <div className="mt-8 mx-auto w-1/2 lg:w-1/3 h-10 bg-gradient-to-b from-gray-900 to-black rounded-t-xl shadow-inner flex items-center justify-center p-1">
            <div className="w-full h-full bg-black/50 rounded-t-lg flex items-center justify-center">
                <span className="text-xs font-mono text-gray-500 tracking-widest">PUSH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendingMachineContainer; 