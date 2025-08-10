
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
      <header className="flex justify-between items-start pb-3 border-b-4 border-black">
        <div className="flex items-center gap-3">
            <Truck className="h-10 w-10 text-black" />
            <div>
                <h1 className="text-3xl font-bold text-black">RAJ CARGO</h1>
                <p className="text-sm text-black">DELHI NAJAFGARH. PINCODE 110048</p>
                <p className="text-sm text-black">EMAIL: RAJ89CARGO@GMAIL.COM</p>
            </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">Waybill</h2>
           <div className="flex justify-end">
             <Barcode 
                value={waybill.waybillNumber}
                height={35}
                width={1.2}
                fontSize={12}
             />
           </div>
          {waybill.invoiceNumber && <p className="text-xs text-black mt-1">Invoice #{waybill.invoiceNumber}</p>}
        </div>
      </header>
      
      {/* Sender & Receiver Info */}
      <section className="grid grid-cols-2 gap-6 my-6">
        <div className="p-4 rounded-lg border-2 border-black">
          <h3 className="text-md font-bold uppercase tracking-wider text-black mb-3">From (Sender)</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><User className="h-4 w-4 text-black shrink-0" /> <span className="font-semibold">{waybill.senderName}</span></p>
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-black shrink-0 mt-0.5" /> {waybill.senderAddress}, {waybill.senderCity}, {waybill.senderPincode}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-black shrink-0" /> {waybill.senderPhone}</p>
          </div>
        </div>
        <div className="p-4 rounded-lg border-2 border-black">
          <h3 className="text-md font-bold uppercase tracking-wider text-black mb-3">To (Receiver)</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><User className="h-4 w-4 text-black shrink-0" /> <span className="font-semibold">{waybill.receiverName}</span></p>
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-black shrink-0 mt-0.5" /> {waybill.receiverAddress}, {waybill.receiverCity}, {waybill.receiverPincode}</p>
            <p className="flex items-start gap-2"><Globe className="h-4 w-4 text-black shrink-0" /> {waybill.receiverState}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-black shrink-0" /> {waybill.receiverPhone}</p>
          </div>
        </div>
      </section>

      {/* Shipment Details */}
      <section className="my-6">
        <h3 className="text-md font-bold uppercase tracking-wider text-black mb-3">Shipment Details</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg border-2 border-black">
                <Calendar className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Ship Date & Time</p>
                <p className="text-sm">{new Date(waybill.shippingDate).toLocaleDateString()} at {waybill.shippingTime}</p>
            </div>
            <div className="p-3 rounded-lg border-2 border-black">
                <Box className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Total Boxes</p>
                <p className="text-xl font-bold">{waybill.numberOfBoxes}</p>
            </div>
             <div className="p-3 rounded-lg border-2 border-black">
                <Weight className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Total Weight</p>
                <p className="text-xl font-bold">{waybill.packageWeight} kg</p>
            </div>
             <div className="p-3 rounded-lg border-2 border-black col-span-3">
                <IndianRupee className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Declared Value</p>
                <p className="text-xl font-bold">₹{waybill.shipmentValue.toFixed(2)}</p>
            </div>
             {waybill.shipmentValue >= 50000 && waybill.eWayBillNo && (
                 <div className="p-3 rounded-lg border-2 border-black col-span-3">
                    <FileText className="h-6 w-6 text-black mx-auto mb-1" />
                    <p className="font-semibold text-black text-xs">E-Way Bill Number</p>
                    <p className="text-lg font-bold font-mono">{waybill.eWayBillNo}</p>
                </div>
             )}
        </div>
      </section>
      
      {/* Package Description */}
       <section className="my-6">
         <h3 className="text-md font-bold uppercase tracking-wider text-black mb-3">Package Contents</h3>
         <div className="p-4 border-2 border-black rounded-lg min-h-[60px] flex items-center gap-3">
            <Package className="h-6 w-6 text-black shrink-0" />
            <p>{waybill.packageDescription}</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t-2 border-dashed border-gray-400 text-center">
        <p className="text-md font-bold text-black">Thank you for shipping with RAJ CARGO! 🚀</p>
        <p className="text-xs text-black">Generated on: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}
