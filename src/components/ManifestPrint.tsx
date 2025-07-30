
'use client';

import { Waybill } from '@/types/waybill';
import { Truck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import { Manifest } from '@/types/manifest';

interface ManifestPrintProps {
  waybills: Waybill[];
  manifest: Manifest;
}

export function ManifestPrint({ waybills, manifest }: ManifestPrintProps) {
  const totalBoxes = waybills.reduce((acc, w) => acc + w.numberOfBoxes, 0);
  const totalWeight = waybills.reduce((acc, w) => acc + w.packageWeight, 0);
  const formattedDate = manifest.date ? new Date(manifest.date).toLocaleDateString() : 'N/A';

  return (
    <div className="p-8 bg-white text-black font-sans max-w-4xl mx-auto print:shadow-none print:p-2">
      <header className="flex justify-between items-start pb-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
            <Truck className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-primary">RAJ CARGO</h1>
                <p className="text-muted-foreground">Transport & Courier Service</p>
            </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-700">Daily Manifest</h2>
          <p className="text-lg font-semibold text-gray-600">{formattedDate}</p>
          <p className="text-base font-semibold text-gray-500 mt-1">Vehicle No: {manifest.vehicleNo}</p>
        </div>
      </header>
      
      <main className="my-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Waybill #</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="text-right">Boxes</TableHead>
              <TableHead className="text-right">Weight (kg)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waybills.map((waybill) => (
              <TableRow key={waybill.id}>
                <TableCell className="font-medium">{waybill.waybillNumber}</TableCell>
                <TableCell>{waybill.senderName}</TableCell>
                <TableCell>{waybill.receiverName}</TableCell>
                <TableCell>{waybill.receiverCity}, {waybill.receiverPincode}</TableCell>
                <TableCell className="text-right">{waybill.numberOfBoxes}</TableCell>
                <TableCell className="text-right">{waybill.packageWeight.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold text-base bg-gray-100">
              <TableCell colSpan={4}>Totals</TableCell>
              <TableCell className="text-right">{totalBoxes}</TableCell>
              <TableCell className="text-right">{totalWeight.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption>Manifest generated on {new Date().toLocaleString()}. Total of {waybills.length} waybills.</TableCaption>
        </Table>
      </main>

       <footer className="mt-12 pt-6 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-8 text-sm">
        <div>
            <p className="font-bold mb-2">Driver's Name: <span className="font-normal">{manifest.driverName || '____________________'}</span></p>
            <p className="font-bold mb-2 mt-4">Driver's Contact: <span className="font-normal">{manifest.driverContact || '____________________'}</span></p>
        </div>
        <div>
            <p className="font-bold mb-2">Driver's Signature:</p>
            <div className="h-12 border-b border-gray-400"></div>
        </div>
       </footer>
    </div>
  );
}
