
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, User, MapPin, Phone, Calendar, Hash, Box, Weight, DollarSign, Package } from 'lucide-react';

interface WaybillPrintProps {
  waybill: Waybill;
}

export function WaybillPrint({ waybill }: WaybillPrintProps) {
  return (
    <div className="p-8 bg-white text-black font-sans max-w-4xl mx-auto print:shadow-none print:p-0">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b-4 border-primary">
        <div className="flex items-center gap-3">
            <Truck className="h-12 w-12 text-primary" />
            <div>
                <h1 className="text-4xl font-bold text-primary">SS CARGO</h1>
                <p className="text-muted-foreground">Transport & Courier Service</p>
            </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-500">Waybill</h2>
          <p className="text-2xl font-bold text-primary">#{waybill.waybillNumber}</p>
          <p className="text-sm text-gray-500">Invoice #{waybill.invoiceNumber}</p>
        </div>
      </header>
      
      {/* Sender & Receiver Info */}
      <section className="grid grid-cols-2 gap-8 my-8">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-4">From (Sender)</h3>
          <div className="space-y-3">
            <p className="flex items-center gap-3 text-lg"><User className="h-5 w-5 text-gray-500 shrink-0" /> <span className="font-semibold">{waybill.senderName}</span></p>
            <p className="flex items-start gap-3"><MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-1" /> {waybill.senderAddress}, {waybill.senderPincode}</p>
            <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-500 shrink-0" /> {waybill.senderPhone}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-4">To (Receiver)</h3>
          <div className="space-y-3">
            <p className="flex items-center gap-3 text-lg"><User className="h-5 w-5 text-gray-500 shrink-0" /> <span className="font-semibold">{waybill.receiverName}</span></p>
            <p className="flex items-start gap-3"><MapPin className="h-5 w-5 text-gray-500 shrink-0 mt-1" /> {waybill.receiverAddress}, {waybill.receiverPincode}</p>
            <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-500 shrink-0" /> {waybill.receiverPhone}</p>
          </div>
        </div>
      </section>

      {/* Shipment Details */}
      <section className="my-8">
        <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-4">Shipment Details</h3>
        <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold text-blue-800">Ship Date & Time</p>
                <p className="text-lg">{new Date(waybill.shippingDate).toLocaleDateString()} at {waybill.shippingTime}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Box className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-800">Total Boxes</p>
                <p className="text-2xl font-bold">{waybill.numberOfBoxes}</p>
            </div>
             <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <Weight className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-amber-800">Total Weight</p>
                <p className="text-2xl font-bold">{waybill.packageWeight} kg</p>
            </div>
             <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-3">
                <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="font-semibold text-purple-800">Declared Value</p>
                <p className="text-2xl font-bold">${waybill.shipmentValue.toFixed(2)}</p>
            </div>
        </div>
      </section>
      
      {/* Package Description */}
       <section className="my-8">
         <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-4">Package Contents</h3>
         <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 min-h-[100px] flex items-center gap-4">
            <Package className="h-8 w-8 text-gray-500 shrink-0" />
            <p className="text-lg">{waybill.packageDescription}</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t-2 border-dashed border-gray-300 text-center">
        <p className="text-lg font-bold text-primary">Thank you for shipping with SS CARGO! 🚀</p>
        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}
