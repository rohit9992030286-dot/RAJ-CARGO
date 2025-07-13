
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type StickerSize = '4x6' | '3x2';

interface WaybillStickerProps {
  waybill: Waybill;
  storeCode?: string | null;
  boxNumber?: number;
  totalBoxes?: number;
}

export function WaybillSticker({ waybill, storeCode, boxNumber, totalBoxes }: WaybillStickerProps) {
  const [size, setSize] = useState<StickerSize>('4x6');

  useEffect(() => {
    try {
      const storedSize = localStorage.getItem('ss-cargo-stickerSize') as StickerSize;
      if (storedSize && ['4x6', '3x2'].includes(storedSize)) {
        setSize(storedSize);
      }
    } catch (error) {
        console.error('Could not get sticker size from local storage', error);
    }
  }, []);

  const Barcode = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="60" viewBox="0 0 250 60" preserveAspectRatio="none">
      <g fill="#000">
        <path d="M0 0h2v60H0zM4 0h4v60H4zM10 0h2v60h-2zM14 0h2v60h-2zM18 0h6v60h-6zM26 0h2v60h-2zM32 0h2v60h-2zM36 0h4v60h-4zM42 0h2v60h-2zM48 0h2v60h-2zM52 0h4v60h-4zM60 0h2v60h-2zM64 0h6v60h-6zM74 0h4v60h-4zM80 0h2v60h-2zM86 0h2v60h-2zM90 0h2v60h-2zM96 0h4v60h-4zM102 0h2v60h-2zM106 0h6v60h-6zM114 0h2v60h-2zM118 0h4v60h-4zM124 0h2v60h-2zM130 0h4v60h-4zM136 0h2v60h-2zM140 0h6v60h-6zM148 0h4v60h-4zM154 0h2v60h-2zM160 0h2v60h-2zM164 0h6v60h-6zM172 0h2v60h-2zM178 0h4v60h-4zM184 0h2v60h-2zM190 0h4v60h-4zM198 0h2v60h-2zM202 0h2v60h-2zM208 0h4v60h-4zM214 0h6v60h-6zM222 0h2v60h-2zM226 0h4v60h-4zM232 0h2v60h-2zM238 0h6v60h-6zM246 0h4v60h-4z" />
      </g>
    </svg>
  );

  return (
    <div className={cn(
        "bg-white text-black font-sans p-4 border-2 border-black flex flex-col print:shadow-none print:p-2 print:border-2",
        {
            'w-[4in] h-[6in]': size === '4x6',
            'w-[3in] h-[2in]': size === '3x2',
        }
    )}>
      {/* Header */}
      <header className="flex justify-between items-center pb-2 border-b-2 border-black">
        <div className="flex items-center gap-2">
            <Truck className={cn('text-black', { 'h-8 w-8': size === '4x6', 'h-6 w-6': size === '3x2' })} />
            <h1 className={cn('font-bold', { 'text-xl': size === '4x6', 'text-lg': size === '3x2' })}>SS CARGO</h1>
        </div>
        <div className="text-right">
            <p className="font-semibold">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
            {boxNumber && totalBoxes && (
              <p className={cn('font-bold', { 'text-lg': size === '4x6', 'text-base': size === '3x2' })}>Box: {boxNumber} of {totalBoxes}</p>
            )}
        </div>
      </header>
      
      {/* Sender Info */}
      <section className="py-2 border-b-2 border-black">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-1">FROM:</h3>
        <div className="text-sm">
            <p className="font-semibold">{waybill.senderName}</p>
            {size === '4x6' && <p>{waybill.senderCity}, {waybill.senderPincode}</p>}
        </div>
      </section>

      {/* Receiver Info */}
      <section className="flex-grow py-3">
        <h3 className={cn('font-bold uppercase tracking-wider mb-1', {'text-sm': size === '4x6', 'text-xs': size === '3x2'})}>TO:</h3>
        <div className="space-y-1 pl-4">
            <p className={cn('font-bold', { 'text-xl': size === '4x6', 'text-lg': size === '3x2' })}>{waybill.receiverName}</p>
            <p className={cn('font-bold', { 'text-3xl': size === '4x6', 'text-xl': size === '3x2' })}>{waybill.receiverCity ? waybill.receiverCity.toUpperCase() : ''}</p>
            <p className={cn('font-bold', { 'text-4xl': size === '4x6', 'text-2xl': size === '3x2' })}>{waybill.receiverPincode}</p>
             {storeCode && (
              <div className="flex items-center gap-2 pt-2">
                <Building className={cn({'h-5 w-5': size === '4x6', 'h-4 w-4': size === '3x2'})} />
                <p className={cn('font-semibold', {'text-lg': size === '4x6', 'text-base': size === '3x2'})}>Store Code: {storeCode}</p>
              </div>
            )}
        </div>
      </section>

      {/* Footer with Barcode */}
      <footer className="mt-auto pt-2 border-t-4 border-black">
        <div className="w-full h-[60px] mb-1">
            <Barcode />
        </div>
        <p className="text-center font-mono tracking-widest text-lg">{waybill.waybillNumber}</p>
      </footer>
    </div>
  );
}
