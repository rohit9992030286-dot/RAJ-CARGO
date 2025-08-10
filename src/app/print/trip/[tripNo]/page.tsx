
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { format } from 'date-fns';
import { Loader2, Truck } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import Barcode from 'react-barcode';

function TripPrintLayout({ waybills, tripNo }: { waybills: Waybill[], tripNo: string }) {
  const totalBoxes = waybills.reduce((acc, w) => acc + w.numberOfBoxes, 0);
  const totalWeight = waybills.reduce((acc, w) => acc + w.packageWeight, 0);
  const formattedDate = new Date().toLocaleDateString();
  const borderedCell = "border-r border-black last:border-r-0";

  return (
    <div className="p-4 bg-white text-black font-sans max-w-4xl mx-auto print:shadow-none print:p-2">
      <header className="flex justify-between items-start p-4 border-2 border-black">
        <div className="flex items-center gap-3">
          <Truck className="h-10 w-10 text-black" />
          <div>
            <h1 className="text-3xl font-bold text-black">RAJ CARGO</h1>
            <p className="text-black text-sm">DELHI NAJAFGARH. PINCODE 110048</p>
            <p className="text-black text-sm">EMAIL: RAJ89CARGO@GMAIL.COM</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-wider text-black">TRIP SHEET: {tripNo}</h2>
          <div className="flex justify-end">
             <Barcode 
                value={tripNo}
                height={35}
                width={1.2}
                fontSize={12}
                displayValue={false}
             />
           </div>
          <p className="text-sm font-semibold text-black mt-1">Date: {formattedDate}</p>
        </div>
      </header>
      
      <main className="my-4 border-2 border-black border-b-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className={`w-[50px] ${borderedCell}`}>S.No.</TableHead>
              <TableHead className={`w-[140px] ${borderedCell}`}>Waybill #</TableHead>
              <TableHead className={borderedCell}>Receiver</TableHead>
              <TableHead className={borderedCell}>Destination</TableHead>
              <TableHead className={`text-right ${borderedCell}`}>Boxes</TableHead>
              <TableHead className={`text-right ${borderedCell}`}>Weight (kg)</TableHead>
              <TableHead className="w-[150px]">Signature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waybills.map((waybill, index) => (
              <TableRow key={waybill.id}>
                <TableCell className={`font-medium ${borderedCell}`}>{index + 1}</TableCell>
                <TableCell className={`font-medium ${borderedCell}`}>{waybill.waybillNumber}</TableCell>
                <TableCell className={borderedCell}>{waybill.receiverName}</TableCell>
                <TableCell className={borderedCell}>{waybill.receiverCity}, {waybill.receiverPincode}</TableCell>
                <TableCell className={`text-right ${borderedCell}`}>{waybill.numberOfBoxes}</TableCell>
                <TableCell className={`text-right ${borderedCell}`}>{waybill.packageWeight.toFixed(2)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold text-base bg-gray-100 border-t-2 border-black">
              <TableCell colSpan={4} className={borderedCell}>Totals</TableCell>
              <TableCell className={`text-right ${borderedCell}`}>{totalBoxes}</TableCell>
              <TableCell className={`text-right ${borderedCell}`}>{totalWeight.toFixed(2)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption className="border-t border-black">Trip sheet generated on {new Date().toLocaleString()}. Total of {waybills.length} waybills.</TableCaption>
        </Table>
      </main>
    </div>
  );
}

function PrintTripContent() {
  const params = useParams();
  const tripNo = Array.isArray(params.tripNo) ? params.tripNo[0] : params.tripNo;
  const { allWaybills, isLoaded } = useWaybills();
  
  const [waybillsToPrint, setWaybillsToPrint] = useState<Waybill[]>([]);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (isLoaded && tripNo) {
      const tripWaybills = allWaybills.filter(w => w.tripNo === tripNo);
      setWaybillsToPrint(tripWaybills);
    }
  }, [isLoaded, tripNo, allWaybills]);

  useEffect(() => {
    if (waybillsToPrint.length > 0 && !printTriggered.current) {
      printTriggered.current = true;
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [waybillsToPrint]);

  if (!isLoaded) {
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
        <div className="bg-white">
            <TripPrintLayout waybills={waybillsToPrint} tripNo={tripNo} />
        </div>
    </>
  );
}

function PrintTripPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-white"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <PrintTripContent />
        </Suspense>
    )
}

export default function PrintTripPage() {
    return (
      <DataProvider>
        <PrintTripPageWrapper />
      </DataProvider>
    )
}
