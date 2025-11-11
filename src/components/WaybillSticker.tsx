
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

const PrintLogo = () => (
    <div className="flex items-center gap-1">
        <div className="relative h-8 w-8 flex items-center justify-center">
            <svg 
                width="32" 
                height="32" 
                viewBox="0 0 200 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="absolute"
            >
                {/* Bottom Wing */}
                <path d="M 50,150 Q 90,110 150,130 L 110,180 Q 80,170 50,150 Z" fill="black" />
                
                {/* Top Wing */}
                <path d="M 30,100 Q 100,20 180,80 L 130,140 Q 80,110 30,100 Z" fill="black" />
            </svg>
        </div>
        <span className="text-[10px] font-extrabold tracking-tight text-black">
            RAJ CARGO
        </span>
    </div>
);


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
  
  const sizeClasses = 'w-[75mm] h-[75mm] p-[4mm]'; // Increased padding for a thicker border
  const baseClasses = "bg-black text-black font-sans print:shadow-none";

  const barcodeValue = boxId || `${waybill.waybillNumber}-${boxNumber || 1}`;
  const finalTotalBoxes = totalBoxes || waybill.numberOfBoxes;
  const finalBoxNumber = boxNumber || 1;

  return (
    <div className={cn(baseClasses, sizeClasses)}>
        <div className="grid grid-cols-5 w-full h-full bg-white">
            {/* Left 4 columns */}
            <div className="col-span-4 border-r-2 border-black flex flex-col">
                {/* Top Section: Branding, Date, Waybill */}
                <div className="grid grid-cols-2 text-center border-b-2 border-black">
                     <div className="p-1 border-r border-black flex items-center justify-center">
                        <PrintLogo />
                    </div>
                    <div className="p-1">
                        <p className="text-xs font-bold">DATE: {new Date(waybill.shippingDate).toLocaleDateString()}</p>
                        <p className="font-bold text-sm">{waybill.waybillNumber}</p>
                    </div>
                </div>
                
                {/* Middle Section: Destination City & Sender */}
                <div className="flex-grow flex flex-col items-center justify-center border-b-2 border-black p-1">
                    <div className="w-full">
                        <p className="text-xs font-bold text-center">TO:</p>
                        <CityName city={waybill.receiverCity} className="text-5xl"/>
                        <p className="text-sm font-semibold truncate text-center">{waybill.receiverName}</p>
                    </div>
                     <div className="w-full mt-1 pt-1 border-t border-black text-center">
                        <p className="text-xs font-bold">FROM: <span className="font-medium">{waybill.senderCity.toUpperCase()}</span></p>
                    </div>
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
