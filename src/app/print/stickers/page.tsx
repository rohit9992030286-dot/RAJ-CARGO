
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillSticker } from '@/components/WaybillSticker';
import { Waybill } from '@/types/waybill';
import { DataProvider } from '@/components/DataContext';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';

function PrintStickersContent() {
  const searchParams = useSearchParams();
  const { getWaybillById, isLoaded } = useWaybills();
  const { users, isLoading: usersLoading } = useAuth();
  const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();

  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const printTriggered = useRef(false);

  useEffect(() => {
    const source = searchParams.get('source');

    if (source === 'excel') {
        const stickerData = sessionStorage.getItem('rajcargo-excel-sticker');
        if (stickerData) {
            const parsedData = JSON.parse(stickerData);
            setWaybillsToPrint([parsedData as Waybill]);
        }
    } else if (isLoaded) {
      const ids = searchParams.get('ids')?.split(',') || [];
      const waybills = ids.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w);
      
      waybills.sort((a, b) => {
        const cityA = (a.receiverCity || '').toUpperCase();
        const cityB = (b.receiverCity || '').toUpperCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        return a.waybillNumber.localeCompare(b.waybillNumber, undefined, { numeric: true });
      });

      setWaybillsToPrint(waybills);
    }
    
  }, [isLoaded, searchParams, getWaybillById]);

  useEffect(() => {
    if (waybillsToPrint.length > 0 && !printTriggered.current && !usersLoading && associationsLoaded) {
      printTriggered.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waybillsToPrint, usersLoading, associationsLoaded]);

  if ((!isLoaded && !searchParams.get('source')) || waybillsToPrint.length === 0 || usersLoading || !associationsLoaded) {
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

  const getPartnerInfo = (waybill: Waybill) => {
    if (!waybill.partnerCode) {
      return { bookingPartnerName: 'N/A', deliveryPartnerName: 'N/A' };
    }

    const bookingUser = users.find(u => u.partnerCode === waybill.partnerCode);
    const bookingPartnerName = bookingUser?.username || waybill.partnerCode;

    let deliveryPartnerName = 'N/A';
    const destinationHubCode = associations.bookingToHub[waybill.partnerCode];
    
    if (destinationHubCode) {
      const deliveryPartnerCode = associations.hubToDelivery[destinationHubCode];
      if (deliveryPartnerCode) {
        const deliveryUser = users.find(u => u.partnerCode === deliveryPartnerCode);
        deliveryPartnerName = deliveryUser?.username || deliveryPartnerCode;
      } else {
        const hubUser = users.find(u => u.partnerCode === destinationHubCode);
        deliveryPartnerName = hubUser?.username || destinationHubCode;
      }
    }
    
    return { bookingPartnerName, deliveryPartnerName };
  };

  const printStyles = `
    @media print {
      @page {
        size: 75mm 75mm;
        margin: 0;
      }
      html, body {
        width: 75mm;
        height: 75mm;
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
        {allStickers.map(({ waybill, boxNumber, totalBoxes }, index) => {
          const { bookingPartnerName, deliveryPartnerName } = getPartnerInfo(waybill);
          return (
            <div key={`${waybill.id}-${boxNumber}`} className="sticker-container">
                <WaybillSticker
                  waybill={waybill}
                  boxNumber={boxNumber}
                  totalBoxes={totalBoxes}
                  bookingPartnerName={bookingPartnerName}
                  deliveryPartnerName={deliveryPartnerName}
                />
            </div>
          )
        })}
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
