
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { useAuth } from '@/hooks/useAuth';
import { useManifests } from '@/hooks/useManifests';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Loader2, IndianRupee, Handshake, Users, Calendar as CalendarIcon, FileDown, BookCopy, Truck, ChevronDown, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Waybill } from '@/types/waybill';


const RATE_STORAGE_KEY = 'rajcargo-state-rates';

interface Rate {
  fromState: string;
  toState: string;
  docketCharge: number;
  fuelSurcharge: number;
  greenTaxCharge: number;
  volumeWeightCharge: number;
}

interface PaymentDetails {
    waybill: Waybill;
    payment: number;
    rate?: Rate;
}

interface PartnerPaymentData {
    partnerCode: string;
    username: string;
    totalCount: number;
    totalPayment: number;
    details: PaymentDetails[];
}

const BOOKING_COMMISSION = 0.08; // 8%
const DELIVERY_COMMISSION = 0.24; // 24%

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

function calculateFreightCharge(waybill: Waybill, rate: Rate) {
    if (!rate) return { totalCharge: 0, base: 0, fuel: 0, taxable: 0, gst: 0, greenTax: 0 };
    const chargeableWeight = waybill.chargeableWeight || waybill.packageWeight;

    const baseFreight = (chargeableWeight * rate.volumeWeightCharge) + rate.docketCharge;
    const fuelCharge = baseFreight * (rate.fuelSurcharge / 100);
    const taxableAmount = baseFreight + fuelCharge;
    const gstAmount = taxableAmount * 0.18;
    const totalCharge = taxableAmount + gstAmount + rate.greenTaxCharge;

    return {
        totalCharge,
        base: baseFreight,
        fuel: fuelCharge,
        taxable: taxableAmount,
        gst: gstAmount,
        greenTax: rate.greenTaxCharge
    };
}

