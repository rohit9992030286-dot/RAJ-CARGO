
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { useManifests } from '@/hooks/useManifests';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { ManifestPrint } from '@/components/ManifestPrint';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';

function PrintManifestContent() {
  const searchParams = useSearchParams();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  const { getManifestById, isLoaded: manifestsLoaded } = useManifests();

  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const [manifestData, setManifestData] = useState<Manifest | null>(null);

  const printTriggered = useRef(false);

  useEffect(() => {
    if (waybillsLoaded && manifestsLoaded) {
      const manifestId = searchParams.get('id');

      if (manifestId) {
        const manifest = getManifestById(manifestId);
        if (manifest) {
          setManifestData(manifest);
          const manifestWaybills = manifest.waybillIds.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w);
          setWaybillsToPrint(manifestWaybills);
        }
      }
    }
  }, [waybillsLoaded, manifestsLoaded, searchParams, getWaybillById, getManifestById]);

  useEffect(() => {
    if (waybillsToPrint.length > 0 && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waybillsToPrint]);

  if (!waybillsLoaded || !manifestsLoaded || !manifestData) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const formattedDate = manifestData.date ? format(new Date(manifestData.date), 'MMMM d, yyyy') : 'N/A';

  return (
    <div className="bg-white">
      <ManifestPrint waybills={waybillsToPrint} date={formattedDate} vehicleNo={manifestData.vehicleNo} />
    </div>
  );
}

function PrintManifestPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <PrintManifestContent />
        </Suspense>
    )
}

export default function PrintManifestPage() {
    return (
      <DataProvider>
        <PrintManifestPageWrapper />
      </DataProvider>
    )
}
