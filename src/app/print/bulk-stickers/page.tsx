
'use client';

import { useEffect, useRef, useState } from 'react';
import { WaybillSticker } from '@/components/WaybillSticker';
import { WaybillStickerCustom } from '@/components/WaybillStickerCustom';
import { Loader2 } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { useWaybills } from '@/hooks/useWaybills';
import { DataProvider } from '@/components/DataContext';


function BulkPrintStickersPageContent() {
  const [stickers, setStickers] = useState<{waybillId: string, boxId: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stickerSize, setStickerSize] = useState('75mm');
  const printTriggered = useRef(false);
  const { getWaybillById, isLoaded } = useWaybills();

  useEffect(() => {
    try {
      const storedStickers = sessionStorage.getItem('rajcargo-bulk-stickers');
      if (storedStickers) {
        setStickers(JSON.parse(storedStickers));
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
    if (stickers.length > 0 && isLoaded && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
        // Optional: Clean up session storage after printing
        // sessionStorage.removeItem('rajcargo-bulk-stickers');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stickers, isLoaded]);

  if (isLoading || !isLoaded) {
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

  const allStickersToPrint = stickers.map(sticker => {
    const waybill = getWaybillById(sticker.waybillId);
    return { waybill, boxId: sticker.boxId };
  }).filter(item => item.waybill !== null);


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
        {allStickersToPrint.map(({ waybill, boxId }, index) => (
          <div key={`${waybill!.id}-${boxId}-${index}`} className="print:page-break-after-always">
              <StickerComponent
                waybill={waybill!}
                boxId={boxId}
              />
          </div>
        ))}
      </div>
    </>
  );
}


export default function BulkPrintStickersPage() {
    return (
        <DataProvider>
            <BulkPrintStickersPageContent />
        </DataProvider>
    )
}
