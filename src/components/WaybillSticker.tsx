
'use client';

import { Waybill } from '@/types/waybill';

interface WaybillStickerProps {
  waybill: Waybill;
  storeCode?: string | null;
  boxNumber?: number;
  totalBoxes?: number;
}

const Barcode = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 320 60" preserveAspectRatio="none">
        <g fill="#000">
        <path d="M0 0h3v60H0z M5 0h5v60H5z M12 0h3v60h-3z M17 0h3v60h-3z M22 0h7v60h-7z M31 0h3v60h-3z M38 0h3v60h-3z M43 0h5v60h-5z M50 0h3v60h-3z M57 0h3v60h-3z M62 0h5v60h-5z M71 0h3v60h-3z M76 0h7v60h-7z M87 0h5v60h-5z M94 0h3v60h-3z M101 0h3v60h-3z M106 0h3v60h-3z M113 0h5v60h-5z M120 0h3v60h-3z M125 0h7v60h-7z M134 0h3v60h-3z M139 0h5v60h-5z M146 0h3v60h-3z M153 0h5v60h-5z M160 0h3v60h-3z M165 0h7v60h-7z M174 0h5v60h-5z M181 0h3v60h-3z M188 0h3v60h-3z M193 0h7v60h-7z M202 0h3v60h-3z M209 0h5v60h-5z M216 0h3v60h-3z M221 0h5v60h-5z M230 0h3v60h-3z M235 0h3v60h-3z M242 0h5v60h-5z M249 0h7v60h-7z M258 0h3v60h-3z M263 0h5v60h-5z M270 0h3v60h-3z M277 0h7v60h-7z M286 0h5v60h-5z M292 0h3v60h-3z M297 0h7v60h-7z M306 0h5v60h-5z M313 0h7v60h-7z" />
        </g>
    </svg>
);

export function WaybillSticker({ waybill, boxNumber, totalBoxes }: WaybillStickerProps) {
  return (
    <div className="w-[75mm] h-[75mm] bg-white text-black font-sans flex flex-col p-2 border-2 border-dashed border-black print:border-none print:shadow-none">
        {/* Top: Barcode and Waybill Number */}
        <div className="text-center border-b-2 border-dashed border-black pb-2">
            <div className="w-full h-[40px] mx-auto">
                <Barcode />
            </div>
            <p className="text-center font-mono tracking-[0.2em] text-lg">{waybill.waybillNumber}</p>
        </div>

        {/* Middle: Sender City */}
        <div className="flex-grow flex flex-col items-center justify-center border-b-2 border-dashed border-black">
            <p className="text-xs uppercase text-gray-500">From</p>
            <p className="text-4xl font-black tracking-tighter leading-none">{(waybill.senderCity || '').toUpperCase()}</p>
        </div>

        {/* Bottom: Receiver City and Box Count */}
        <div className="flex-grow flex items-center justify-between pt-2">
            <div className="text-center">
                 <p className="text-xs uppercase text-gray-500">To</p>
                 <p className="text-4xl font-black tracking-tighter leading-none">{(waybill.receiverCity || '').toUpperCase()}</p>
            </div>
            {boxNumber && totalBoxes && (
                <div className="text-center p-2 border-l-2 border-dashed border-black pl-4">
                    <p className="text-xs uppercase text-gray-500">Box</p>
                    <p className="text-3xl font-black">{boxNumber}/{totalBoxes}</p>
                </div>
            )}
        </div>
    </div>
  );
}
