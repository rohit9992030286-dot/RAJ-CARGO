
'use client';

import { Waybill } from '@/types/waybill';
import { Truck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import { Manifest } from '@/types/manifest';
import Barcode from 'react-barcode';

interface ManifestPrintProps {
  waybills: Waybill[];
  manifest: Manifest;
}

const chunkArray = (array: any[], size: number) => {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i += size) {
    chunked_arr.push(array.slice(i, i + size));
  }
  return chunked_arr;
};


export function ManifestPrint({ waybills, manifest }: ManifestPrintProps) {
  const totalBoxes = waybills.reduce((acc, w) => acc + w.numberOfBoxes, 0);
  const totalWeight = waybills.reduce((acc, w) => acc + w.packageWeight, 0);
  const formattedDate = manifest.date ? new Date(manifest.date).toLocaleDateString() : 'N/A';
  
  const borderedCell = "border-r border-black last:border-r-0";
  const waybillChunks = chunkArray(waybills, 25);

  return (
    <div className="p-1 bg-white text-black font-sans mx-auto print:shadow-none print:p-0">
      {waybillChunks.map((chunk, pageIndex) => (
        <div key={pageIndex} className="print:page-break-after-always last:print:page-break-after-auto">
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
              <h2 className="text-xl font-bold uppercase tracking-wider text-black">MANIFEST: {manifest.manifestNo}</h2>
              <div className="flex justify-end">
                 <Barcode 
                    value={manifest.manifestNo}
                    height={35}
                    width={1.2}
                    fontSize={12}
                    displayValue={false}
                 />
               </div>
              <p className="text-sm font-semibold text-black mt-1">Date: {formattedDate} | Vehicle No: {manifest.vehicleNo}</p>
              <p className="text-sm font-semibold text-black">Page: {pageIndex + 1} of {waybillChunks.length}</p>
            </div>
          </header>
          
          <main className="my-4 border-2 border-black border-b-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black">
                  <TableHead className={`w-[50px] ${borderedCell}`}>S.No.</TableHead>
                  <TableHead className={`w-[140px] ${borderedCell}`}>Waybill #</TableHead>
                  <TableHead className={borderedCell}>Sender</TableHead>
                  <TableHead className={borderedCell}>Receiver</TableHead>
                  <TableHead className={borderedCell}>Destination</TableHead>
                  <TableHead className={`text-right ${borderedCell}`}>Boxes</TableHead>
                  <TableHead className="text-right">Weight (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chunk.map((waybill, index) => (
                  <TableRow key={waybill.id}>
                    <TableCell className={`font-medium ${borderedCell}`}>{pageIndex * 25 + index + 1}</TableCell>
                    <TableCell className={`font-medium ${borderedCell}`}>{waybill.waybillNumber}</TableCell>
                    <TableCell className={borderedCell}>{waybill.senderName}</TableCell>
                    <TableCell className={borderedCell}>{waybill.receiverName}</TableCell>
                    <TableCell className={borderedCell}>{waybill.receiverCity}, {waybill.receiverPincode}</TableCell>
                    <TableCell className={`text-right ${borderedCell}`}>{waybill.numberOfBoxes}</TableCell>
                    <TableCell className="text-right">{waybill.packageWeight.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {pageIndex === waybillChunks.length - 1 && (
                  <TableFooter>
                    <TableRow className="font-bold text-base bg-gray-100 border-t-2 border-black">
                      <TableCell colSpan={5} className={borderedCell}>Totals</TableCell>
                      <TableCell className={`text-right ${borderedCell}`}>{totalBoxes}</TableCell>
                      <TableCell className="text-right">{totalWeight.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableFooter>
              )}
            </Table>
          </main>

          {pageIndex === waybillChunks.length - 1 && (
             <footer className="mt-4 p-4 border-2 border-black grid grid-cols-2 gap-8 text-sm">
                <div>
                    <p className="font-bold mb-2">Driver's Name: <span className="font-normal">{manifest.driverName || '____________________'}</span></p>
                    <p className="font-bold mb-2 mt-4">Driver's Contact: <span className="font-normal">{manifest.driverContact || '____________________'}</span></p>
                </div>
                <div>
                    <p className="font-bold mb-2">Driver's Signature:</p>
                    <div className="h-12 border-b border-gray-400"></div>
                </div>
             </footer>
          )}
        </div>
      ))}
    </div>
  );
}
