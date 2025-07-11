'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillPrint } from '@/components/WaybillPrint';

export default function PrintWaybillPage() {
  const params = useParams();
  const { getWaybillById, isLoaded } = useWaybills();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const waybillToPrint = getWaybillById(id);

  useEffect(() => {
    if (isLoaded && waybillToPrint) {
      // Use a short timeout to ensure the content is rendered before printing
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, waybillToPrint]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!waybillToPrint) {
    return <div className="p-8 bg-white text-black">Waybill not found.</div>;
  }

  return (
    <div className="bg-white">
        <WaybillPrint waybill={waybillToPrint} />
    </div>
  );
}
