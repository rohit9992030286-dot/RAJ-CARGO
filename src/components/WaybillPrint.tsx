'use client';

import { Waybill } from '@/types/waybill';
import { Truck, User, MapPin, Phone, Calendar, Hash, Box, Weight, IndianRupee, Package, FileText, Globe, Cpu, CheckCircle, Wallet, Briefcase, Star } from 'lucide-react';
import Barcode from 'react-barcode';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Manifest } from '@/types/manifest';

interface WaybillPrintProps {
  waybill: Waybill;
  copyType: 'Receiver Copy' | 'POD Copy';
}

function WaybillCopy({ waybill, copyType }: WaybillPrintProps) {
  const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();
  const { users, isLoading: usersLoaded } = useAuth();
  
  const getPartnerInfo = () => {
    if (!associationsLoaded || !usersLoaded || !waybill.partnerCode) {
      return { bookingPartner: 'N/A', deliveryPartner: 'N/A' };
    }

    const bookingUser = users.find(u => u.partnerCode === waybill.partnerCode);
    const bookingPartner = bookingUser?.partnerName || bookingUser?.username || waybill.partnerCode;

    let deliveryPartnerName = 'N/A';
    const destinationHubCode = associations.bookingToHub[waybill.partnerCode];
    
    if (destinationHubCode) {
      const deliveryPartnerCode = associations.hubToDelivery[destinationHubCode];
      if (deliveryPartnerCode) {
        const deliveryUser = users.find(u => u.partnerCode === deliveryPartnerCode);
        deliveryPartnerName = deliveryUser?.partnerName || deliveryUser?.username || deliveryPartnerCode;
      } else {
        const hubUser = users.find(u => u.partnerCode === destinationHubCode);
        deliveryPartnerName = hubUser?.partnerName || hubUser?.username || destinationHubCode;
      }
    }
    
    return { bookingPartner, deliveryPartner: deliveryPartnerName };
  };

  const isDelivered = waybill.status === 'Delivered';
  const { bookingPartner, deliveryPartner } = getPartnerInfo();

  return (
    <div className="bg-white text-black font-sans mx-auto print:shadow-none" style={{ fontSize: '10px', height: '12.5cm', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="border-2 border-black flex flex-col flex-grow">
          {/* Header */}
          <header className="flex justify-between items-center p-2 border-b-2 border-black">
            <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 10,80 L 50,80 M 5,100 L 45,100" stroke="black" strokeWidth="10" strokeLinecap="round" />
                        <path d="M 60,60 Q 110,180 160,60 L 145,50 Q 110,140 75,50 Z" fill="black" />
                        <path d="M 110,20 L 120,45 L 145,45 L 125,60 L 135,85 L 110,70 L 85,85 L 95,60 L 75,45 L 100,45 Z" fill="black" />
                        <path d="M 95,160 L 125,160 L 140,185 L 80,185 Z" fill="black" />
                        <rect x="105" y="140" width="10" height="25" fill="black" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-black uppercase">YU-WON LOGISTICS</h1>
                    <p className="text-black text-[8px] tracking-tight">DELHI NAJAFGARH. PINCODE 110048 | EMAIL: contact@yuwonlogistics.com</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <h2 className="text-md font-bold uppercase tracking-wider text-black">{copyType}</h2>
              <div className="h-[35px]">
                <Barcode 
                    value={waybill.waybillNumber}
                    height={30}
                    width={1.2}
                    fontSize={12}
                />
              </div>
              {waybill.tripNo && <p className="text-xs text-black font-semibold">Trip #{waybill.tripNo}</p>}
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
                    <div className="grid grid-cols-5 gap-1">
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Ship Date</p>
                            <p className="text-sm font-bold">{new Date(waybill.shippingDate).toLocaleDateString()}</p>
                        </div>
                         <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Payment</p>
                            <p className="text-sm font-bold">{waybill.paymentType}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Boxes</p>
                            <p className="text-sm font-bold">{waybill.numberOfBoxes}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Act. Wt.</p>
                            <p className="text-sm font-bold">{waybill.packageWeight} kg</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Chg. Wt.</p>
                            <p className="text-sm font-bold">{waybill.chargeableWeight || waybill.packageWeight} kg</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center col-span-3">
                            <p className="font-semibold text-black text-[9px]">Invoice #</p>
                            <p className="text-[9px] truncate">{waybill.invoiceNumber}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">Value</p>
                            <p className="text-sm font-bold">₹{waybill.shipmentValue.toFixed(2)}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px]">E-Way Bill #</p>
                            <p className="text-[9px] truncate">{waybill.eWayBillNo || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px] flex items-center justify-center gap-1"><Briefcase className="h-2 w-2"/> Booking Partner</p>
                            <p className="text-xs font-bold uppercase truncate">{bookingPartner}</p>
                        </div>
                        <div className="p-1 border-2 border-black text-center">
                            <p className="font-semibold text-black text-[9px] flex items-center justify-center gap-1"><Truck className="h-2 w-2"/> Delivery Partner</p>
                            <p className="text-xs font-bold uppercase truncate">{deliveryPartner}</p>
                        </div>
                    </div>
                </div>
              </section>
              
              <section className="mt-1 flex-grow">
                <div className="p-2 border-2 border-black h-full flex items-start gap-2 text-xs">
                    <Package className="h-4 w-4 text-black shrink-0 mt-0.5" />
                    <span className="font-semibold mr-2">Desc:</span>
                    <p>{waybill.packageDescription}</p>
                </div>
              </section>

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

              <section className="mt-1">
                <div className="p-1 border-2 border-black text-[8px] space-y-0.5">
                  <p className="font-bold mb-0.5">Terms & Conditions:</p>
                  <p>1. All shipments are carried at the sender's risk. YU-WON LOGISTICS is not liable for any loss or damage unless insurance is purchased.</p>
                  <p>2. Liability of YU-WON LOGISTICS is limited to the declared value or ₹1,000, whichever is lower. Sender is responsible for shipping non-prohibited items.</p>
                </div>
              </section>

              <footer className="mt-1 pt-1 border-t-2 border-dashed border-gray-400 text-center">
                <p className="text-[9px] text-black">Generated on: {new Date().toLocaleString()}</p>
              </footer>
          </div>
      </div>
    </div>
  );
}

export function WaybillPrint({ waybill }: { waybill: Waybill }) {
  return (
    <div className="flex flex-col" style={{ gap: '5mm' }}>
      <WaybillCopy waybill={waybill} copyType="Receiver Copy" />
      <WaybillCopy waybill={waybill} copyType="POD Copy" />
    </div>
  );
}
