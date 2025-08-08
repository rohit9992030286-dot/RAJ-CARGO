
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { useAuth } from '@/hooks/useAuth';
import { useManifests } from '@/hooks/useManifests';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Loader2, IndianRupee, Handshake, Users, Calendar as CalendarIcon, FileDown, BookCopy, Truck } from 'lucide-react';
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


const RATE_STORAGE_KEY = 'rajcargo-pincode-rates';

interface Rate {
  id: string;
  partnerCode: string;
  state: string;
  baseCharge: number;
  weightCharge: number;
}

interface PaymentData {
    partnerCode: string;
    username: string;
    count: number;
    totalPayment: number;
}

const BOOKING_COMMISSION = 0.08; // 8%
const DELIVERY_COMMISSION = 0.25; // 25%

function PaymentTable({ data, onExport }: { data: PaymentData[], onExport: () => void }) {
    const totalPayment = data.reduce((acc, p) => acc + p.totalPayment, 0);

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
                    <TableHead>Partner Code</TableHead>
                    <TableHead>Partner Name</TableHead>
                    <TableHead>Waybill Count</TableHead>
                    <TableHead className="text-right">Total Payment</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.length > 0 ? data.map(p => (
                    <TableRow key={p.partnerCode}>
                    <TableCell><Badge variant="outline">{p.partnerCode}</Badge></TableCell>
                    <TableCell className="font-medium">{p.username}</TableCell>
                    <TableCell>{p.count}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">₹{p.totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No payment data for the selected period.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
                <TableFooter>
                    <TableRow className="font-bold">
                        <TableCell colSpan={3}>Total</TableCell>
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
    
    const paymentMap = new Map<string, { count: number, totalPayment: number }>();

    filteredWaybills.forEach(wb => {
      if (!wb.receiverState) return;

      const partner = bookingPartners.find(p => p.partnerCode === wb.partnerCode);
      if (!partner) return;

      const rate = rates.find(r => r.partnerCode === wb.partnerCode && wb.receiverState && r.state.toLowerCase() === wb.receiverState.toLowerCase());
      if (!rate) return;
      
      const freightCharge = rate.baseCharge + (rate.weightCharge * wb.packageWeight);
      const payment = freightCharge * BOOKING_COMMISSION;

      if (!paymentMap.has(partner.partnerCode!)) {
        paymentMap.set(partner.partnerCode!, { count: 0, totalPayment: 0 });
      }
      const current = paymentMap.get(partner.partnerCode!)!;
      current.count += 1;
      current.totalPayment += payment;
    });

    return Array.from(paymentMap.entries()).map(([partnerCode, data]) => ({
      partnerCode,
      username: bookingPartners.find(p => p.partnerCode === partnerCode)?.username || 'N/A',
      ...data
    }));

  }, [filteredWaybills, bookingPartners, rates, waybillsLoaded, ratesLoaded, usersLoading]);

  const deliveryPaymentData = useMemo(() => {
    if (!manifestsLoaded || !waybillsLoaded || !ratesLoaded || usersLoading) return [];

    const paymentMap = new Map<string, { count: number, totalPayment: number }>();

    const deliveryManifests = allManifests.filter(m => m.origin === 'hub' && m.deliveryPartnerCode);

    deliveryManifests.forEach(manifest => {
        manifest.waybillIds.forEach(wbId => {
            const wb = filteredWaybills.find(w => w.id === wbId);
            if (!wb || !wb.receiverState) return;

            const partner = deliveryPartners.find(p => p.partnerCode === manifest.deliveryPartnerCode);
            if (!partner) return;

            // Find rate based on booking partner of the waybill
            const rate = rates.find(r => r.partnerCode === wb.partnerCode && wb.receiverState && r.state.toLowerCase() === wb.receiverState.toLowerCase());
            if (!rate) return;

            const freightCharge = rate.baseCharge + (rate.weightCharge * wb.packageWeight);
            const payment = freightCharge * DELIVERY_COMMISSION;
            
            if (!paymentMap.has(partner.partnerCode!)) {
                paymentMap.set(partner.partnerCode!, { count: 0, totalPayment: 0 });
            }
            const current = paymentMap.get(partner.partnerCode!)!;
            current.count += 1;
            current.totalPayment += payment;
        });
    });

    return Array.from(paymentMap.entries()).map(([partnerCode, data]) => ({
        partnerCode,
        username: deliveryPartners.find(p => p.partnerCode === partnerCode)?.username || 'N/A',
        ...data
    }));
  }, [filteredWaybills, deliveryPartners, allManifests, rates, waybillsLoaded, ratesLoaded, usersLoading, manifestsLoaded]);


  const handleExport = (type: 'booking' | 'delivery') => {
    const data = type === 'booking' ? bookingPaymentData : deliveryPaymentData;
    const dataToExport = data.map(p => ({
      'Partner Code': p.partnerCode,
      'Partner Name': p.username,
      'Waybill Count': p.count,
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
                    <CardDescription>Payment is calculated as 25% of the total freight charge for each delivered waybill.</CardDescription>
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
