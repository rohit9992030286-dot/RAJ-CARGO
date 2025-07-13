
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillSticker } from '@/components/WaybillSticker';
import { Waybill } from '@/types/waybill';

function PrintStickersContent() {
  const searchParams = useSearchParams();
  const { getWaybillById, isLoaded } = useWaybills();
  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (isLoaded) {
      const ids = searchParams.get('ids')?.split(',') || [];
      const waybills = ids.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w);
      setWaybillsToPrint(waybills);
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
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


  return (
    <div className="bg-white">
      {allStickers.map(({ waybill, boxNumber, totalBoxes }, index) => (
        <div key={`${waybill.id}-${boxNumber}`} className="print:page-break-after-always flex justify-center items-center min-h-screen">
            <WaybillSticker 
              waybill={waybill}
              boxNumber={boxNumber}
              totalBoxes={totalBoxes}
            />
        </div>
      ))}
    </div>
  );
}

export default function PrintStickersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintStickersContent />
        </Suspense>
    )
}
