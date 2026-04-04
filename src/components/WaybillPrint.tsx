'use client';

import { Waybill } from '@/types/waybill';
import { Truck, User, MapPin, Phone, Calendar, Hash, Box, Weight, IndianRupee, Package, FileText, Globe, Cpu, CheckCircle, Wallet, Briefcase, Star } from 'lucide-react';
import Barcode from 'react-barcode';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays } from 'date-fns';
import { Manifest } from '@/types/manifest';
import { useMemo, useState, useEffect } from 'react';

interface Rate {
  fromState: string;
  toState: string;
  docketCharge: number;
  fuelSurcharge: number;
  greenTaxCharge: number;
  volumeWeightCharge: number;
  expectedDeliveryDays: number;
}

// Function to calculate the Levenshtein distance between two strings
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function areStatesSimilar(s1: string, s2: string): boolean {
    if (!s1 || !s2) return false;
    const term1 = s1.trim().toLowerCase();
    const term2 = s2.trim().toLowerCase();
    if (term1 === term2) return true;

    // Abbreviation check (e.g., MP for Madhya Pradesh)
    const abbreviationMatch = term1.length < 4 && term2.split(' ').some(word => word.charAt(0) === term1.charAt(0));
    if (abbreviationMatch) return true;

    // Levenshtein distance for fuzzy matching
    const distance = levenshtein(term1, term2);
    const maxLength = Math.max(term1.length, term2.length);
    const similarity = 1 - distance / maxLength;
    
    return similarity > 0.8; // 80% similarity threshold
}


interface WaybillPrintProps {
  waybill: Waybill;
  copyType: 'Receiver Copy' | 'POD Copy';
}

