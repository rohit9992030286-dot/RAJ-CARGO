
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillPrint } from '@/components/WaybillPrint';
import { Waybill } from '@/types/waybill';
import { DataProvider } from '@/components/DataContext';
import { Loader2 } from 'lucide-react';

function PrintWaybillsContent() {
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
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
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
        {waybillsToPrint.map((waybill, index) => (
          <div key={waybill.id} className="print:page-break-after-always">
            <WaybillPrint waybill={waybill} />
          </div>
        ))}
      </div>
    </>
  );
}

function PrintWaybillsPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <PrintWaybillsContent />
        </Suspense>
    )
}

export default function PrintWaybillsPage() {
    return (
        <DataProvider>
           <PrintWaybillsPageWrapper />
        </DataProvider>
    )
}
