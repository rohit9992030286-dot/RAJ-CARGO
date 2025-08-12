
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, User, MapPin, Phone, Calendar, Hash, Box, Weight, IndianRupee, Package, FileText, Globe, Cpu } from 'lucide-react';
import Barcode from 'react-barcode';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { useAuth } from '@/hooks/useAuth';

interface WaybillPrintProps {
  waybill: Waybill;
}

export function WaybillPrint({ waybill }: WaybillPrintProps) {
  const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();
  const { users, isLoading: usersLoaded } = useAuth();
  
  const getHubName = () => {
    if (!associationsLoaded || !usersLoaded) return 'N/A';
    
    // First, try to find a hub partner by matching receiver's state and city
    const locationBasedHub = users.find(u => 
        u.roles.includes('hub') &&
        u.state?.trim().toLowerCase() === waybill.receiverState.trim().toLowerCase() &&
        u.city?.trim().toLowerCase() === waybill.receiverCity.trim().toLowerCase()
    );

    if (locationBasedHub) {
        return locationBasedHub.partnerName || locationBasedHub.partnerCode;
    }
    
    // Fallback to the direct association if no location match is found
    if (!waybill.partnerCode) return 'N/A';
    const hubPartnerCode = associations.bookingToHub[waybill.partnerCode];
    if (!hubPartnerCode) return 'N/A';
    
    const hubUser = users.find(u => u.partnerCode === hubPartnerCode);
    return hubUser?.partnerName || hubPartnerCode;
  };

  return (
    <div className="p-4 bg-white text-black font-sans max-w-3xl mx-auto print:shadow-none print:p-2">
      {/* Header */}
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
          <h2 className="text-lg font-bold uppercase tracking-wider text-black">Waybill</h2>
           <div className="flex justify-end">
             <Barcode 
                value={waybill.waybillNumber}
                height={35}
                width={1.2}
                fontSize={12}
             />
           </div>
          {waybill.tripNo && <p className="text-xs text-black mt-1 font-semibold">Trip #{waybill.tripNo}</p>}
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
        <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg border-2 border-black">
                <Calendar className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Ship Date</p>
                <p className="text-sm">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-lg border-2 border-black">
                <Hash className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Invoice #</p>
                <p className="text-sm truncate">{waybill.invoiceNumber}</p>
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
             <div className="p-3 rounded-lg border-2 border-black col-span-2">
                <Cpu className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Hub Name</p>
                <p className="text-sm font-bold truncate">{getHubName()}</p>
            </div>
             <div className="p-3 rounded-lg border-2 border-black col-span-2">
                <IndianRupee className="h-6 w-6 text-black mx-auto mb-1" />
                <p className="font-semibold text-black text-xs">Declared Value</p>
                <p className="text-xl font-bold">₹{waybill.shipmentValue.toFixed(2)}</p>
            </div>
             {waybill.shipmentValue >= 50000 && waybill.eWayBillNo && (
                 <div className="p-3 rounded-lg border-2 border-black col-span-4">
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

      {/* Terms & Conditions */}
      <section className="my-6">
        <h3 className="text-md font-bold uppercase tracking-wider text-black mb-3">Terms & Conditions</h3>
        <div className="p-4 border-2 border-black rounded-lg text-xs space-y-1">
          <p>1. All shipments are carried at the sender's risk. RAJ CARGO is not liable for any loss or damage unless insurance is purchased.</p>
          <p>2. Do not release the package or waybill copy without confirming the identity of the authorized receiver.</p>
          <p>3. The liability of RAJ CARGO is limited to the declared value of the goods or ₹1,000, whichever is lower, unless otherwise specified.</p>
          <p>4. Prohibited items will not be accepted. The sender is responsible for any legal consequences arising from shipping restricted goods.</p>
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
