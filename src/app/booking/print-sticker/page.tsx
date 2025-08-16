
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Waybill } from '@/types/waybill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Search, Printer, AlertCircle, Loader2, FileUp, FileSpreadsheet, Truck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';

export default function PrintStickerPage() {
  const { waybills, isLoaded } = useWaybills();
  const [waybillNumber, setWaybillNumber] = useState('');
  const [tripNo, setTripNo] = useState('');
  const [foundWaybill, setFoundWaybill] = useState<Waybill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkStickers, setBulkStickers] = useState<any[]>([]);

  const handleSearch = () => {
    setError(null);
    setFoundWaybill(null);
    if (!waybillNumber) {
      setError('Please enter a waybill number.');
      return;
    }
    const waybill = waybills.find(w => w.waybillNumber === waybillNumber);
    if (waybill) {
      setFoundWaybill(waybill);
    } else {
      setError('Waybill not found. Please check the number and try again.');
    }
  };

  const handlePrintSticker = () => {
    if (!foundWaybill) return;
    const ids = foundWaybill.id;
    window.open(`/print/stickers?ids=${ids}`, '_blank');
  };

  const handlePrintTripStickers = () => {
    if (!tripNo.trim()) {
        toast({ title: 'Trip No. required', description: 'Please enter a Trip Number.', variant: 'destructive'});
        return;
    }
    const waybillsForTrip = waybills.filter(w => w.tripNo === tripNo.trim());
    if (waybillsForTrip.length === 0) {
        toast({ title: 'No Waybills Found', description: `No waybills found for Trip No. ${tripNo}.`, variant: 'destructive'});
        return;
    }
    const ids = waybillsForTrip.map(w => w.id).join(',');
    window.open(`/print/stickers?ids=${ids}`, '_blank');
    toast({ title: 'Printing Trip Stickers', description: `${waybillsForTrip.length} waybill stickers are being prepared for printing.`});
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkStickers([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: ["waybillNumber", "senderCity", "receiverCity", "receiverName", "numberOfBoxes"],
          range: 1 // Skip header row
        });
        
        const validStickers = json.filter(row => row.waybillNumber && row.receiverCity);

        if (validStickers.length > 0) {
            setBulkStickers(validStickers);
            toast({
                title: 'File Processed',
                description: `${validStickers.length} stickers are ready to print.`
            });
        } else {
             toast({
                title: 'No Data Found',
                description: 'The Excel file seems to be empty or in the wrong format.',
                variant: 'destructive'
            });
        }

      } catch (error) {
        console.error("Error parsing Excel file", error);
        toast({
            title: 'Upload Failed',
            description: 'Could not parse the Excel file. Please check its format.',
            variant: 'destructive'
        });
      }
    };
    reader.readAsBinaryString(file);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handlePrintBulk = () => {
    if (bulkStickers.length === 0) return;
    try {
        sessionStorage.setItem('rajcargo-bulk-stickers', JSON.stringify(bulkStickers));
        router.push('/print/bulk-stickers');
    } catch (e) {
        toast({
            title: 'Error',
            description: 'Could not prepare stickers for printing. The data might be too large.',
            variant: 'destructive'
        });
    }
  };
  
  const handleDownloadTemplate = () => {
    const headers = ["waybillNumber", "senderCity", "receiverCity", "receiverName", "numberOfBoxes"];
    const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sticker Template");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'sticker_template.xlsx');
  };


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Print Waybill Sticker</h1>
        <p className="text-muted-foreground">Print a single sticker, bulk print from an Excel file, or print all stickers for a trip.</p>
      </div>

       <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Bulk Print from Excel</CardTitle>
          <CardDescription>Upload an Excel file to print multiple stickers at once without creating waybills. This is ideal for Bluetooth printers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                    <FileUp className="mr-2 h-4 w-4" /> Upload Excel File
                </Button>
                 <Button onClick={handleDownloadTemplate} variant="secondary" size="sm">
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Template
                </Button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
            {bulkStickers.length > 0 && (
                 <Alert variant="default">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>File Ready</AlertTitle>
                    <AlertDescription>
                       {bulkStickers.length} stickers are ready for printing.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter>
            <Button onClick={handlePrintBulk} className="w-full" disabled={bulkStickers.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Print All Stickers
            </Button>
        </CardFooter>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
            <CardTitle>Print Single Sticker</CardTitle>
            <CardDescription>Find an existing waybill to print its sticker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Input
                id="waybill-number"
                placeholder="Enter Waybill Number"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow"
                />
                <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" /> Search
                </Button>
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            </CardContent>
            {foundWaybill && (
            <>
                <CardContent>
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Waybill Found!</AlertTitle>
                        <AlertDescription>
                            <p><strong>To:</strong> {foundWaybill.receiverName}</p>
                            <p><strong>Boxes:</strong> {foundWaybill.numberOfBoxes}</p>
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                <Button onClick={handlePrintSticker} className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print {foundWaybill.numberOfBoxes} {foundWaybill.numberOfBoxes > 1 ? 'Stickers' : 'Sticker'}
                </Button>
                </CardFooter>
            </>
            )}
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Bulk Print by Trip No.</CardTitle>
            <CardDescription>Enter a Trip Number to print all its associated stickers.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex gap-2">
                    <Input
                        placeholder="Enter Trip No."
                        value={tripNo}
                        onChange={(e) => setTripNo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePrintTripStickers()}
                    />
                    <Button onClick={handlePrintTripStickers}>
                        <Truck className="mr-2 h-4 w-4" /> Print Trip Stickers
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