function WaybillCopy({ waybill, copyType }: WaybillPrintProps) {
  const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();
  const { users, isLoading: usersLoaded } = useAuth();
  const [expDeliveryDate, setExpDeliveryDate] = useState<Date | null>(null);

  useEffect(() => {
    try {
        const storedRates = localStorage.getItem('yuwon-state-rates');
        if (storedRates) {
            const rates: Rate[] = JSON.parse(storedRates);
            const rate = rates.find(r => 
                r && r.fromState && r.toState &&
                areStatesSimilar(r.fromState, waybill.senderState) && 
                areStatesSimilar(r.toState, waybill.receiverState)
            );
            if (rate && rate.expectedDeliveryDays > 0) {
                const shippingDate = new Date(waybill.shippingDate);
                const deliveryDate = addDays(shippingDate, rate.expectedDeliveryDays);
                setExpDeliveryDate(deliveryDate);
            }
        }
    } catch (e) {
        console.error("Failed to calculate expected delivery date", e);
    }
  }, [waybill.senderState, waybill.receiverState, waybill.shippingDate]);
  
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
  
  const groupedDimensions = useMemo(() => {
    if (!waybill.dimensions || waybill.dimensions.length === 0) {
        return [];
    }

    const counts = new Map<string, { l: number, b: number, h: number, count: number }>();
    
    waybill.dimensions.forEach(dim => {
        const key = `${dim.length}x${dim.breadth}x${dim.height}`;
        if (counts.has(key)) {
            counts.get(key)!.count++;
        } else {
            counts.set(key, { l: dim.length, b: dim.breadth, h: dim.height, count: 1 });
        }
    });

    return Array.from(counts.values());
  }, [waybill.dimensions]);

  const dimensionRows = Array(5).fill(null);
  groupedDimensions.slice(0, 5).forEach((dim, index) => {
    dimensionRows[index] = dim;
  });

  return (
    <div className="bg-white text-black font-sans mx-auto print:shadow-none p-2" style={{ fontSize: '10px', height: '12.5cm', width: '20cm' }}>
      <div className="border-2 border-black flex flex-col h-full">
          {/* Header */}
          <header className="flex justify-between items-center p-2 border-b-2 border-black">
             <div className="flex items-center gap-3">
                <div className="relative h-12 w-12">
                     <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 10,80 L 50,80 M 5,100 L 45,100" stroke="black" strokeWidth="10" strokeLinecap="round" />
                        <path d="M 60,60 Q 110,180 160,60 L 145,50 Q 110,140 75,50 Z" fill="black" />
                        <path d="M 110,20 L 120,45 L 145,45 L 125,60 L 135,85 L 110,70 L 85,85 L 95,60 L 75,45 L 100,45 Z" fill="black" />
                        <path d="M 95,160 L 125,160 L 140,185 L 80,185 Z" fill="black" />
                        <rect x="105" y="140" width="10" height="25" fill="black" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-black uppercase tracking-tighter">YU-WON LOGISTICS</h1>
                    <p className="text-black text-[9px] font-semibold">DELHI NAJAFGARH. PINCODE 110048 | contact@yuwonlogistics.com</p>
                </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold uppercase tracking-wider text-black">{copyType}</h2>
              <p className="text-xs font-semibold">Date: {format(new Date(waybill.shippingDate), 'dd-MMM-yyyy')}</p>
              {expDeliveryDate && <p className="text-xs font-bold text-blue-700">Exp. Delivery: {format(expDeliveryDate, 'dd-MMM-yyyy')}</p>}
            </div>
          </header>

           {/* Barcode Section */}
           <div className="text-center p-1 border-b-2 border-black">
                <Barcode value={waybill.waybillNumber} height={35} width={2} fontSize={16} />
            </div>
          
          <div className="p-1 flex-grow flex flex-col">
              {/* Sender & Receiver Info */}
              <section className="grid grid-cols-12 gap-px bg-black border-b-2 border-black">
                <div className="col-span-6 p-2 bg-white">
                  <h3 className="font-bold uppercase text-[11px] border-b border-black mb-1">From (Sender)</h3>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-sm">{waybill.senderName}</p>
                    <p>{waybill.senderAddress}</p>
                    <p>{waybill.senderCity} - {waybill.senderPincode}</p>
                    <p>{waybill.senderState}</p>
                    <p>Ph: {waybill.senderPhone}</p>
                  </div>
                </div>
                <div className="col-span-6 p-2 bg-white">
                  <h3 className="font-bold uppercase text-[11px] border-b border-black mb-1">To (Receiver)</h3>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-sm">{waybill.receiverName}</p>
                    <p>{waybill.receiverAddress}</p>
                    <p>{waybill.receiverCity} - {waybill.receiverPincode}</p>
                    <p>{waybill.receiverState}</p>
                    <p>Ph: {waybill.receiverPhone}</p>
                  </div>
                </div>
              </section>

              {/* Partner & Logistics Info */}
               <section className="grid grid-cols-12 gap-px bg-black border-b-2 border-black">
                    <div className="col-span-3 p-1 bg-white text-xs">
                        <p className="font-bold text-[9px] uppercase">Booking Partner:</p>
                        <p className="font-semibold uppercase truncate">{bookingPartner}</p>
                    </div>
                    <div className="col-span-3 p-1 bg-white text-xs">
                        <p className="font-bold text-[9px] uppercase">Delivery Partner:</p>
                        <p className="font-semibold uppercase truncate">{deliveryPartner}</p>
                    </div>
                    <div className="col-span-3 p-1 bg-white text-xs">
                        <p className="font-bold text-[9px] uppercase">Invoice #:</p>
                        <p className="font-mono">{waybill.invoiceNumber}</p>
                    </div>
                    <div className="col-span-3 p-1 bg-white text-xs">
                        <p className="font-bold text-[9px] uppercase">Trip #:</p>
                        <p className="font-mono">{waybill.tripNo || 'N/A'}</p>
                    </div>
                </section>
                <section className="grid grid-cols-12 gap-px bg-black border-b-2 border-black">
                    <div className="col-span-6 p-1 bg-white text-xs">
                        <p className="font-bold text-[9px] uppercase">E-Way Bill #:</p>
                        <p className="font-mono">{waybill.eWayBillNo || 'N/A'}</p>
                    </div>
                    <div className="col-span-6 p-1 bg-white text-xs">
                        <p className="font-bold text-[9px] uppercase">E-Way Bill Expiry:</p>
                        <p className="font-mono">{waybill.eWayBillExpiryDate ? format(new Date(waybill.eWayBillExpiryDate), 'dd-MMM-yyyy') : 'N/A'}</p>
                    </div>
                </section>


              {/* Weight & Boxes Details */}
              <section className="grid grid-cols-12 gap-px bg-black border-b-2 border-black">
                    <div className="col-span-2 p-1 text-center bg-white"><p className="text-[9px] font-semibold">Payment</p><p className="font-bold">{waybill.paymentType}</p></div>
                    <div className="col-span-2 p-1 text-center bg-white"><p className="text-[9px] font-semibold">Boxes</p><p className="font-bold">{waybill.numberOfBoxes}</p></div>
                    <div className="col-span-2 p-1 text-center bg-white"><p className="text-[9px] font-semibold">Actual Wt.</p><p className="font-bold">{waybill.packageWeight} kg</p></div>
                    <div className="col-span-2 p-1 text-center bg-white"><p className="text-[9px] font-semibold">Chargeable Wt.</p><p className="font-bold">{waybill.chargeableWeight || waybill.packageWeight} kg</p></div>
                    <div className="col-span-4 p-1 text-center bg-white"><p className="text-[9px] font-semibold">Shipment Value</p><p className="font-bold">₹ {waybill.shipmentValue.toLocaleString('en-IN')}</p></div>
              </section>

              {/* Dimensions & Description */}
              <section className="grid grid-cols-12 gap-px bg-black border-b-2 border-black flex-grow min-h-0">
                  <div className="col-span-7 bg-white p-1">
                        <table className="w-full text-center text-[9px] border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-black p-0.5 w-[10%]">Count</th>
                                    <th className="border border-black p-0.5">Length</th>
                                    <th className="border border-black p-0.5">Breadth</th>
                                    <th className="border border-black p-0.5">Height</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dimensionRows.map((dim, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-0.5 h-4">{dim ? dim.count : ''}</td>
                                        <td className="border border-black p-0.5">{dim ? `${dim.l} cm` : ''}</td>
                                        <td className="border border-black p-0.5">{dim ? `${dim.b} cm` : ''}</td>
                                        <td className="border border-black p-0.5">{dim ? `${dim.h} cm` : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                  </div>
                  <div className="col-span-5 bg-white p-2 text-xs">
                        <p className="font-bold uppercase text-[9px]">Description:</p>
                        <p>{waybill.packageDescription}</p>
                  </div>
              </section>

              <section className="border-b-2 border-black">
                {copyType === 'POD Copy' ? (
                     isDelivered ? (
                      <div className="p-2 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-bold">Delivered On:</p>
                                <p>{waybill.deliveryDate ? format(new Date(waybill.deliveryDate), 'PPp') : 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold">Received By:</p>
                            <p>{waybill.receivedBy || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 grid grid-cols-5 gap-2 text-xs">
                        <div className="col-span-3">
                          <p className="font-bold mb-1">Receiver's Signature:</p>
                          <div className="h-12 border-b border-gray-400"></div>
                        </div>
                        <div className="col-span-2">
                          <p className="font-bold mb-1">Date & Remarks:</p>
                          <div className="h-12 border-b border-gray-400"></div>
                        </div>
                      </div>
                    )
                ) : (
                    <div className="p-1 text-xs text-center font-semibold">
                       This is a {copyType}. Thank you for choosing YU-WON LOGISTICS.
                    </div>
                )}
              </section>

              {/* Footer */}
              <footer className="p-1 text-[8px]">
                  <p className="font-bold">Terms & Conditions:</p>
                  <p>1. All shipments are carried at the sender's risk. YU-WON LOGISTICS is not liable for any loss or damage unless insurance is purchased.</p>
                  <p>2. Liability of YU-WON LOGISTICS is limited to the declared value or ₹1,000, whichever is lower. Sender is responsible for shipping non-prohibited items.</p>
              </footer>
          </div>
      </div>
    </div>
  );
}

export function WaybillPrint({ waybill }: { waybill: Waybill }) {
  return (
    <div className="flex flex-col" style={{ gap: '20mm' }}>
      <WaybillCopy waybill={waybill} copyType="Receiver Copy" />
      <WaybillCopy waybill={waybill} copyType="POD Copy" />
    </div>
  );
}
