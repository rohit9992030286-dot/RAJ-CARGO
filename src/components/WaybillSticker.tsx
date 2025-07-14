
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, Building, Phone, Box, Weight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type StickerSize = '4x6' | '3x2' | 'compact';

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
      if (storedSize && ['4x6', '3x2', 'compact'].includes(storedSize)) {
        setSize(storedSize);
      }
    } catch (error) {
        console.error('Could not get sticker size from local storage', error);
    }
  }, []);

  const Barcode = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 320 60" preserveAspectRatio="none">
      <g fill="#000">
        <path d="M0 0h3v60H0z M5 0h5v60H5z M12 0h3v60h-3z M17 0h3v60h-3z M22 0h7v60h-7z M31 0h3v60h-3z M38 0h3v60h-3z M43 0h5v60h-5z M50 0h3v60h-3z M57 0h3v60h-3z M62 0h5v60h-5z M71 0h3v60h-3z M76 0h7v60h-7z M87 0h5v60h-5z M94 0h3v60h-3z M101 0h3v60h-3z M106 0h3v60h-3z M113 0h5v60h-5z M120 0h3v60h-3z M125 0h7v60h-7z M134 0h3v60h-3z M139 0h5v60h-5z M146 0h3v60h-3z M153 0h5v60h-5z M160 0h3v60h-3z M165 0h7v60h-7z M174 0h5v60h-5z M181 0h3v60h-3z M188 0h3v60h-3z M193 0h7v60h-7z M202 0h3v60h-3z M209 0h5v60h-5z M216 0h3v60h-3z M221 0h5v60h-5z M230 0h3v60h-3z M235 0h3v60h-3z M242 0h5v60h-5z M249 0h7v60h-7z M258 0h3v60h-3z M263 0h5v60h-5z M270 0h3v60h-3z M277 0h7v60h-7z M286 0h5v60h-5z M292 0h3v60h-3z M297 0h7v60h-7z M306 0h5v60h-5z M313 0h7v60h-7z" />
      </g>
    </svg>
  );

  if (size === 'compact') {
      return (
        <div className="w-[3.5in] h-[2.5in] bg-white text-black font-sans flex flex-col p-1 border border-black">
          <div className="flex justify-between items-center border-b border-black pb-1">
            <h1 className="text-xl font-bold">SME</h1>
            <p className="text-xs">ANY WHERE TO EVERY WHERE</p>
          </div>
          <div className="flex-grow flex flex-col justify-center items-center border-b border-black py-1">
            <p className="text-xs self-start">AWB. NO.:</p>
            <div className="w-48 h-8">
                <Barcode />
            </div>
            <p className="font-mono font-bold text-lg tracking-wider">{waybill.waybillNumber}</p>
          </div>
          <div className="grid grid-cols-3 border-b border-black">
            <div className="col-span-2 border-r border-black p-1">
                <p className="text-xs">FROM: <span className="font-bold">{(waybill.senderCity || '').toUpperCase()}</span></p>
            </div>
            <div className="p-1 text-center">
                <p className="text-xs">NOS OF PKGS</p>
                <p className="font-bold text-lg">{waybill.numberOfBoxes}</p>
            </div>
          </div>
          <div className="p-1">
              <p className="text-xs">TO: <span className="font-bold text-lg">{(waybill.receiverCity || '').toUpperCase()} {waybill.receiverPincode}</span></p>
          </div>
        </div>
      )
  }

  const destinationTextSize = size === '4x6' ? 'text-7xl' : 'text-5xl';
  const pincodeTextSize = size === '4x6' ? 'text-6xl' : 'text-4xl';
  const receiverNameSize = size === '4x6' ? 'text-2xl' : 'text-xl';
  const addressTextSize = size === '4x6' ? 'text-base' : 'text-sm';

  return (
    <div className={cn(
        "bg-white text-black font-sans border-2 border-black flex flex-col print:shadow-none print:p-0",
        {
            'w-[4in] h-[6in]': size === '4x6',
            'w-[3in] h-[2in]': size === '3x2',
        }
    )}>
        {/* Header */}
        <header className="flex justify-between items-center p-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
                <Truck className={cn('text-black', { 'h-6 w-6': size === '4x6', 'h-5 w-5': size === '3x2' })} />
                <h1 className={cn('font-bold', { 'text-lg': size === '4x6', 'text-base': size === '3x2' })}>SS CARGO</h1>
            </div>
            <p className="text-sm font-semibold">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
        </header>

        {/* Receiver Info */}
        <section className="flex-grow flex flex-col p-2 border-b-2 border-black">
            <div className="flex-grow">
                <p className="text-xs font-bold uppercase tracking-wider">TO:</p>
                <p className={cn('font-bold leading-tight', receiverNameSize)}>{waybill.receiverName}</p>
                <p className={cn('leading-tight', addressTextSize)}>{waybill.receiverAddress}</p>
                {size === '4x6' && <p className="flex items-center gap-1.5 pt-1"><Phone className="h-4 w-4" />{waybill.receiverPhone}</p>}
            </div>
             {storeCode && (
              <div className="flex items-center gap-2 mt-auto">
                <Building className={cn({'h-5 w-5': size === '4x6', 'h-4 w-4': size === '3x2'})} />
                <p className={cn('font-semibold', {'text-lg': size === '4x6', 'text-base': size === '3x2'})}>Store Code: {storeCode}</p>
              </div>
            )}
        </section>

        {/* Destination & Details */}
        <section className="grid grid-cols-2">
            <div className="flex flex-col items-center justify-center p-2 border-r-2 border-black">
                <p className={cn('font-black leading-none tracking-tighter', destinationTextSize)}>{(waybill.receiverCity || '').toUpperCase()}</p>
                <p className={cn('font-black leading-none', pincodeTextSize)}>{waybill.receiverPincode}</p>
            </div>
            <div className="p-2 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="font-bold">FROM:</span>
                    <span>{(waybill.senderCity || '')}, {waybill.senderPincode}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="font-bold">WEIGHT:</span>
                    <span>{waybill.packageWeight} kg</span>
                </div>
                 {boxNumber && totalBoxes && (
                    <div className="flex items-center justify-between">
                        <span className="font-bold">BOX:</span>
                        <span className="text-lg font-black">{boxNumber} of {totalBoxes}</span>
                    </div>
                )}
            </div>
        </section>

        {/* Footer with Barcode */}
        <footer className="mt-auto p-2 border-t-4 border-black">
            <div className={cn("w-full mx-auto", { 'h-[50px]': size === '4x6', 'h-[40px]': size === '3x2' })}>
                <Barcode />
            </div>
            <p className="text-center font-mono tracking-[0.2em]">{waybill.waybillNumber}</p>
        </footer>
    </div>
  );
}

    