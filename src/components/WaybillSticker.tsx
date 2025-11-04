
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

const CityName = ({ city, className }: { city: string, className?: string }) => {
    const cityName = (city || '').toUpperCase();
    
    return (
        <p className={cn(
            "w-full text-center font-black tracking-tighter leading-none p-1",
            className
        )}>
            {cityName}
        </p>
    )
}


export function WaybillSticker({ waybill, boxId, boxNumber, totalBoxes, storeCode }: WaybillStickerProps) {
  
  const sizeClasses = 'w-[73mm] h-[73mm] p-1';
  const baseClasses = "bg-white text-black font-sans flex flex-col border-2 border-black print:border-2 print:shadow-none";

  const barcodeValue = boxId || `${waybill.waybillNumber}-${boxNumber || 1}`;
  const finalTotalBoxes = totalBoxes || waybill.numberOfBoxes;
  const finalBoxNumber = boxNumber || 1;

  return (
    <div className={cn(baseClasses, sizeClasses)}>
        <div className="grid grid-cols-5 w-full h-full">
            {/* Left 4 columns */}
            <div className="col-span-4 border-r-2 border-black flex flex-col">
                {/* Top Section: Sender / Date / Waybill */}
                <div className="grid grid-cols-2 text-center border-b-2 border-black">
                    <div className="p-1 border-r border-black">
                        <p className="text-xs font-bold truncate">{waybill.senderName}</p>
                    </div>
                    <div className="p-1">
                        <p className="text-xs font-bold">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="text-center border-b-2 border-black p-1">
                    <p className="font-bold text-sm">{waybill.waybillNumber}</p>
                </div>
                
                {/* Middle Section: Destination City */}
                <div className="flex-grow flex flex-col items-center justify-center border-b-2 border-black">
                    <CityName city={waybill.receiverCity} className="text-5xl"/>
                    <p className="text-sm font-semibold truncate">{waybill.receiverName}</p>
                </div>
                
                {/* Bottom Section: Barcode */}
                <div className="flex flex-col items-center justify-center p-1">
                    <Barcode 
                      value={barcodeValue} 
                      height={25} 
                      displayValue={false} 
                      width={1.5} 
                      margin={0}
                    />
                    <p className="text-xs tracking-widest">{barcodeValue}</p>
                </div>
            </div>

            {/* Right 1 column for Box Count */}
            <div className="col-span-1 flex flex-col items-center justify-center text-center">
                <p className="text-xs uppercase font-bold">Box</p>
                <p className="font-black text-4xl leading-none">{finalBoxNumber}</p>
                <p className="text-sm font-bold">of</p>
                <p className="font-black text-4xl leading-none">{finalTotalBoxes}</p>
                 {storeCode && (
                    <div className="mt-2 pt-1 border-t border-black w-full">
                        <p className="text-xs uppercase font-bold">Store</p>
                        <p className="text-lg font-bold">{storeCode}</p>
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
}
