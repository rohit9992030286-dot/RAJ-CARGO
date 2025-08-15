
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillPrint } from '@/components/WaybillPrint';
import { Waybill } from '@/types/waybill';
import { DataProvider } from '@/components/DataContext';
import { Loader2 } from 'lucide-react';

function PrintWaybillContent() {
  const params = useParams();
  const { getWaybillById, isLoaded } = useWaybills();
  const [waybillToPrint, setWaybillToPrint] = useState<Waybill | null | undefined>(undefined);
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
      return () => clearTimeout(timer);
    }
  }, [waybillToPrint]);

  if (!isLoaded || waybillToPrint === undefined) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (waybillToPrint === null) {
      return <div>Waybill not found.</div>
  }
  
  const printStyles = `
    @media print {
      @page {
        size: A4;
        margin: 0.5in;
      }
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <div className="bg-white px-4">
          <WaybillPrint waybill={waybillToPrint} />
      </div>
    </>
  );
}

function PrintWaybillPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <PrintWaybillContent />
        </Suspense>
    )
}

export default function PrintWaybillPage() {
    return (
        <DataProvider>
            <PrintWaybillPageWrapper />
        </DataProvider>
    )
}
