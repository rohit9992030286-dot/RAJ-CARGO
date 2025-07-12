
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, Building } from 'lucide-react';

interface WaybillStickerProps {
  waybill: Waybill;
  storeCode?: string | null;
  boxNumber?: number;
  totalBoxes?: number;
}

export function WaybillSticker({ waybill, storeCode, boxNumber, totalBoxes }: WaybillStickerProps) {
  // A simple placeholder for a barcode. In a real app, you'd use a library to generate a real one.
  const Barcode = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="60" viewBox="0 0 250 60" preserveAspectRatio="none">
      <g fill="#000">
        <path d="M0 0h2v60H0zM4 0h4v60H4zM10 0h2v60h-2zM14 0h2v60h-2zM18 0h6v60h-6zM26 0h2v60h-2zM32 0h2v60h-2zM36 0h4v60h-4zM42 0h2v60h-2zM48 0h2v60h-2zM52 0h4v60h-4zM60 0h2v60h-2zM64 0h6v60h-6zM74 0h4v60h-4zM80 0h2v60h-2zM86 0h2v60h-2zM90 0h2v60h-2zM96 0h4v60h-4zM102 0h2v60h-2zM106 0h6v60h-6zM114 0h2v60h-2zM118 0h4v60h-4zM124 0h2v60h-2zM130 0h4v60h-4zM136 0h2v60h-2zM140 0h6v60h-6zM148 0h4v60h-4zM154 0h2v60h-2zM160 0h2v60h-2zM164 0h6v60h-6zM172 0h2v60h-2zM178 0h4v60h-4zM184 0h2v60h-2zM190 0h4v60h-4zM198 0h2v60h-2zM202 0h2v60h-2zM208 0h4v60h-4zM214 0h6v60h-6zM222 0h2v60h-2zM226 0h4v60h-4zM232 0h2v60h-2zM238 0h6v60h-6zM246 0h4v60h-4z" />
      </g>
    </svg>
  );

  return (
    <div className="bg-white text-black font-sans p-4 border-4 border-black border-dashed w-[4in] h-[6in] flex flex-col print:shadow-none print:p-2 print:border-2">
      {/* Header */}
      <header className="flex justify-between items-center pb-2 border-b-4 border-black">
        <div className="flex items-center gap-2">
            <Truck className="h-10 w-10 text-black" />
            <h1 className="text-2xl font-bold">SS CARGO</h1>
        </div>
        <div className="text-right">
            <p className="font-semibold">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
            {boxNumber && totalBoxes && (
              <p className="text-lg font-bold">Box: {boxNumber} of {totalBoxes}</p>
            )}
        </div>
      </header>
      
      {/* Sender Info */}
      <section className="py-3 border-b-2 border-black border-dashed">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-1">FROM:</h3>
        <div className="text-sm">
            <p className="font-semibold">{waybill.senderName}</p>
            <p>{waybill.senderCity}</p>
            <p>{waybill.senderPincode}</p>
        </div>
      </section>

      {/* Receiver Info */}
      <section className="flex-grow py-4">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2">TO:</h3>
        <div className="space-y-1 pl-4">
            <p className="text-lg font-bold">{waybill.receiverName}</p>
            <p className="text-lg">{waybill.receiverCity}</p>
            <p className="text-2xl font-bold">{waybill.receiverPincode}</p>
             {storeCode && (
              <div className="flex items-center gap-2 pt-2">
                <Building className="h-5 w-5" />
                <p className="text-lg font-semibold">Store Code: {storeCode}</p>
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
