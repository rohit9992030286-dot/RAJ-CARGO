
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, User, MapPin, Phone, Calendar, Hash, Box, Weight, IndianRupee, Package, FileText, Globe } from 'lucide-react';
import Barcode from 'react-barcode';

interface WaybillPrintProps {
  waybill: Waybill;
}

export function WaybillPrint({ waybill }: WaybillPrintProps) {
  return (
    <div className="p-4 bg-white text-black font-sans max-w-3xl mx-auto print:shadow-none print:p-2">
      {/* Header */}
      <header className="flex justify-between items-start pb-3 border-b-4 border-primary">
        <div className="flex items-center gap-3">
            <Truck className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-primary">RAJ CARGO</h1>
                <p className="text-sm text-gray-500">DELHI NAJAFGARH. PINCODE 110048</p>
                <p className="text-sm text-gray-500">EMAIL: RAJ89CARGO@GMAIL.COM</p>
            </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gray-500">Waybill</h2>
           <div className="flex justify-end">
             <Barcode 
                value={waybill.waybillNumber}
                height={35}
                width={1.2}
                fontSize={12}
             />
           </div>
          {waybill.invoiceNumber && <p className="text-xs text-gray-500 mt-1">Invoice #{waybill.invoiceNumber}</p>}
        </div>
      </header>
      
      {/* Sender & Receiver Info */}
      <section className="grid grid-cols-2 gap-6 my-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-bold uppercase tracking-wider text-primary mb-3">From (Sender)</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-500 shrink-0" /> <span className="font-semibold">{waybill.senderName}</span></p>
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" /> {waybill.senderAddress}, {waybill.senderCity}, {waybill.senderPincode}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500 shrink-0" /> {waybill.senderPhone}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-bold uppercase tracking-wider text-primary mb-3">To (Receiver)</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-500 shrink-0" /> <span className="font-semibold">{waybill.receiverName}</span></p>
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" /> {waybill.receiverAddress}, {waybill.receiverCity}, {waybill.receiverPincode}</p>
            <p className="flex items-start gap-2"><Globe className="h-4 w-4 text-gray-500 shrink-0" /> {waybill.receiverState}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500 shrink-0" /> {waybill.receiverPhone}</p>
          </div>
        </div>
      </section>

      {/* Shipment Details */}
      <section className="my-6">
        <h3 className="text-md font-bold uppercase tracking-wider text-primary mb-3">Shipment Details</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                <p className="font-semibold text-blue-800 text-xs">Ship Date & Time</p>
                <p className="text-sm">{new Date(waybill.shippingDate).toLocaleDateString()} at {waybill.shippingTime}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <Box className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <p className="font-semibold text-green-800 text-xs">Total Boxes</p>
                <p className="text-xl font-bold">{waybill.numberOfBoxes}</p>
            </div>
             <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <Weight className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                <p className="font-semibold text-amber-800 text-xs">Total Weight</p>
                <p className="text-xl font-bold">{waybill.packageWeight} kg</p>
            </div>
             <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 col-span-3">
                <IndianRupee className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                <p className="font-semibold text-purple-800 text-xs">Declared Value</p>
                <p className="text-xl font-bold">₹{waybill.shipmentValue.toFixed(2)}</p>
            </div>
             {waybill.shipmentValue >= 50000 && waybill.eWayBillNo && (
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-3">
                    <FileText className="h-6 w-6 text-slate-500 mx-auto mb-1" />
                    <p className="font-semibold text-slate-800 text-xs">E-Way Bill Number</p>
                    <p className="text-lg font-bold font-mono">{waybill.eWayBillNo}</p>
                </div>
             )}
        </div>
      </section>
      
      {/* Package Description */}
       <section className="my-6">
         <h3 className="text-md font-bold uppercase tracking-wider text-primary mb-3">Package Contents</h3>
         <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px] flex items-center gap-3">
            <Package className="h-6 w-6 text-gray-500 shrink-0" />
            <p>{waybill.packageDescription}</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t-2 border-dashed border-gray-300 text-center">
        <p className="text-md font-bold text-primary">Thank you for shipping with RAJ CARGO! 🚀</p>
        <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}
