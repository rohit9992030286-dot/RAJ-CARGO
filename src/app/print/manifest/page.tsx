
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { useManifests } from '@/hooks/useManifests';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { ManifestPrint } from '@/components/ManifestPrint';
import { format } from 'date-fns';

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const formattedDate = format(new Date(manifestData.date), 'MMMM d, yyyy');

  return (
    <div className="bg-white">
      <ManifestPrint waybills={waybillsToPrint} date={formattedDate} vehicleNo={manifestData.vehicleNo} />
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
