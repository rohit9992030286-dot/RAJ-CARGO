
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Loader2, IndianRupee, Handshake, Users, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const RATE_STORAGE_KEY = 'rajcargo-pincode-rates';

interface Rate {
  id: string;
  partnerCode: string;
  state: string;
  baseCharge: number;
  weightCharge: number;
}

export default function PartnerPaymentsPage() {
  const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();
  const { users, isLoading: usersLoading } = useAuth();
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const partners = useMemo(() => {
    return users.filter(u => u.role === 'staff' && u.partnerCode);
  }, [users]);

  useEffect(() => {
    try {
      const storedRates = localStorage.getItem(RATE_STORAGE_KEY);
      if (storedRates) setRates(JSON.parse(storedRates));
    } catch (e) { console.error("Failed to load rates", e); }
    finally { setRatesLoaded(true); }
  }, []);

  const partnerPaymentData = useMemo(() => {
    if (!waybillsLoaded || !ratesLoaded || usersLoading) return [];

    let filteredWaybills = allWaybills;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = date.to || dateRange.from;
      filteredWaybills = filteredWaybills.filter(w => {
        const waybillDate = new Date(w.shippingDate);
        const toDateInclusive = new Date(toDate);
        toDateInclusive.setDate(toDateInclusive.getDate() + 1);
        return waybillDate >= fromDate && waybillDate < toDateInclusive;
      });
    }

    const paymentMap: Record<string, { count: number, totalPayment: number }> = {};

    filteredWaybills.forEach(wb => {
      // Ensure receiverState exists before trying to access it
      if (!wb.receiverState) {
          return;
      }

      const partner = partners.find(p => p.partnerCode === wb.partnerCode);
      if (!partner) return;

      const rate = rates.find(r => r.partnerCode === wb.partnerCode && r.state.toLowerCase() === wb.receiverState.toLowerCase());
      if (!rate) return;
      
      const payment = rate.baseCharge + (rate.weightCharge * wb.packageWeight);
      
      if (!paymentMap[partner.partnerCode!]) {
        paymentMap[partner.partnerCode!] = { count: 0, totalPayment: 0 };
      }
      paymentMap[partner.partnerCode!].count += 1;
      paymentMap[partner.partnerCode!].totalPayment += payment;
    });

    return Object.entries(paymentMap).map(([partnerCode, data]) => ({
      partnerCode,
      username: partners.find(p => p.partnerCode === partnerCode)?.username || 'N/A',
      ...data
    }));

  }, [allWaybills, partners, rates, dateRange, waybillsLoaded, ratesLoaded, usersLoading]);

  const handleExport = () => {
    const dataToExport = partnerPaymentData.map(p => ({
      'Partner Code': p.partnerCode,
      'Partner Name': p.username,
      'Waybill Count': p.count,
      'Total Payment (INR)': p.totalPayment.toFixed(2),
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partner Payments");
    XLSX.writeFile(wb, "partner_payments.xlsx");
  }


  if (usersLoading || !waybillsLoaded || !ratesLoaded) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Partner Payments</h1>
        <p className="text-muted-foreground">Calculate and view payments due to booking partners.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Summary of payments based on waybills booked in the selected period.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Popover>
                  <PopoverTrigger asChild>
                      <Button
                      variant={"outline"}
                      className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                      )}
                      >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? ( <> {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")} </>) 
                        : (format(dateRange.from, "LLL dd, y"))) 
                        : (<span>Pick a date range</span>
                      )}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                  </PopoverContent>
              </Popover>
              {dateRange && <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>Clear</Button>}
              <Button variant="outline" size="sm" onClick={handleExport} disabled={partnerPaymentData.length === 0}><FileDown className="mr-2 h-4 w-4" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {partnerPaymentData.length > 0 ? partnerPaymentData.map(p => (
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
                        ₹{partnerPaymentData.reduce((acc, p) => acc + p.totalPayment, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
