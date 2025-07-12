'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillSticker } from '@/components/WaybillSticker';

export default function PrintStickerPage() {
  const params = useParams();
  const { getWaybillById, isLoaded } = useWaybills();
  const [waybillToPrint, setWaybillToPrint] = useState(null);
  const printTriggered = useRef(false);
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  useEffect(() => {
    if (isLoaded) {
      const waybill = getWaybillById(id);
      setWaybillToPrint(waybill);
    }
  }, [id, isLoaded, getWaybillById]);

  useEffect(() => {
    if (waybillToPrint && !printTriggered.current) {
      // Use a short timeout to ensure the content is rendered before printing
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      printTriggered.current = true;
      return () => clearTimeout(timer);
    }
  }, [waybillToPrint]);

  if (!isLoaded || !waybillToPrint) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white flex justify-center items-center min-h-screen">
        <WaybillSticker waybill={waybillToPrint} />
    </div>
    );
}
