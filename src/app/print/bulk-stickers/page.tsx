
'use client';

import { useEffect, useRef, useState } from 'react';
import { WaybillSticker } from '@/components/WaybillSticker';
import { Loader2 } from 'lucide-react';
import { Waybill } from '@/types/waybill';

// Create a mock Waybill object from the row data
function createMockWaybill(data: any): Waybill {
    return {
        id: data.waybillNumber || crypto.randomUUID(),
        waybillNumber: String(data.waybillNumber || ''),
        senderCity: String(data.senderCity || 'N/A'),
        receiverCity: String(data.receiverCity || 'N/A'),
        receiverName: String(data.receiverName || ''),
        numberOfBoxes: Number(data.numberOfBoxes || 1),
        // Add default values for other required Waybill fields
        invoiceNumber: '',
        eWayBillNo: '',
        senderName: '',
        senderAddress: '',
        senderPincode: '',
        senderPhone: '',
        receiverAddress: '',
        receiverPincode: '',
        receiverPhone: '',
        packageDescription: '',
        packageWeight: 0,
        shipmentValue: 0,
        shippingDate: new Date().toISOString().split('T')[0],
        shippingTime: '10:00',
        status: 'Pending',
    };
}


export default function BulkPrintStickersPage() {
  const [stickers, setStickers] = useState<any[]>([]);
  const [stickerSize, setStickerSize] = useState('75mm');
  const [isLoading, setIsLoading] = useState(true);
  const printTriggered = useRef(false);

  useEffect(() => {
    try {
      const storedStickers = sessionStorage.getItem('ss-cargo-bulk-stickers');
      if (storedStickers) {
        const parsedStickers = JSON.parse(storedStickers);
        setStickers(parsedStickers);
      }
      const size = localStorage.getItem('ss-cargo-stickerSize') || '75mm';
      setStickerSize(size);
    } catch (e) {
      console.error("Could not parse stickers from session storage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (stickers.length > 0 && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
        // Optional: Clean up session storage after printing
        // sessionStorage.removeItem('ss-cargo-bulk-stickers');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stickers]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Preparing stickers...</p>
      </div>
    );
  }

  if (stickers.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p>No sticker data found. Please upload a file again.</p>
      </div>
    );
  }

  const allStickersToPrint: { waybill: Waybill; boxNumber: number; totalBoxes: number }[] = [];
  stickers.forEach(stickerData => {
    const waybill = createMockWaybill(stickerData);
    const totalBoxes = waybill.numberOfBoxes || 1;
    for (let i = 1; i <= totalBoxes; i++) {
        allStickersToPrint.push({ waybill, boxNumber: i, totalBoxes });
    }
  });


  return (
    <div className="bg-white">
      {allStickersToPrint.map(({ waybill, boxNumber, totalBoxes }, index) => (
        <div key={`${waybill.id}-${boxNumber}-${index}`} className="print:page-break-after-always flex justify-center items-center min-h-screen">
            <WaybillSticker 
              waybill={waybill}
              boxNumber={boxNumber}
              totalBoxes={totalBoxes}
              stickerSize={stickerSize}
            />
        </div>
      ))}
    </div>
  );
}
