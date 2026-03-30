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
                {/* Trophy Silhouette */}
                <path d="M 40,60 Q 100,180 160,60 L 145,50 Q 100,140 55,50 Z" fill="black" />
                <path d="M 100,20 L 110,45 L 135,45 L 115,60 L 125,85 L 100,70 L 75,85 L 85,60 L 65,45 L 90,45 Z" fill="black" />
                <path d="M 85,160 L 115,160 L 130,185 L 70,185 Z" fill="black" />
                <rect x="95" y="140" width="10" height="25" fill="black" />
            </svg>
        </div>
        <span className="text-[10px] font-extrabold tracking-tight text-black">
            YU-WON LOGISTICS
        </span>
    </div>
);


const CityName = ({ city }: { city: string }) => {
    const cityName = (city || '').toUpperCase();
    
    return (
        <div className="w-full text-center font-black tracking-tighter leading-none p-1 text-[2.75rem] flex items-center justify-center h-16">
           <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">{cityName}</span>
        </div>
    )
}

const PartnerName = ({ name }: { name?: string }) => {
    if (!name) return null;
    return (
        <div className="text-center font-semibold text-xs leading-tight break-words h-6 flex items-center justify-center">
            <span className="truncate">{name.toUpperCase()}</span>
        </div>
    )
}


export function WaybillSticker({ waybill, boxId, boxNumber, totalBoxes, storeCode, bookingPartnerName, deliveryPartnerName }: WaybillStickerProps) {
  
  const sizeClasses = 'w-[75mm] h-[75mm]';
  const baseClasses = "bg-black text-black font-sans print:shadow-none flex items-center justify-center p-[2mm]";

  const barcodeValue = boxId || `${waybill.waybillNumber}-${boxNumber || 1}`;
  const finalTotalBoxes = totalBoxes || waybill.numberOfBoxes;
  const finalBoxNumber = boxNumber || 1;

  return (
    <div className={cn(baseClasses, sizeClasses)}>
        <div className="w-full h-full bg-white p-[1mm]">
            <div className="grid grid-cols-5 w-full h-full">
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
                            <div className="text-sm font-semibold truncate h-5 flex items-center justify-center">{waybill.receiverName}</div>
                        </div>
                        <div className="w-full mt-1 pt-1 border-t border-black text-center">
                            <p className="text-xs font-bold">FROM:</p>
                            <div className="text-sm font-semibold truncate h-5 flex items-center justify-center">
                                {waybill.senderCity.toUpperCase()}
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Section: Barcode */}
                    <div className="flex flex-col items-center justify-center p-1 h-[40px]">
                        <div className="h-[28px] w-full flex items-center justify-center">
                           <div className="w-full h-full flex items-center justify-center">
                                <Barcode 
                                    value={barcodeValue} 
                                    height={28} 
                                    displayValue={false} 
                                    width={1.5} 
                                    margin={0}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] tracking-widest font-mono">{barcodeValue}</p>
                    </div>
                </div>

                {/* Right 1 column for Partner Route */}
                <div className="col-span-1 flex flex-col items-center justify-center text-center p-1 space-y-1">
                    <div className="flex flex-col items-center justify-center" style={{lineHeight: '1.2'}}>
                        <PartnerName name={bookingPartnerName} />
                        <ArrowRight className="h-4 w-4 my-1"/>
                        <PartnerName name={deliveryPartnerName} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
