
'use client';

import { Waybill } from '@/types/waybill';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';

interface WaybillStickerProps {
  waybill: Waybill;
  stickerSize?: string;
  boxNumber?: number;
  totalBoxes?: number;
}

export function WaybillSticker({ waybill, stickerSize = '75mm', boxNumber, totalBoxes }: WaybillStickerProps) {
  
  const sizeClasses = {
    '4x6': 'w-[4in] h-[6in] p-4 text-base',
    '3x2': 'w-[3in] h-[2in] p-2 text-sm',
    '75mm': 'w-[75mm] h-[75mm] p-2',
    '100x75mm': 'w-[100mm] h-[75mm] p-2'
  };

  const baseClasses = "bg-white text-black font-sans flex flex-col border-2 border-dashed border-black print:border-none print:shadow-none";

  return (
    <div className={cn(baseClasses, sizeClasses[stickerSize as keyof typeof sizeClasses] || sizeClasses['75mm'])}>
        {/* Top: Barcode and Waybill Number */}
        <div className="text-center border-b-2 border-dashed border-black pb-2">
            <div className={cn("mx-auto", stickerSize === '75mm' ? 'w-full h-auto' : 'w-full h-auto')}>
                <Barcode 
                  value={waybill.waybillNumber} 
                  height={stickerSize === '75mm' ? 40 : 50} 
                  displayValue={false} 
                  width={2} 
                  margin={0}
                />
            </div>
            <p className={cn("text-center font-mono", stickerSize === '75mm' ? 'tracking-[0.2em] text-lg' : 'tracking-[0.25em] text-xl')}>{waybill.waybillNumber}</p>
        </div>

        {/* Middle: Sender City */}
        <div className="flex-grow flex flex-col items-center justify-center border-b-2 border-dashed border-black">
            <p className="text-xs uppercase text-gray-500">From</p>
            <p className={cn("font-black tracking-tighter leading-none", stickerSize === '75mm' ? 'text-4xl' : 'text-5xl')}>{(waybill.senderCity || '').toUpperCase()}</p>
        </div>

        {/* Bottom: Receiver City and Box Count */}
        <div className="flex-grow flex items-center justify-between pt-2">
            <div className="text-center">
                 <p className="text-xs uppercase text-gray-500">To</p>
                 <p className={cn("font-black tracking-tighter leading-none", stickerSize === '75mm' ? 'text-4xl' : 'text-5xl')}>{(waybill.receiverCity || '').toUpperCase()}</p>
            </div>
            {boxNumber && totalBoxes && (
                <div className="text-center p-2 border-l-2 border-dashed border-black pl-4">
                    <p className="text-xs uppercase text-gray-500">Box</p>
                    <p className={cn("font-black", stickerSize === '75mm' ? 'text-3xl' : 'text-4xl')}>{boxNumber}/{totalBoxes}</p>
                </div>
            )}
        </div>
    </div>
  );
}
