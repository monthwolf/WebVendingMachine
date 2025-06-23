import React from 'react';
import { Button } from '@nextui-org/react';

interface ControlPanelProps {
  orderSection: React.ReactNode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ orderSection }) => {
  return (
    <div className="rounded-xl bg-gray-900 p-4 shadow-inner flex flex-col justify-between sticky top-10">
      {/* Order Summary Section */}
      <div className="flex-grow min-h-0">
        {orderSection}
      </div>

      {/* Decorative Controls Section */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        {/* Status Lights */}
        <div className="flex items-center justify-around mb-4">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
            <span className="text-xs text-gray-400 mt-1">就绪</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse" />
            <span className="text-xs text-gray-400 mt-1">制作中</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />
            <span className="text-xs text-gray-400 mt-1">制冷</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse" />
            <span className="text-xs text-gray-400 mt-1">加热</span>
          </div>
        </div>
        
        {/* Keypad & Coin Slot */}
        <div className="flex items-center justify-between space-x-4 bg-gray-900/50 rounded-xl p-3">
          <div className="flex flex-col items-center gap-2">
            {/* Coin slot */}
            <div className="h-10 w-2 bg-gray-600 rounded-full shadow-inner" />
            {/* Change return */}
            <div className="h-4 w-10 bg-gray-700 rounded-md shadow-inner" />
          </div>

          {/* Small LCD and Keypad */}
          <div className="flex-grow flex flex-col gap-2">
             <div className="bg-black/80 w-full h-10 rounded-lg p-1 shadow-inner flex items-center justify-end">
                <div className="bg-blue-900/50 w-full h-full rounded-md p-1 font-mono text-cyan-300 text-xl text-right">
                   A1
                </div>
             </div>
             <div className="grid grid-cols-3 gap-1">
                {Array.from({length: 9}).map((_, i) => (
                   <Button key={i} isIconOnly size="sm" className="bg-gray-700 text-gray-300">{i + 1}</Button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 