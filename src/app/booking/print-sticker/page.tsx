
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Waybill } from '@/types/waybill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Search, Printer, AlertCircle, Loader2, FileUp, FileSpreadsheet, Truck, Camera } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { BarcodeScanner } from '@/components/BarcodeScanner';

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

  const handlePrintSticker = (id: string) => {
    if (!id) return;
    window.open(`/print/stickers?ids=${id}`, '_blank');
  };

  const handleScanAndPrint = (scannedValue: string) => {
    try {
        // Assuming format is WAYBILL-BOXNUM
        const waybillNum = scannedValue.split('-')[0];
        const boxNum = scannedValue.split('-')[1] || '1';
        const waybill = waybills.find(w => w.waybillNumber === waybillNum);

        if (waybill) {
            toast({
                title: "Waybill Found!",
                description: `Printing sticker for ${waybill.waybillNumber}, Box ${boxNum}`,
            });
            const totalBoxes = waybill.numberOfBoxes || 1;
            window.open(`/print/sticker/${waybill.id}?boxNumber=${boxNum}&totalBoxes=${totalBoxes}`, '_blank');

        } else {
            toast({
                title: 'Waybill Not Found',
                description: `Could not find a waybill matching ${waybillNum}.`,
                variant: 'destructive',
            });
        }
    } catch (e) {
        toast({
            title: 'Scan Error',
            description: 'Could not process the scanned barcode.',
            variant: 'destructive'
        });
    }
  }

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
          header: ["waybillNumber", "boxId"],
          range: 1 // Skip header row
        });
        
        const validStickers = json.map(row => {
          if (!row.waybillNumber || !row.boxId) return null;
          
          const waybill = waybills.find(w => w.waybillNumber === String(row.waybillNumber));
          if (!waybill) return null; // Skip if waybill not found

          return {
            waybillId: waybill.id,
            boxId: String(row.boxId),
          };
        }).filter(item => item !== null);

        if (validStickers.length > 0) {
            setBulkStickers(validStickers);
            toast({
                title: 'File Processed',
                description: `${validStickers.length} stickers are ready to print.`
            });
        } else {
             toast({
                title: 'No Valid Data Found',
                description: 'The Excel file seems to be empty or contains waybill numbers not found in your system.',
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
    const headers = ["waybillNumber", "boxId"];
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
        <p className="text-muted-foreground">Print single, bulk, trip, or scanned stickers.</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Camera className="h-6 w-6"/> Scan & Print Sticker</CardTitle>
                    <CardDescription>Use your device's camera to scan a barcode and print a sticker instantly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BarcodeScanner onScan={handleScanAndPrint} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Bulk Print from Excel</CardTitle>
                <CardDescription>Upload an Excel file to print multiple stickers at once. Ideal for Bluetooth printers.</CardDescription>
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
        </div>

        <div className="space-y-8">
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
                    <Button onClick={() => handlePrintSticker(foundWaybill.id)} className="w-full">
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
    </div>
  );
}
