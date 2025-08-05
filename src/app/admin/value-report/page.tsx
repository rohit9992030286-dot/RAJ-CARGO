
'use client';

import { useState, useMemo } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IndianRupee, Loader2, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DateRange } from 'react-day-picker';

export default function ValueReportPage() {
  const { allWaybills, isLoaded } = useWaybills();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredWaybills = useMemo(() => {
    if (!dateRange?.from) {
      return allWaybills;
    }
    const fromDate = dateRange.from;
    // If only `from` is selected, `to` is the same day. If both, use `to`.
    const toDate = dateRange.to || dateRange.from;

    return allWaybills.filter(w => {
        const waybillDate = new Date(w.shippingDate);
        // Add a day to `toDate` to make the range inclusive of the end date.
        const toDateInclusive = new Date(toDate);
        toDateInclusive.setDate(toDateInclusive.getDate() + 1);

        return waybillDate >= fromDate && waybillDate < toDateInclusive;
    });
  }, [allWaybills, dateRange]);


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const totalValue = filteredWaybills.reduce((total, waybill) => total + waybill.shipmentValue, 0);

  const handleDownloadExcel = () => {
    if (filteredWaybills.length === 0) {
      return;
    }

    const dataToExport = filteredWaybills.map(wb => ({
        'Waybill #': wb.waybillNumber,
        'Partner': wb.partnerCode || 'N/A',
        'Date': format(new Date(wb.shippingDate), 'PP'),
        'Receiver Name': wb.receiverName,
        'Receiver Pincode': wb.receiverPincode,
        'Declared Value (₹)': wb.shipmentValue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Value Report");

    // Add a totals row
    XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "", "", "", "Total Value", totalValue]
    ], { origin: -1 });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    
    const dateString = dateRange?.from ? `${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to || dateRange.from, 'yyyy-MM-dd')}` : 'all_time';
    saveAs(data, `value_report_${dateString}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Shipment Value Report</h1>
        <p className="text-muted-foreground">A detailed breakdown of declared values for all waybills across the system.</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <CardTitle>All Shipments</CardTitle>
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
                          "w-[300px] justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                      )}
                      >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      />
                  </PopoverContent>
              </Popover>
              {dateRange && <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>Clear</Button>}
               <Button onClick={handleDownloadExcel} variant="outline" size="sm" disabled={filteredWaybills.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> Export Excel
                </Button>
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
                <TableHead className="text-right">Declared Value (₹)</TableHead>
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
                    <TableCell className="text-right font-mono">{waybill.shipmentValue.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No shipment data available for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow className="font-bold text-lg">
                    <TableCell colSpan={5}>{dateRange?.from ? 'Total Declared Value for selected range' : 'Total Declared Value'}</TableCell>
                    <TableCell className="text-right font-mono flex items-center justify-end gap-2">
                        <IndianRupee className="h-5 w-5" />
                        {totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
