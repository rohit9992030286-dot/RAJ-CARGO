
'use client';

import { useEffect, useRef, useState } from 'react';
import { WaybillSticker } from '@/components/WaybillSticker';
import { WaybillStickerCustom } from '@/components/WaybillStickerCustom';
import { Loader2 } from 'lucide-react';
import { Waybill } from '@/types/waybill';

// Create a mock Waybill object from the row data
function createMockWaybill(data: any): Waybill {
    return {
        id: data.waybillNumber || crypto.randomUUID(),
        waybillNumber: String(data.waybillNumber || ''),
        senderName: String(data.senderName || ''),
        senderCity: String(data.senderCity || 'N/A'),
        receiverCity: String(data.receiverCity || 'N/A'),
        receiverName: String(data.receiverName || ''),
        numberOfBoxes: Number(data.totalBoxes || 1),
        // Add default values for other required Waybill fields
        invoiceNumber: '',
        eWayBillNo: '',
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
        receiverState: data.receiverState || '',
        paymentType: 'To Pay',
    };
}


export default function BulkPrintStickersPage() {
  const [stickers, setStickers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stickerSize, setStickerSize] = useState('75mm');
  const printTriggered = useRef(false);

  useEffect(() => {
    try {
      const storedStickers = sessionStorage.getItem('rajcargo-bulk-stickers');
      if (storedStickers) {
        const parsedStickers = JSON.parse(storedStickers);
        // Sort by receiver city
        parsedStickers.sort((a: any, b: any) => {
            const cityA = (a.receiverCity || '').toUpperCase();
            const cityB = (b.receiverCity || '').toUpperCase();
            if (cityA < cityB) return -1;
            if (cityA > cityB) return 1;
            // Then by waybill number
            return String(a.waybillNumber || '').localeCompare(String(b.waybillNumber || ''), undefined, { numeric: true });
        });
        setStickers(parsedStickers);
      }
      const storedSize = localStorage.getItem('rajcargo-stickerSize');
      if (storedSize) {
        setStickerSize(storedSize);
      }
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
        // sessionStorage.removeItem('rajcargo-bulk-stickers');
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

  const allStickersToPrint: { waybill: Waybill; boxNumber: number; totalBoxes: number; storeCode?: string }[] = [];
  
  // Group by waybill number to determine total boxes
  const waybillGroups = stickers.reduce((acc, sticker) => {
    acc[sticker.waybillNumber] = (acc[sticker.waybillNumber] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  stickers.forEach(stickerData => {
    const waybill = createMockWaybill(stickerData);
    const totalBoxesForWaybill = waybillGroups[stickerData.waybillNumber] || stickerData.totalBoxes;
    allStickersToPrint.push({ waybill, boxNumber: stickerData.boxNumber, totalBoxes: totalBoxesForWaybill, storeCode: stickerData.storeCode });
  });

  const StickerComponent = stickerSize === 'custom' ? WaybillStickerCustom : WaybillSticker;

  const printStyles = `
    @media print {
      @page {
        size: ${stickerSize === '75mm' ? '75mm 75mm' : '9cm 7.3cm'};
        margin: 0;
      }
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <div className="bg-white">
        {allStickersToPrint.map(({ waybill, boxNumber, totalBoxes, storeCode }, index) => (
          <div key={`${waybill.id}-${boxNumber}-${index}`} className="print:page-break-after-always">
              <StickerComponent
                waybill={waybill}
                boxNumber={boxNumber}
                totalBoxes={totalBoxes}
                storeCode={storeCode}
              />
          </div>
        ))}
      </div>
    </>
  );
}

    