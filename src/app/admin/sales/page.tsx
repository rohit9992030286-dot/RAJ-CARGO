
'use client';

import { useState, useMemo } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IndianRupee, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function SalesReportPage() {
  const { allWaybills, isLoaded } = useWaybills();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const filteredWaybills = useMemo(() => {
    if (!date) {
      return allWaybills;
    }
    const selectedDate = format(date, 'yyyy-MM-dd');
    return allWaybills.filter(w => w.shippingDate === selectedDate);
  }, [allWaybills, date]);


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const calculateCharge = (waybill: Waybill) => {
    const baseCharge = 150;
    const weightCharge = waybill.packageWeight * 10;
    return baseCharge + weightCharge;
  };

  const totalSales = filteredWaybills.reduce((total, waybill) => total + calculateCharge(waybill), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Global Sales Report</h1>
        <p className="text-muted-foreground">A detailed breakdown of charges for all waybills across the system.</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Showing {filteredWaybills.length} of {allWaybills.length} total waybill(s).
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                  <PopoverTrigger asChild>
                      <Button
                      variant={"outline"}
                      className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                      )}
                      >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Filter by date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      />
                  </PopoverContent>
              </Popover>
              {date && <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>Clear</Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill #</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Receiver Name</TableHead>
                <TableHead>Receiver Pincode</TableHead>
                <TableHead className="text-right">Charge (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWaybills.length > 0 ? (
                filteredWaybills.map((waybill) => (
                  <TableRow key={waybill.id}>
                    <TableCell className="font-medium">{waybill.waybillNumber}</TableCell>
                    <TableCell><Badge variant="outline">{waybill.partnerCode || 'N/A'}</Badge></TableCell>
                    <TableCell>{format(new Date(waybill.shippingDate), 'PP')}</TableCell>
                    <TableCell>{waybill.receiverName}</TableCell>
                    <TableCell>{waybill.receiverPincode}</TableCell>
                    <TableCell className="text-right font-mono">{calculateCharge(waybill).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No sales data available for the selected date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow className="font-bold text-lg">
                    <TableCell colSpan={5}>{date ? 'Total for selected date' : 'Total Sales'}</TableCell>
                    <TableCell className="text-right font-mono flex items-center justify-end gap-2">
                        <IndianRupee className="h-5 w-5" />
                        {totalSales.toLocaleString('en-IN')}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
