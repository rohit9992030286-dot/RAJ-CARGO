
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillSticker } from '@/components/WaybillSticker';
import { Waybill } from '@/types/waybill';

function PrintStickerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { getWaybillById, isLoaded } = useWaybills();
  const [waybillToPrint, setWaybillToPrint] = useState<Waybill | null | undefined>(undefined);
  const printTriggered = useRef(false);
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const storeCode = searchParams.get('storeCode');
  const boxNumber = searchParams.get('boxNumber');
  const totalBoxes = searchParams.get('totalBoxes');

  useEffect(() => {
    if (isLoaded) {
      const waybill = getWaybillById(id);
      setWaybillToPrint(waybill);
    }
  }, [id, isLoaded, getWaybillById]);

  useEffect(() => {
    if (waybillToPrint && !printTriggered.current) {
      printTriggered.current = true;
      // Use a short timeout to ensure the content is rendered before printing
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waybillToPrint]);

  if (!isLoaded || waybillToPrint === undefined) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (waybillToPrint === null) {
      return <div>Waybill not found.</div>
  }
  
  return (
    <div className="bg-white flex justify-center items-center min-h-screen">
        <WaybillSticker 
          waybill={waybillToPrint} 
          storeCode={storeCode}
          boxNumber={boxNumber ? parseInt(boxNumber, 10) : undefined}
          totalBoxes={totalBoxes ? parseInt(totalBoxes, 10) : undefined}
        />
    </div>
    );
}

export default function PrintStickerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintStickerContent />
        </Suspense>
    )
}
