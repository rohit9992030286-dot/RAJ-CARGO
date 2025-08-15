
'use client';

import { Waybill } from '@/types/waybill';
import { Truck, User, MapPin, Phone, Calendar, Hash, Box, Weight, IndianRupee, Package, FileText, Globe, Cpu, CheckCircle, Wallet } from 'lucide-react';
import Barcode from 'react-barcode';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface WaybillPrintProps {
  waybill: Waybill;
}

export function WaybillPrint({ waybill }: WaybillPrintProps) {
  const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();
  const { users, isLoading: usersLoaded } = useAuth();
  
  const getHubName = () => {
    if (!associationsLoaded || !usersLoaded) return 'N/A';

    // Find a hub or delivery partner by matching receiver's state
    const locationBasedPartner = users.find(u => 
        (u.roles.includes('hub') || u.roles.includes('delivery')) &&
        u.state?.trim().toLowerCase() === waybill.receiverState.trim().toLowerCase()
    );

    if (locationBasedPartner) {
        return locationBasedPartner.partnerName || locationBasedPartner.partnerCode;
    }
    
    // Fallback to the direct booking-to-hub association if no location match is found
    if (!waybill.partnerCode) return 'N/A';
    const hubPartnerCode = associations.bookingToHub[waybill.partnerCode];
    if (!hubPartnerCode) return 'N/A';
    
    const hubUser = users.find(u => u.partnerCode === hubPartnerCode);
    return hubUser?.partnerName || hubPartnerCode;
  };

  const isDelivered = waybill.status === 'Delivered';

  return (
    <div className="bg-white text-black font-sans mx-auto print:shadow-none print:p-0" style={{ fontSize: '10px', height: '25cm', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="border-2 border-black flex flex-col flex-grow">
          {/* Header */}
          <header className="flex justify-between items-start p-2 border-b-2 border-black">
            <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-black" />
                <div>
                    <h1 className="text-2xl font-bold text-black">RAJ CARGO</h1>
                    <p className="text-black text-xs">DELHI NAJAFGARH. PINCODE 110048</p>
                    <p className="text-black text-xs">EMAIL: RAJ89CARGO@GMAIL.COM</p>
                </div>
            </div>
            <div className="text-right">
              <h2 className="text-md font-bold uppercase tracking-wider text-black">Waybill</h2>
              <div className="flex justify-end">
                <Barcode 
                    value={waybill.waybillNumber}
                    height={30}
                    width={1.2}
                    fontSize={12}
                />
              </div>
              {waybill.tripNo && <p className="text-xs text-black mt-1 font-semibold">Trip #{waybill.tripNo}</p>}
            </div>
          </header>
          
          <div className="p-2 flex-grow flex flex-col">
              {/* Sender & Receiver Info */}
              <section className="grid grid-cols-2 gap-2">
                <div className="p-2 border-2 border-black">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-1">From (Sender)</h3>
                  <div className="space-y-0.5 text-xs">
                    <p className="flex items-center gap-2"><User className="h-3 w-3 text-black shrink-0" /> <span className="font-semibold">{waybill.senderName}</span></p>
                    <p className="flex items-start gap-2"><MapPin className="h-3 w-3 text-black shrink-0 mt-0.5" /> {waybill.senderAddress}, {waybill.senderCity}, {waybill.senderPincode}</p>
                    <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-black shrink-0" /> {waybill.senderPhone}</p>
                  </div>
                </div>
                <div className="p-2 border-2 border-black">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-1">To (Receiver)</h3>
                  <div className="space-y-0.5 text-xs">
                    <p className="flex items-center gap-2"><User className="h-3 w-3 text-black shrink-0" /> <span className="font-semibold">{waybill.receiverName}</span></p>
                    <p className="flex items-start gap-2"><MapPin className="h-3 w-3 text-black shrink-0 mt-0.5" /> {waybill.receiverAddress}, {waybill.receiverCity}, {waybill.receiverPincode}</p>
                    <p className="flex items-start gap-2"><Globe className="h-3 w-3 text-black shrink-0" /> {waybill.receiverState}</p>
                    <p className="flex items-center gap-2"><Phone className="h-3 w-3 text-black shrink-0" /> {waybill.receiverPhone}</p>
                  </div>
                </div>
              </section>

              {/* Shipment Details */}
              <section className="mt-1">
                <div className="space-y-1 text-xs">
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 gap-1">
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Ship Date</p>
                            <p className="text-sm font-bold">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
                        </div>
                         <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Payment Type</p>
                            <p className="text-sm font-bold">{waybill.paymentType}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Mode</p>
                            <p className="text-sm font-bold">Surface</p>
                        </div>
                    </div>
                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-1">
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Total Boxes</p>
                            <p className="text-sm font-bold">{waybill.numberOfBoxes}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Weight</p>
                            <p className="text-sm font-bold">{waybill.packageWeight} kg</p>
                        </div>
                    </div>
                     {/* Row 3 */}
                    <div className="grid grid-cols-3 gap-1">
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Invoice #</p>
                            <p className="text-[9px] truncate">{waybill.invoiceNumber}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Declared Value</p>
                            <p className="text-sm font-bold">₹{waybill.shipmentValue.toFixed(2)}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">E-Way Bill #</p>
                            <p className="text-[9px] truncate">{waybill.eWayBillNo || 'N/A'}</p>
                        </div>
                    </div>
                     {/* Row 4 */}
                    <div className="grid grid-cols-1 gap-1">
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Destination Hub</p>
                            <p className="text-sm font-bold uppercase">{getHubName()}</p>
                        </div>
                    </div>
                </div>
              </section>
              
              {/* Package Description */}
              <section className="mt-1 flex-grow">
                <div className="p-2 border-2 border-black min-h-[50px] flex items-start gap-2 text-xs">
                    <Package className="h-4 w-4 text-black shrink-0 mt-0.5" />
                    <span className="font-semibold mr-2">Desc:</span>
                    <p>{waybill.packageDescription}</p>
                </div>
              </section>

              {/* POD Section */}
              <section className="mt-1">
                  <div className="p-2 border-2 border-black grid grid-cols-3 gap-4 text-xs">
                    {isDelivered ? (
                      <>
                        <div className="flex items-center gap-2 col-span-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                                <p className="font-semibold text-black">Delivered On:</p>
                                <p>{waybill.deliveryDate ? format(new Date(waybill.deliveryDate), 'PPp') : 'N/A'}</p>
                            </div>
                             <div className="ml-4 pl-4 border-l border-gray-400">
                                <p className="font-semibold text-black">Received By:</p>
                                <p>{waybill.receivedBy || 'N/A'}</p>
                            </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-2">
                          <p className="font-semibold text-black mb-1">Receiver's Name & Signature:</p>
                          <div className="h-12 border-b border-gray-400"></div>
                        </div>
                        <div className="col-span-1">
                          <p className="font-semibold text-black mb-1">Date & Remarks:</p>
                          <div className="h-12 border-b border-gray-400"></div>
                        </div>
                      </>
                    )}
                  </div>
              </section>

              {/* Terms & Conditions */}
              <section className="mt-1">
                <div className="p-1 border-2 border-black text-[8px] space-y-0.5">
                  <p className="font-bold mb-0.5">Terms & Conditions:</p>
                  <p>1. All shipments are carried at the sender's risk. RAJ CARGO is not liable for any loss or damage unless insurance is purchased.</p>
                  <p>2. Liability of RAJ CARGO is limited to the declared value or ₹1,000, whichever is lower. Sender is responsible for shipping non-prohibited items.</p>
                </div>
              </section>

              {/* Footer */}
              <footer className="mt-1 pt-1 border-t-2 border-dashed border-gray-400 text-center">
                <p className="text-[9px] text-black">Generated on: {new Date().toLocaleString()}</p>
              </footer>
          </div>
      </div>
    </div>
  );
}
