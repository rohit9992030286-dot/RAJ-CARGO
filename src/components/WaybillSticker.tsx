
'use client';

import { Waybill } from '@/types/waybill';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';

interface WaybillStickerProps {
  waybill: Waybill;
  boxId?: string;
  boxNumber?: number;
  totalBoxes?: number;
  storeCode?: string;
}

const CityName = ({ city }: { city: string }) => {
    const cityName = (city || '').toUpperCase();
    const isLong = cityName.length > 10;
    return (
        <div className="w-full text-center h-[36px] flex items-center justify-center overflow-hidden">
            <p className={cn(
                "font-black tracking-tighter leading-none",
                isLong ? "text-2xl" : "text-4xl"
            )}>
                {cityName}
            </p>
        </div>
    )
}


export function WaybillSticker({ waybill, boxId, boxNumber, totalBoxes, storeCode }: WaybillStickerProps) {
  
  const sizeClasses = 'w-[73mm] h-[73mm] p-2';
  const baseClasses = "bg-white text-black font-sans flex flex-col border-2 border-black print:border-2 print:shadow-none";

  const barcodeValue = boxId || `${waybill.waybillNumber}-${boxNumber || 1}`;
  const finalTotalBoxes = totalBoxes || waybill.numberOfBoxes;
  const finalBoxNumber = boxNumber || 1;

  return (
    <div className={cn(baseClasses, sizeClasses)}>
        {/* Top: Barcode and Waybill Number - Height: 35% */}
        <div className="text-center border-b-2 border-black flex flex-col items-center justify-center" style={{ height: '35%' }}>
            <p className="font-bold text-sm">RAJ CARGO</p>
            <div className={cn("mx-auto flex justify-center items-center", 'w-full h-auto')}>
                <Barcode 
                  value={barcodeValue} 
                  height={30} 
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
            <CityName city={waybill.senderCity} />
        </div>

        {/* Bottom: Receiver City and Box Count - Height: 35% */}
        <div className="flex items-center justify-between pt-1" style={{ height: '35%' }}>
            <div className="text-center flex-grow">
                 <p className="text-xs uppercase text-gray-500">To</p>
                 <CityName city={waybill.receiverCity} />
                 <p className="text-sm font-semibold truncate">{waybill.receiverName}</p>
                 {storeCode && <p className="text-xs font-bold">STORE: {storeCode}</p>}
            </div>
            {(finalBoxNumber && finalTotalBoxes) && (
                <div className="text-center p-2 border-l-2 border-black pl-4 h-full flex flex-col justify-center">
                    <p className="text-xs uppercase text-gray-500">Box</p>
                    <p className={cn("font-black", 'text-3xl')}>{finalBoxNumber}/{finalTotalBoxes}</p>
                </div>
            )}
        </div>
    </div>
  );
}
