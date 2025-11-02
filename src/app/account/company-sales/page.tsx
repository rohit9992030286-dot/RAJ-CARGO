
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { useCompanies } from '@/hooks/useCompanies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IndianRupee, Loader2, Calendar as CalendarIcon, FileDown, Building } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DateRange } from 'react-day-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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

interface ReportRow {
    waybillNumber: string;
    id: string;
    shippingDate: string;
    tripNo?: string;
    invoiceNumber: string;
    senderName: string;
    receiverName: string;
    receiverState: string;
    packageWeight: number;
    partnerCode?: string;
    freightCharge: number;
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

function calculateFreightCharge(waybill: Waybill, rate: Rate): number {
    if (!rate) return 0;
    const chargeableWeight = waybill.chargeableWeight || waybill.packageWeight;

    // 1. Initial Sum
    const initialSum = (chargeableWeight * rate.volumeWeightCharge) + rate.docketCharge + rate.greenTaxCharge;
    
    // 2. Fuel Surcharge
    const fuelCharge = initialSum * (rate.fuelSurcharge / 100);

    // 3. Taxable Amount
    const taxableAmount = initialSum + fuelCharge;

    // 4. GST
    const gstAmount = taxableAmount * 0.18; // 18% GST

    // 5. Final Total
    const totalCharge = taxableAmount + gstAmount;

    return totalCharge;
}

export default function CompanySalesReportPage() {
  const { allWaybills, isLoaded } = useWaybills();
  const { companies, isLoaded: companiesLoaded } = useCompanies();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedRates = localStorage.getItem(RATE_STORAGE_KEY);
      if (storedRates) setRates(JSON.parse(storedRates));
    } catch (error) {
      console.error("Failed to load rates:", error);
    } finally {
      setRatesLoaded(true);
    }
  }, []);

  const reportData: ReportRow[] = useMemo(() => {
    if (!isLoaded || !ratesLoaded || !companiesLoaded || !selectedCompany) return [];

    let filteredWaybills = allWaybills.filter(wb => wb.companyCode === selectedCompany && wb.paymentType === 'Credit');
    
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to || dateRange.from;

      filteredWaybills = filteredWaybills.filter(w => {
          if (!w.shippingDate) return false;
          const waybillDate = new Date(w.shippingDate);
          const toDateInclusive = new Date(toDate);
          toDateInclusive.setDate(toDateInclusive.getDate() + 1);
          return waybillDate >= fromDate && waybillDate < toDateInclusive;
      });
    }

    return filteredWaybills.map(wb => {
        if (!wb.senderState || !wb.receiverState) return null;

        const senderState = wb.senderState;
        const receiverState = wb.receiverState;
        
        const rate = rates.find(r => 
            r && r.fromState && r.toState &&
            areStatesSimilar(r.fromState, senderState) && 
            areStatesSimilar(r.toState, receiverState)
        );
        const freightCharge = rate ? calculateFreightCharge(wb, rate) : 0;
        
        return { 
            id: wb.id,
            waybillNumber: wb.waybillNumber,
            shippingDate: wb.shippingDate,
            tripNo: wb.tripNo,
            invoiceNumber: wb.invoiceNumber,
            senderName: wb.senderName,
            receiverName: wb.receiverName,
            receiverState: wb.receiverState,
            packageWeight: wb.packageWeight,
            partnerCode: wb.partnerCode,
            freightCharge 
        };
    }).filter((r): r is ReportRow => r !== null);
  }, [allWaybills, dateRange, rates, isLoaded, ratesLoaded, companiesLoaded, selectedCompany]);


  if (!isLoaded || !ratesLoaded || !companiesLoaded) {
    return (
      <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
    );
  }

  const totalCharge = reportData.reduce((total, row) => total + row.freightCharge, 0);

  const handleDownloadExcel = () => {
    if (reportData.length === 0) return;

    const dataToExport = reportData.map(row => ({
        'Waybill #': row.waybillNumber,
        'Invoice #': row.invoiceNumber,
        'Trip #': row.tripNo,
        'Date': format(new Date(row.shippingDate), 'PP'),
        'Sender Name': row.senderName,
        'Receiver Name': row.receiverName,
        'Receiver State': row.receiverState,
        'Weight (Kg)': row.packageWeight,
        'Freight Charge (₹)': row.freightCharge.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Company Sales Report");

    XLSX.utils.sheet_add_aoa(worksheet, [
        ["", "", "", "", "", "", "", "Total Charge", totalCharge.toFixed(2)]
    ], { origin: -1 });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    
    const companyName = companies.find(c=> c.companyCode === selectedCompany)?.companyName || 'company';
    const dateString = dateRange?.from && dateRange.to ? `${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}` : 'all_time';
    saveAs(data, `${companyName}_sales_report_${dateString}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Company Sales Report</h1>
        <p className="text-muted-foreground">A detailed breakdown of freight charges for corporate clients.</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <CardTitle>Filters & Export</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                <Select value={selectedCompany || ''} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="w-[250px]">
                        <Building className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select a Company" />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map(c => <SelectItem key={c.id} value={c.companyCode}>{c.companyName}</SelectItem>)}
                    </SelectContent>
                </Select>
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
                        dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) 
                        : (format(dateRange.from, "LLL dd, y"))
                      ) : (<span>Pick a date range</span>)}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus/>
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Trip #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Freight (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCompany ? (
                reportData.length > 0 ? (
                  reportData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono">{row.waybillNumber}</TableCell>
                      <TableCell>{row.invoiceNumber}</TableCell>
                      <TableCell>{row.tripNo || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(row.shippingDate), 'PP')}</TableCell>
                      <TableCell>{row.senderName}</TableCell>
                      <TableCell>{row.receiverName}</TableCell>
                      <TableCell>{row.receiverState}</TableCell>
                      <TableCell className="text-right font-mono">{row.freightCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No shipment data available for the selected company and date range.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                 <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Please select a company to view the report.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
            {reportData.length > 0 && (
                <TableFooter>
                    <TableRow className="font-bold text-lg">
                        <TableCell colSpan={7}>{dateRange?.from ? 'Total Freight Charge for selected range' : 'Total Freight Charge'}</TableCell>
                        <TableCell className="text-right font-mono flex items-center justify-end gap-2">
                            <IndianRupee className="h-5 w-5" />
                            {totalCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    