
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface ExcelStickerData {
    firstBarcodeId: string;
    waybillNumber: string;
    senderCity: string;
    receiverCity: string;
    receiverName: string;
    numberOfBoxes: number;
}

export default function PrintStickerPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelData, setExcelData] = useState<ExcelStickerData[]>([]);
  const [printedBoxIds, setPrintedBoxIds] = useState<Set<string>>(new Set());


  const handleScanAndPrint = (scannedValue: string) => {
    try {
        if (excelData.length === 0) {
            toast({
                title: "No Excel Data",
                description: "Please upload an Excel file with shipment data first.",
                variant: 'destructive'
            });
            return;
        }

        const stickerInfo = excelData.find(d => scannedValue.includes(d.firstBarcodeId));

        if (stickerInfo) {
            if (printedBoxIds.has(stickerInfo.firstBarcodeId)) {
                toast({
                    title: 'Sticker Already Printed',
                    description: `A sticker for barcode ${stickerInfo.firstBarcodeId} has already been printed in this session.`,
                    variant: 'default',
                });
                return;
            }


            toast({
                title: "Barcode Match Found!",
                description: `Printing ${stickerInfo.numberOfBoxes} sticker(s) for ${stickerInfo.waybillNumber}.`,
            });
            
            const waybillForSticker: Partial<Waybill> = {
                id: crypto.randomUUID(),
                waybillNumber: stickerInfo.waybillNumber,
                senderCity: stickerInfo.senderCity,
                receiverCity: stickerInfo.receiverCity,
                receiverName: stickerInfo.receiverName,
                numberOfBoxes: stickerInfo.numberOfBoxes,
                shippingDate: new Date().toISOString(),
                packageWeight: 0,
            };

            sessionStorage.setItem('rajcargo-excel-sticker', JSON.stringify(waybillForSticker));
            window.open(`/print/stickers?source=excel`, '_blank');
            setPrintedBoxIds(prev => new Set(prev).add(stickerInfo.firstBarcodeId));

        } else {
            toast({
                title: 'Barcode Not Found',
                description: `Could not find a match for ${scannedValue} in the uploaded Excel file.`,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExcelData([]);
    setPrintedBoxIds(new Set()); // Reset printed IDs on new file upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: ["firstBarcodeId", "waybillNumber", "senderCity", "receiverCity", "receiverName", "numberOfBoxes"],
          range: 1 // Skip header row
        });
        
        const validStickers = json.map(row => {
          if (!row.firstBarcodeId || !row.waybillNumber || !row.receiverCity) return null;
          
          return {
            firstBarcodeId: String(row.firstBarcodeId),
            waybillNumber: String(row.waybillNumber),
            senderCity: String(row.senderCity || 'N/A'),
            receiverCity: String(row.receiverCity),
            receiverName: String(row.receiverName || 'N/A'),
            numberOfBoxes: Number(row.numberOfBoxes || 1),
          };
        }).filter((item): item is ExcelStickerData => item !== null);

        if (validStickers.length > 0) {
            setExcelData(validStickers);
            toast({
                title: 'Excel File Loaded',
                description: `${validStickers.length} records are ready for scanning.`
            });
        } else {
             toast({
                title: 'No Valid Data Found',
                description: 'The Excel file seems to be empty or does not contain the required columns.',
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
  
  const handleDownloadTemplate = () => {
    const headers = ["firstBarcodeId", "waybillNumber", "senderCity", "receiverCity", "receiverName", "numberOfBoxes"];
    const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sticker Template");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'scan_and_print_template.xlsx');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Scan & Print Stickers</h1>
        <p className="text-muted-foreground">Upload an Excel file, then scan waybill barcodes to print stickers instantly.</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
            <CardTitle>Step 1: Upload Excel File</CardTitle>
            <CardDescription>Upload an Excel file with your shipment details. This data will be used for printing.</CardDescription>
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
                {excelData.length > 0 && (
                    <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>File Ready</AlertTitle>
                        <AlertDescription>
                        {excelData.length} records loaded. You can now start scanning barcodes. {printedBoxIds.size} barcodes printed so far.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-6 w-6"/>
                     Step 2: Scan & Print Sticker
                </CardTitle>
                <CardDescription>Use your device's camera to scan a waybill barcode and print a sticker instantly.</CardDescription>
            </CardHeader>
            <CardContent>
                <BarcodeScanner onScan={handleScanAndPrint} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
