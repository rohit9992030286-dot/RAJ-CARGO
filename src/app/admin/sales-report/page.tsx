
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IndianRupee, Loader2, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DateRange } from 'react-day-picker';

const RATE_STORAGE_KEY = 'rajcargo-pincode-rates';

interface Rate {
  id: string;
  partnerCode: string;
  state: string;
  baseCharge: number;
  weightCharge: number;
}

interface ReportRow {
    waybillNumber: string;
    id: string;
    shippingDate: string;
    receiverName: string;
    receiverState: string;
    packageWeight: number;
    partnerCode?: string;
    freightCharge: number;
}

export default function SalesReportPage() {
  const { allWaybills, isLoaded } = useWaybills();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedRates = localStorage.getItem(RATE_STORAGE_KEY);
      if (storedRates) {
        setRates(JSON.parse(storedRates));
      }
    } catch (error) {
      console.error("Failed to load rates:", error);
    } finally {
      setRatesLoaded(true);
    }
  }, []);

  const reportData: ReportRow[] = useMemo(() => {
    if (!isLoaded || !ratesLoaded) return [];

    let filteredWaybills = allWaybills;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to || dateRange.from;

      filteredWaybills = allWaybills.filter(w => {
          const waybillDate = new Date(w.shippingDate);
          const toDateInclusive = new Date(toDate);
          toDateInclusive.setDate(toDateInclusive.getDate() + 1);
          return waybillDate >= fromDate && waybillDate < toDateInclusive;
      });
    }

    return filteredWaybills.map(wb => {
        const rate = rates.find(r => r.partnerCode === wb.partnerCode && wb.receiverState && r.state.toLowerCase() === wb.receiverState.toLowerCase());
        let freightCharge = 0;
        if (rate) {
            freightCharge = rate.baseCharge + (rate.weightCharge * wb.packageWeight);
        }
        return { 
            id: wb.id,
            waybillNumber: wb.waybillNumber,
            shippingDate: wb.shippingDate,
            receiverName: wb.receiverName,
            receiverState: wb.receiverState,
            packageWeight: wb.packageWeight,
            partnerCode: wb.partnerCode,
            freightCharge 
        };
    });
  }, [allWaybills, dateRange, rates, isLoaded, ratesLoaded]);


  if (!isLoaded || !ratesLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const totalCharge = reportData.reduce((total, row) => total + row.freightCharge, 0);

  const handleDownloadExcel = () => {
    if (reportData.length === 0) {
      return;
    }

    const dataToExport = reportData.map(row => ({
        'Waybill #': row.waybillNumber,
        'Partner': row.partnerCode || 'N/A',
        'Date': format(new Date(row.shippingDate), 'PP'),
        'Receiver Name': row.receiverName,
        'Receiver State': row.receiverState,
        'Weight (Kg)': row.packageWeight,
        'Freight Charge (₹)': row.freightCharge.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "", "", "", "", "Total Charge", totalCharge.toFixed(2)]
    ], { origin: -1 });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    
    const dateString = dateRange?.from ? `${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to || dateRange.from, 'yyyy-MM-dd')}` : 'all_time';
    saveAs(data, `sales_report_${dateString}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <p className="text-muted-foreground">A detailed breakdown of freight charges for all waybills.</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <CardTitle>All Shipments</CardTitle>
              <CardDescription>
                Showing {reportData.length} of {allWaybills.length} total waybill(s).
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
               <Button onClick={handleDownloadExcel} variant="outline" size="sm" disabled={reportData.length === 0}>
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
                <TableHead>Receiver</TableHead>
                <TableHead>Receiver State</TableHead>
                <TableHead className="text-right">Weight (kg)</TableHead>
                <TableHead className="text-right">Freight Charge (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length > 0 ? (
                reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.waybillNumber}</TableCell>
                    <TableCell><Badge variant="outline">{row.partnerCode || 'N/A'}</Badge></TableCell>
                    <TableCell>{format(new Date(row.shippingDate), 'PP')}</TableCell>
                    <TableCell>{row.receiverName}</TableCell>
                    <TableCell>{row.receiverState}</TableCell>
                    <TableCell className="text-right">{row.packageWeight.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{row.freightCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No shipment data available for the selected date range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow className="font-bold text-lg">
                    <TableCell colSpan={6}>{dateRange?.from ? 'Total Freight Charge for selected range' : 'Total Freight Charge'}</TableCell>
                    <TableCell className="text-right font-mono flex items-center justify-end gap-2">
                        <IndianRupee className="h-5 w-5" />
                        {totalCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    