function PaymentTable({ data, onExport }: { data: PartnerPaymentData[], onExport: () => void }) {
    const totalPayment = data.reduce((acc, p) => acc + p.totalPayment, 0);
    const [openPartner, setOpenPartner] = useState<string | null>(null);

    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onExport} disabled={data.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> Export
                </Button>
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Waybill Count</TableHead>
                    <TableHead className="text-right">Total Payment</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.length > 0 ? data.map(p => (
                    <>
                        <TableRow key={p.partnerCode} onClick={() => setOpenPartner(openPartner === p.partnerCode ? null : p.partnerCode)} className="cursor-pointer">
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {openPartner === p.partnerCode ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <Badge variant="outline">{p.partnerCode}</Badge>
                                    <span className="font-medium">{p.username}</span>
                                </div>
                            </TableCell>
                            <TableCell>{p.totalCount}</TableCell>
                            <TableCell className="text-right font-mono font-semibold">₹{p.totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                        {openPartner === p.partnerCode && (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Details for {p.username}</h4>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Waybill #</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Destination</TableHead>
                                                    <TableHead className="text-right">Commission</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {p.details.map(d => (
                                                    <TableRow key={d.waybill.id}>
                                                        <TableCell className="font-mono">{d.waybill.waybillNumber}</TableCell>
                                                        <TableCell>{format(new Date(d.waybill.shippingDate), 'PP')}</TableCell>
                                                        <TableCell>{d.waybill.receiverCity}</TableCell>
                                                        <TableCell className="text-right font-mono">₹{d.payment.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </>
                )) : (
                    <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No payment data for the selected period.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right font-mono">
                            ₹{totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}


export default function PartnerPaymentsPage() {
  const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();
  const { users, isLoading: usersLoading } = useAuth();
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(new Date());

  const bookingPartners = useMemo(() => users.filter(u => u.roles.includes('booking') && u.partnerCode), [users]);
  const deliveryPartners = useMemo(() => users.filter(u => u.roles.includes('delivery') && u.partnerCode), [users]);

  useEffect(() => {
    try {
      const storedRates = localStorage.getItem(RATE_STORAGE_KEY);
      if (storedRates) setRates(JSON.parse(storedRates));
    } catch (e) { console.error("Failed to load rates", e); }
    finally { setRatesLoaded(true); }
  }, []);

  const filteredWaybills = useMemo(() => {
    if (!month) return allWaybills;

    const fromDate = startOfMonth(month);
    const toDate = endOfMonth(month);

    return allWaybills.filter(w => {
        if (!w.shippingDate) return false;
        const waybillDate = new Date(w.shippingDate);
        return waybillDate >= fromDate && waybillDate <= toDate;
    });
  }, [allWaybills, month]);


  const bookingPaymentData = useMemo(() => {
    if (!waybillsLoaded || !ratesLoaded || usersLoading) return [];
    
    const paymentMap = new Map<string, PaymentDetails[]>();

    filteredWaybills.forEach(wb => {
      if (!wb.senderState || !wb.receiverState) return;

      const partner = bookingPartners.find(p => p.partnerCode === wb.partnerCode);
      if (!partner) return;

      const senderState = wb.senderState;
      const receiverState = wb.receiverState;

      const rate = rates.find(r => 
          r && r.fromState && r.toState &&
          areStatesSimilar(r.fromState, senderState) && 
          areStatesSimilar(r.toState, receiverState)
      );
      if (!rate) return;
      
      const freightCharge = calculateFreightCharge(wb, rate).totalCharge;
      const payment = freightCharge * BOOKING_COMMISSION;

      if (!paymentMap.has(partner.partnerCode!)) {
        paymentMap.set(partner.partnerCode!, []);
      }
      paymentMap.get(partner.partnerCode!)!.push({ waybill: wb, payment, rate });
    });

    return Array.from(paymentMap.entries()).map(([partnerCode, details]) => ({
      partnerCode,
      username: bookingPartners.find(p => p.partnerCode === partnerCode)?.username || 'N/A',
      totalCount: details.length,
      totalPayment: details.reduce((sum, d) => sum + d.payment, 0),
      details,
    }));

  }, [filteredWaybills, bookingPartners, rates, waybillsLoaded, ratesLoaded, usersLoading]);

  const deliveryPaymentData = useMemo(() => {
    if (!manifestsLoaded || !waybillsLoaded || !ratesLoaded || usersLoading) return [];

    const paymentMap = new Map<string, PaymentDetails[]>();

    const deliveryManifests = allManifests.filter(m => m.origin === 'hub' && m.deliveryPartnerCode);

    deliveryManifests.forEach(manifest => {
        manifest.waybillIds.forEach(wbId => {
            const wb = filteredWaybills.find(w => w.id === wbId);
            if (!wb || !wb.senderState || !wb.receiverState) return;

            const partner = deliveryPartners.find(p => p.partnerCode === manifest.deliveryPartnerCode);
            if (!partner) return;

            const senderState = wb.senderState;
            const receiverState = wb.receiverState;

            const rate = rates.find(r => 
                r && r.fromState && r.toState &&
                areStatesSimilar(r.fromState, senderState) && 
                areStatesSimilar(r.toState, receiverState)
            );
            if (!rate) return;

            const freightCharge = calculateFreightCharge(wb, rate).totalCharge;
            const payment = freightCharge * DELIVERY_COMMISSION;
            
            if (!paymentMap.has(partner.partnerCode!)) {
                paymentMap.set(partner.partnerCode!, []);
            }
            paymentMap.get(partner.partnerCode!)!.push({ waybill: wb, payment, rate });
        });
    });

    return Array.from(paymentMap.entries()).map(([partnerCode, details]) => ({
        partnerCode,
        username: deliveryPartners.find(p => p.partnerCode === partnerCode)?.username || 'N/A',
        totalCount: details.length,
        totalPayment: details.reduce((sum, d) => sum + d.payment, 0),
        details,
    }));
  }, [filteredWaybills, deliveryPartners, allManifests, rates, waybillsLoaded, ratesLoaded, usersLoading, manifestsLoaded]);


  const handleExport = (type: 'booking' | 'delivery') => {
    const data = type === 'booking' ? bookingPaymentData : deliveryPaymentData;
    const dataToExport = data.map(p => ({
      'Partner Code': p.partnerCode,
      'Partner Name': p.username,
      'Waybill Count': p.totalCount,
      'Total Payment (INR)': p.totalPayment.toFixed(2),
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Partner Payments`);
    XLSX.writeFile(wb, `${type}_partner_payments_${format(month || new Date(), 'MMM-yyyy')}.xlsx`);
  }


  if (usersLoading || !waybillsLoaded || !ratesLoaded || !manifestsLoaded) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Partner Payments</h1>
        <p className="text-muted-foreground">Calculate payments due to booking and delivery partners based on commission.</p>
      </div>

       <Card>
        <CardHeader>
           <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <CardTitle>Filter by Month</CardTitle>
                  <CardDescription>Select a month to filter payments.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                   <Popover>
                      <PopoverTrigger asChild>
                          <Button
                          variant={"outline"}
                          className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !month && "text-muted-foreground"
                          )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {month ? format(month, 'MMMM yyyy') : <span>Pick a month</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={month}
                            onSelect={setMonth}
                            initialFocus
                            defaultMonth={month || new Date()}
                          />
                      </PopoverContent>
                  </Popover>
                  {month && <Button variant="ghost" size="sm" onClick={() => setMonth(undefined)}>Show All</Button>}
                </div>
            </div>
        </CardHeader>
       </Card>

      <Tabs defaultValue="booking">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="booking">
                <BookCopy className="mr-2 h-4 w-4" />
                Booking Partner Payments ({bookingPaymentData.length})
            </TabsTrigger>
            <TabsTrigger value="delivery">
                <Truck className="mr-2 h-4 w-4" />
                Delivery Partner Payments ({deliveryPaymentData.length})
            </TabsTrigger>
        </TabsList>
        <TabsContent value="booking">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Partner Commission</CardTitle>
                    <CardDescription>Payment is calculated as 8% of the total freight charge for each waybill.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentTable data={bookingPaymentData} onExport={() => handleExport('booking')} />
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="delivery">
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Partner Commission</CardTitle>
                    <CardDescription>Payment is calculated as 24% of the total freight charge for each delivered waybill.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentTable data={deliveryPaymentData} onExport={() => handleExport('delivery')} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
