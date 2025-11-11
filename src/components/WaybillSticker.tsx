
'use client';

import { Waybill } from '@/types/waybill';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';
import { ArrowRight } from 'lucide-react';

interface WaybillStickerProps {
  waybill: Waybill;
  boxId?: string;
  boxNumber?: number;
  totalBoxes?: number;
  storeCode?: string;
  bookingPartnerName?: string;
  deliveryPartnerName?: string;
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


const CityName = ({ city }: { city: string }) => {
    const cityName = (city || '').toUpperCase();
    const isLong = cityName.length > 10;
    
    return (
        <p 
          className={cn(
            "w-full text-center font-black tracking-tighter leading-none p-1",
            isLong ? "text-4xl" : "text-5xl"
          )}
        >
            {cityName}
        </p>
    )
}

export function WaybillSticker({ waybill, boxId, boxNumber, totalBoxes, storeCode, bookingPartnerName, deliveryPartnerName }: WaybillStickerProps) {
  
  const sizeClasses = 'w-[75mm] h-[75mm] p-[6mm]';
  const baseClasses = "bg-black text-black font-sans print:shadow-none flex items-center justify-center";

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
                        <p className="font-bold text-xs">{waybill.waybillNumber} ({finalBoxNumber}/{finalTotalBoxes})</p>
                    </div>
                </div>
                
                {/* Middle Section: Destination City & Sender */}
                <div className="flex-grow flex flex-col items-center justify-center border-b-2 border-black p-1">
                    <div className="w-full text-center">
                        <p className="text-xs font-bold">TO:</p>
                        <CityName city={waybill.receiverCity} />
                        <p className="text-sm font-semibold truncate">{waybill.receiverName}</p>
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

            {/* Right 1 column for Partner Route */}
            <div className="col-span-1 flex flex-col items-center justify-center text-center p-1 space-y-1">
                <div className="flex flex-col items-center justify-center" style={{lineHeight: '1.2'}}>
                    <p className="text-xs font-bold break-words">{bookingPartnerName}</p>
                    <ArrowRight className="h-4 w-4 my-1"/>
                    <p className="text-xs font-bold break-words">{deliveryPartnerName}</p>
                </div>
            </div>
        </div>
    </div>
  );
}

