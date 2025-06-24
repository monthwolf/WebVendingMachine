import React from 'react';
import { Button } from '@nextui-org/react';

interface ControlPanelProps {
  orderSection: React.ReactNode;
  selectedBeverageCode: string | null;
  keypadInput: string;
  orderStatus: 'ready' | 'selecting' | 'processing' | 'dispensing';
  onKeypadPress: (key: string) => void;
  onClearPress: () => void;
  onEnterPress: () => void;
  onRowChange: (direction: 'up' | 'down') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  orderSection,
  selectedBeverageCode,
  keypadInput,
  orderStatus,
  onKeypadPress,
  onClearPress,
  onEnterPress,
  onRowChange
 }) => {

  const getStatusLightClass = (lightStatus: typeof orderStatus) => {
    const baseClass = "h-3 w-3 rounded-full transition-all";
    if (orderStatus === lightStatus) {
      switch (lightStatus) {
        case 'ready': return `${baseClass} bg-green-500 shadow-lg shadow-green-500/50 animate-pulse`;
        case 'processing': return `${baseClass} bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse`;
        case 'selecting': return `${baseClass} bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse`;
        default: return `${baseClass} bg-gray-600`;
      }
    }
    return `${baseClass} bg-gray-800 shadow-inner`;
  };

  const displayValue = keypadInput || selectedBeverageCode || '----';

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
            <div className={getStatusLightClass('ready')} />
            <span className="text-xs text-gray-400 mt-1">就绪</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={getStatusLightClass('selecting')} />
            <span className="text-xs text-gray-400 mt-1">选择中</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={getStatusLightClass('processing')} />
            <span className="text-xs text-gray-400 mt-1">制作中</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={getStatusLightClass('dispensing')} />
            <span className="text-xs text-gray-400 mt-1">出货中</span>
          </div>
        </div>
        
        {/* Keypad & Coin Slot */}
        <div className="flex items-stretch justify-between space-x-4 bg-gray-900/50 rounded-xl p-3">
          <div className="flex flex-col items-center justify-center gap-2">
            {/* Row selection buttons */}
            <Button isIconOnly size="sm" className="bg-gray-700 text-gray-300" aria-label="Row Up" onPress={() => onRowChange('up')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </Button>
            <Button isIconOnly size="sm" className="bg-gray-700 text-gray-300" aria-label="Row Down" onPress={() => onRowChange('down')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </Button>
          </div>

          {/* Small LCD and Keypad */}
          <div className="flex-grow flex flex-col gap-2">
             <div className="bg-black/80 w-full h-10 rounded-lg p-1 shadow-inner flex items-center justify-end">
                <div className="bg-blue-900/50 w-full h-full rounded-md p-1 font-mono text-cyan-300 text-xl text-right">
                   {displayValue}
                </div>
             </div>
             <div className="grid grid-cols-3 gap-1 place-items-center">
                {'123456789'.split('').map((num) => (
                   <Button key={num} isIconOnly size="sm" className="bg-gray-700 text-gray-300" onPress={() => onKeypadPress(num)}>{num}</Button>
                ))}
                 <Button isIconOnly size="sm" className="bg-red-700 text-gray-300" onPress={onClearPress}>C</Button>
                 <Button isIconOnly size="sm" className="bg-gray-700 text-gray-300" onPress={() => onKeypadPress('0')}>0</Button>
                 <Button isIconOnly size="sm" className="bg-green-700 text-gray-300" onPress={onEnterPress}>E</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 