
'use client';

import { Waybill } from '@/types/waybill';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';

interface WaybillStickerProps {
  waybill: Waybill;
  boxNumber?: number;
  totalBoxes?: number;
}

export function WaybillSticker({ waybill, boxNumber, totalBoxes }: WaybillStickerProps) {
  
  const sizeClasses = 'w-[72.2122mm] h-[72.2122mm] p-2';
  const baseClasses = "bg-white text-black font-sans flex flex-col border-2 border-black print:border-2 print:shadow-none";

  return (
    <div className={cn(baseClasses, sizeClasses)}>
        {/* Top: Barcode and Waybill Number - Height: 35% */}
        <div className="text-center border-b-2 border-black flex flex-col items-center justify-center" style={{ height: '35%' }}>
            <div className={cn("mx-auto flex justify-center items-center", 'w-full h-auto')}>
                <Barcode 
                  value={waybill.waybillNumber} 
                  height={40} 
                  displayValue={false} 
                  width={2} 
                  margin={0}
                />
            </div>
            <p className={cn("text-center font-mono pt-1", 'tracking-[0.2em] text-lg')}>{waybill.waybillNumber}</p>
        </div>

        {/* Middle: Sender City - Height: 30% */}
        <div className="flex flex-col items-center justify-center border-b-2 border-black" style={{ height: '30%' }}>
            <p className="text-xs uppercase text-gray-500">From</p>
            <p className={cn("font-black tracking-tighter leading-none", 'text-4xl')}>{(waybill.senderCity || '').toUpperCase()}</p>
        </div>

        {/* Bottom: Receiver City and Box Count - Height: 35% */}
        <div className="flex items-center justify-between pt-2" style={{ height: '35%' }}>
            <div className="text-center flex-grow">
                 <p className="text-xs uppercase text-gray-500">To</p>
                 <p className={cn("font-black tracking-tighter leading-none", 'text-4xl')}>{(waybill.receiverCity || '').toUpperCase()}</p>
                 <p className="text-sm font-semibold">{waybill.receiverName}</p>
            </div>
            {boxNumber && totalBoxes && (
                <div className="text-center p-2 border-l-2 border-black pl-4 h-full flex flex-col justify-center">
                    <p className="text-xs uppercase text-gray-500">Box</p>
                    <p className={cn("font-black", 'text-3xl')}>{boxNumber}/{totalBoxes}</p>
                </div>
            )}
        </div>
    </div>
  );
}
