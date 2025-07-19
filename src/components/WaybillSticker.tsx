
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
  
  const sizeClasses = 'w-[75mm] h-[75mm] p-2';
  const baseClasses = "bg-white text-black font-sans flex flex-col border-2 border-black print:border-2 print:shadow-none";

  return (
    <div className={cn(baseClasses, sizeClasses)}>
        {/* Top: Barcode and Waybill Number */}
        <div className="text-center border-b-2 border-black pb-2 flex flex-col items-center justify-center">
            <div className={cn("mx-auto", 'w-full h-auto')}>
                <Barcode 
                  value={waybill.waybillNumber} 
                  height={40} 
                  displayValue={false} 
                  width={2} 
                  margin={0}
                />
            </div>
            <p className={cn("text-center font-mono", 'tracking-[0.2em] text-lg')}>{waybill.waybillNumber}</p>
        </div>

        {/* Middle: Sender City */}
        <div className="flex-grow flex flex-col items-center justify-center border-b-2 border-black">
            <p className="text-xs uppercase text-gray-500">From</p>
            <p className={cn("font-black tracking-tighter leading-none", 'text-4xl')}>{(waybill.senderCity || '').toUpperCase()}</p>
        </div>

        {/* Bottom: Receiver City and Box Count */}
        <div className="flex-grow flex items-center justify-between pt-2">
            <div className="text-center">
                 <p className="text-xs uppercase text-gray-500">To</p>
                 <p className={cn("font-black tracking-tighter leading-none", 'text-4xl')}>{(waybill.receiverCity || '').toUpperCase()}</p>
                 <p className="text-sm font-semibold">{waybill.receiverName}</p>
            </div>
            {boxNumber && totalBoxes && (
                <div className="text-center p-2 border-l-2 border-black pl-4">
                    <p className="text-xs uppercase text-gray-500">Box</p>
                    <p className={cn("font-black", 'text-3xl')}>{boxNumber}/{totalBoxes}</p>
                </div>
            )}
        </div>
    </div>
  );
}
