'use client';

import { Waybill } from '@/types/waybill';
import { Truck } from 'lucide-react';

interface WaybillPrintProps {
  waybill: Waybill;
}

export function WaybillPrint({ waybill }: WaybillPrintProps) {
  return (
    <div className="p-8 bg-white text-black font-sans max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b-2 border-black">
        <div>
          <h1 className="text-3xl font-bold">SwiftWay</h1>
          <p>Transport & Courier Service</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">Waybill</h2>
          <p className="text-lg">#{waybill.waybillNumber}</p>
        </div>
      </header>
      
      <section className="grid grid-cols-2 gap-8 my-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">From (Sender)</h3>
          <div className="text-lg">
            <p className="font-bold">{waybill.senderName}</p>
            <p>{waybill.senderAddress}</p>
            <p>{waybill.senderPincode}</p>
            <p>Phone: {waybill.senderPhone}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">To (Receiver)</h3>
          <div className="text-lg">
            <p className="font-bold">{waybill.receiverName}</p>
            <p>{waybill.receiverAddress}</p>
            <p>{waybill.receiverPincode}</p>
            <p>Phone: {waybill.receiverPhone}</p>
          </div>
        </div>
      </section>

      <section className="my-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">Shipment Details</h3>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2 pr-4">Ship Date</th>
              <th className="py-2 px-4">Invoice #</th>
              <th className="py-2 px-4">Total Boxes</th>
              <th className="py-2 px-4">Total Weight</th>
              <th className="py-2 pl-4 text-right">Declared Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-lg">
              <td className="py-2 pr-4">{new Date(waybill.shippingDate).toLocaleDateString()} at {waybill.shippingTime}</td>
              <td className="py-2 px-4">{waybill.invoiceNumber}</td>
              <td className="py-2 px-4">{waybill.numberOfBoxes}</td>
              <td className="py-2 px-4">{waybill.packageWeight} kg</td>
              <td className="py-2 pl-4 text-right">${waybill.shipmentValue.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="my-6">
         <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-2">Package Description</h3>
         <p className="p-4 border border-gray-300 rounded-md bg-gray-50 min-h-[80px] text-lg">
            {waybill.packageDescription}
         </p>
      </section>

      <footer className="mt-12 pt-6 border-t-2 border-black text-center">
        <p className="font-bold">Thank you for shipping with SwiftWay!</p>
        <p className="text-sm text-gray-600">Generated on: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}
