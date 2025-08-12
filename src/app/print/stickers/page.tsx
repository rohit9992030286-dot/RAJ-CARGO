
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillSticker } from '@/components/WaybillSticker';
import { WaybillStickerCustom } from '@/components/WaybillStickerCustom';
import { Waybill } from '@/types/waybill';
import { DataProvider } from '@/components/DataContext';
import { Loader2 } from 'lucide-react';

function PrintStickersContent() {
  const searchParams = useSearchParams();
  const { getWaybillById, isLoaded } = useWaybills();
  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const [stickerSize, setStickerSize] = useState('75mm');
  const printTriggered = useRef(false);

  useEffect(() => {
    if (isLoaded) {
      const ids = searchParams.get('ids')?.split(',') || [];
      const waybills = ids.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w);
      
      // Sort by receiver city
      waybills.sort((a, b) => {
        const cityA = (a.receiverCity || '').toUpperCase();
        const cityB = (b.receiverCity || '').toUpperCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        // Then by waybill number
        return a.waybillNumber.localeCompare(b.waybillNumber, undefined, { numeric: true });
      });

      setWaybillsToPrint(waybills);
    }
    const storedSize = localStorage.getItem('rajcargo-stickerSize');
    if (storedSize) {
        setStickerSize(storedSize);
    }
  }, [isLoaded, searchParams, getWaybillById]);

  useEffect(() => {
    if (waybillsToPrint.length > 0 && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waybillsToPrint]);

  if (!isLoaded || waybillsToPrint.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const allStickers: { waybill: Waybill; boxNumber: number; totalBoxes: number }[] = [];
  waybillsToPrint.forEach(waybill => {
    const totalBoxes = waybill.numberOfBoxes || 1;
    for (let i = 1; i <= totalBoxes; i++) {
        allStickers.push({ waybill, boxNumber: i, totalBoxes });
    }
  });

  const StickerComponent = stickerSize === 'custom' ? WaybillStickerCustom : WaybillSticker;

  const printStyles = `
    @media print {
      @page {
        size: ${stickerSize === '75mm' ? '75mm 75mm' : '9cm 7.3cm'};
        margin: 0;
      }
      html, body {
        width: ${stickerSize === '75mm' ? '75mm' : '9cm'};
        height: ${stickerSize === '75mm' ? '75mm' : '7.3cm'};
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
      }
      .sticker-container {
        page-break-after: always;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
      }
    }
  `;


  return (
    <>
      <style>{printStyles}</style>
      <div className="bg-white">
        {allStickers.map(({ waybill, boxNumber, totalBoxes }, index) => (
          <div key={`${waybill.id}-${boxNumber}`} className="sticker-container">
              <StickerComponent 
                waybill={waybill}
                boxNumber={boxNumber}
                totalBoxes={totalBoxes}
              />
          </div>
        ))}
      </div>
    </>
  );
}

function PrintStickersPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <PrintStickersContent />
        </Suspense>
    )
}

export default function PrintStickersPage() {
    return (
        <DataProvider>
           <PrintStickersPageWrapper />
        </DataProvider>
    )
}
