
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { ManifestPrint } from '@/components/ManifestPrint';
import { format } from 'date-fns';

function PrintManifestContent() {
  const searchParams = useSearchParams();
  const { waybills, isLoaded } = useWaybills();
  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const [manifestDate, setManifestDate] = useState<string | null>(null);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (isLoaded) {
      const dateStr = searchParams.get('date');
      setManifestDate(dateStr);
      if (dateStr) {
        const targetDate = new Date(dateStr);
        const waybillsForDate = waybills.filter(w => new Date(w.shippingDate).toDateString() === targetDate.toDateString());
        setWaybillsToPrint(waybillsForDate);
      }
    }
  }, [isLoaded, searchParams, waybills]);

  useEffect(() => {
    if (waybillsToPrint.length > 0 && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waybillsToPrint]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formattedDate = manifestDate ? format(new Date(manifestDate), 'MMMM d, yyyy') : 'N/A';

  return (
    <div className="bg-white">
      <ManifestPrint waybills={waybillsToPrint} date={formattedDate} />
    </div>
  );
}


export default function PrintManifestPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintManifestContent />
        </Suspense>
    )
}
