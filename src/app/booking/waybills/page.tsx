
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillList } from '@/components/WaybillList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, FileDown, Printer, ChevronLeft, ChevronRight, Search, FileUp, FileSpreadsheet, Copy, Calendar as CalendarIcon, Loader2, Truck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Waybill, waybillFormSchema, WaybillFormData } from '@/types/waybill';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


function WaybillsPageContent() {
  const { waybills, deleteWaybill, updateWaybill, isLoaded, addWaybill } = useWaybills();
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dimensionUnit, setDimensionUnit] = useState<'cm' | 'in'>('cm');

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { waybillInventory } = useWaybillInventory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dimensionFileInputRef = useRef<HTMLInputElement>(null);


  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredWaybills = useMemo(() => {
    let filtered = waybills;

    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(w => 
          w.waybillNumber.toLowerCase().includes(lowercasedTerm) ||
          w.invoiceNumber.toLowerCase().includes(lowercasedTerm) ||
          (w.tripNo && w.tripNo.toLowerCase().includes(lowercasedTerm)) ||
          w.senderName.toLowerCase().includes(lowercasedTerm) ||
          w.receiverName.toLowerCase().includes(lowercasedTerm) ||
          w.receiverCity.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to || dateRange.from;
        filtered = filtered.filter(w => {
            const waybillDate = new Date(w.shippingDate);
            const toDateInclusive = new Date(toDate);
            toDateInclusive.setDate(toDateInclusive.getDate() + 1);
            return waybillDate >= fromDate && waybillDate < toDateInclusive;
        });
    }
    
    return filtered;
  }, [waybills, debouncedSearchTerm, dateRange]);
  
  const tripResult = useMemo(() => {
    if (filteredWaybills.length > 0 && debouncedSearchTerm) {
        const firstTripNo = filteredWaybills[0].tripNo;
        if (firstTripNo && filteredWaybills.every(w => w.tripNo === firstTripNo)) {
            return firstTripNo;
        }
    }
    return null;
  }, [filteredWaybills, debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, dateRange, itemsPerPage]);

  const indexOfLastWaybill = currentPage * itemsPerPage;
  const indexOfFirstWaybill = indexOfLastWaybill - itemsPerPage;
  const currentWaybills = filteredWaybills.slice(indexOfFirstWaybill, indexOfLastWaybill);
  const totalPages = Math.ceil(filteredWaybills.length / itemsPerPage);

  const handleCreateNew = () => {
    router.push('/booking/waybills/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/booking/waybills/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    deleteWaybill(id);
    setSelectedWaybillIds(prev => prev.filter(selectedId => selectedId !== id));
  };
  
  const handleDownloadExcel = () => {
    if (waybills.length === 0) {
        return;
    }
     const dataToExport = waybills.map(wb => ({
      ...wb,
      dimensions: Array.isArray(wb.dimensions) 
        ? wb.dimensions.map(d => `${d.length}x${d.breadth}x${d.height}`).join(',') 
        : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waybills");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    
    saveAs(data, 'waybills.xlsx');
  };

  const handleDownloadTemplate = () => {
    const headers = [
        "waybillNumber", "invoiceNumber", "tripNo", "eWayBillNo", "eWayBillExpiryDate",
        "senderName", "senderAddress", "senderCity", "senderPincode", "senderPhone", "senderState",
        "receiverName", "receiverAddress", "receiverCity", "receiverPincode", "receiverPhone", "receiverState",
        "packageDescription", "packageWeight", "numberOfBoxes",
        "shipmentValue", "shippingDate", "shippingTime", "status", "companyCode", "paymentType"
    ];
    const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waybill Template");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'waybill_template.xlsx');
  };
  
  const handleDownloadDimensionTemplate = () => {
    const headers = ["waybillNumber", "length", "breadth", "height"];
    const exampleData = [
        { waybillNumber: 'SW-101', length: 10, breadth: 10, height: 10 },
        { waybillNumber: 'SW-101', length: 12, breadth: 12, height: 12 },
        { waybillNumber: 'SW-102', length: 15, breadth: 15, height: 15 },
    ];
    const worksheet = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dimension Template");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'dimension_template.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        try {
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            let addedCount = 0;
            let skippedCount = 0;
            const errorMessages: string[] = [];

            json.forEach((row, index) => {
                const rowNum = index + 2;
                try {
                    const waybillNumber = String(row.waybillNumber || '').trim();
                    if (!waybillNumber) {
                        errorMessages.push(`Row ${rowNum}: Waybill number is missing.`);
                        skippedCount++;
                        return;
                    }

                    const inventoryItem = waybillInventory.find(item => item.waybillNumber === waybillNumber);
                    if (!inventoryItem) {
                        errorMessages.push(`Row ${rowNum}: Waybill #${waybillNumber} not found in inventory.`);
                        skippedCount++;
                        return;
                    }
                    if (inventoryItem.isUsed) {
                        errorMessages.push(`Row ${rowNum}: Waybill #${waybillNumber} has already been used.`);
                        skippedCount++;
                        return;
                    }
                    if (inventoryItem.partnerCode !== user?.partnerCode) {
                         errorMessages.push(`Row ${rowNum}: Waybill #${waybillNumber} is not assigned to you.`);
                         skippedCount++;
                         return;
                    }
                    
                    const requiredFields: (keyof WaybillFormData)[] = [
                        'invoiceNumber', 'senderName', 'senderAddress', 'senderCity', 'senderPincode', 'senderPhone', 'senderState',
                        'receiverName', 'receiverAddress', 'receiverCity', 'receiverPincode', 'receiverPhone', 'receiverState',
                        'packageDescription', 'packageWeight', 'numberOfBoxes', 'shipmentValue', 'paymentType'
                    ];

                    const missingFields = requiredFields.filter(field => !row[field] || String(row[field]).trim() === '');

                    if (missingFields.length > 0) {
                        errorMessages.push(`Row ${rowNum} (WB# ${waybillNumber}): Missing mandatory fields: ${missingFields.join(', ')}.`);
                        skippedCount++;
                        return;
                    }
                    
                    let shippingDate;
                    if (row.shippingDate instanceof Date && !isNaN(row.shippingDate.getTime())) {
                        shippingDate = format(row.shippingDate, 'yyyy-MM-dd');
                    } else if (typeof row.shippingDate === 'string') {
                         const parsedDate = new Date(row.shippingDate);
                         if(!isNaN(parsedDate.getTime())) {
                           shippingDate = format(parsedDate, 'yyyy-MM-dd');
                         }
                    } else if (typeof row.shippingDate === 'number') {
                         const excelEpoch = new Date(1899, 11, 30);
                         const parsedDate = addDays(excelEpoch, row.shippingDate);
                         if(!isNaN(parsedDate.getTime())) {
                            shippingDate = format(parsedDate, 'yyyy-MM-dd');
                         }
                    }
                    
                    if (!shippingDate) {
                        shippingDate = format(new Date(), 'yyyy-MM-dd');
                    }

                    const numberOfBoxes = Number(row.numberOfBoxes) || 1;
                    
                    const newWaybillData: Waybill = {
                      id: crypto.randomUUID(),
                      waybillNumber: waybillNumber,
                      invoiceNumber: String(row.invoiceNumber || ''),
                      tripNo: String(row.tripNo || ''),
                      eWayBillNo: String(row.eWayBillNo || ''),
                      senderName: String(row.senderName || ''),
                      senderAddress: String(row.senderAddress || ''),
                      senderCity: String(row.senderCity || ''),
                      senderPincode: String(row.senderPincode || ''),
                      senderPhone: String(row.senderPhone || ''),
                      senderState: String(row.senderState || ''),
                      receiverName: String(row.receiverName || ''),
                      receiverAddress: String(row.receiverAddress || ''),
                      receiverCity: String(row.receiverCity || ''),
                      receiverPincode: String(row.receiverPincode || ''),
                      receiverState: String(row.receiverState || ''),
                      receiverPhone: String(row.receiverPhone || ''),
                      packageDescription: String(row.packageDescription || ''),
                      status: 'Pending',
                      shippingDate: shippingDate,
                      shippingTime: String(row.shippingTime || new Date().toTimeString().split(' ')[0].substring(0, 5)),
                      numberOfBoxes: numberOfBoxes,
                      dimensions: Array(numberOfBoxes).fill({ length: 0, breadth: 0, height: 0 }),
                      packageWeight: Number(row.packageWeight || 0),
                      chargeableWeight: Number(row.packageWeight || 0),
                      shipmentValue: Number(row.shipmentValue || 0),
                      partnerCode: user?.partnerCode,
                      companyCode: String(row.companyCode || ''),
                      paymentType: row.paymentType || 'To Pay',
                    };

                    if (addWaybill(newWaybillData, true)) {
                        addedCount++;
                    } else {
                        errorMessages.push(`Row ${rowNum}: Waybill #${waybillNumber} already exists in the system.`);
                        skippedCount++;
                    }
                } catch(error) {
                    const message = error instanceof Error ? error.message : "An unknown error occurred.";
                    errorMessages.push(`Row ${rowNum}: ${message}`);
                    skippedCount++;
                }
            });
            
            if (errorMessages.length > 0) {
                 toast({
                    title: `Upload Process Finished with Errors (${skippedCount} skipped)`,
                    description: (
                        <div className="max-h-40 overflow-y-auto text-xs">
                            <ul className="list-disc pl-5">
                                {errorMessages.slice(0, 5).map((msg, i) => <li key={i}>{msg}</li>)}
                                {errorMessages.length > 5 && <li>And {errorMessages.length - 5} more errors...</li>}
                            </ul>
                        </div>
                    ),
                    variant: "destructive",
                    duration: 10000,
                });
            }

            if(addedCount > 0) {
                toast({
                    title: 'Upload Complete',
                    description: `${addedCount} waybills successfully added.`,
                });
            } else if (errorMessages.length === 0) {
                toast({
                    title: 'No Waybills Added',
                    description: 'The file might be empty or all waybills were duplicates/invalid.',
                });
            }
        } catch (error) {
            console.error("Error parsing Excel file", error);
            toast({
                title: 'Upload Failed',
                description: 'There was an error parsing the Excel file. Please check the format.',
                variant: 'destructive'
            });
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsBinaryString(file);
  }

  const handleDimensionUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        try {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const dimensionsByWaybill = json.reduce((acc, row) => {
                const waybillNumber = String(row.waybillNumber || '');
                if (!waybillNumber) return acc;
                if (!acc[waybillNumber]) {
                    acc[waybillNumber] = [];
                }
                acc[waybillNumber].push({
                    length: Number(row.length || 0),
                    breadth: Number(row.breadth || 0),
                    height: Number(row.height || 0),
                });
                return acc;
            }, {} as Record<string, {length: number, breadth: number, height: number}[]>);

            let updatedCount = 0;
            let notFoundCount = 0;
            
            Object.entries(dimensionsByWaybill).forEach(([waybillNumber, newDimensions]) => {
                const waybillToUpdate = waybills.find(w => w.waybillNumber === waybillNumber);
                if (waybillToUpdate) {
                    let totalVolume = 0;
                    const conversionFactor = dimensionUnit === 'in' ? 2.54 : 1;

                    const finalDimensions = newDimensions.map(dim => {
                        const l = (dim.length || 0) * conversionFactor;
                        const b = (dim.breadth || 0) * conversionFactor;
                        const h = (dim.height || 0) * conversionFactor;
                        if (l > 0 && b > 0 && h > 0) {
                           totalVolume += (l * b * h * 6);
                        }
                        return { length: l, breadth: b, height: h };
                    });

                    const chargeableWeight = Math.ceil(totalVolume / 27000);
                    
                    updateWaybill({
                        ...waybillToUpdate,
                        dimensions: finalDimensions,
                        numberOfBoxes: finalDimensions.length,
                        chargeableWeight: chargeableWeight
                    });
                    updatedCount++;
                } else {
                    notFoundCount++;
                }
            });

            toast({
                title: 'Dimensions Updated',
                description: `${updatedCount} waybills updated. ${notFoundCount} waybills not found.`
            });

        } catch (error) {
            console.error("Error parsing dimension file", error);
            toast({
                title: 'Upload Failed',
                description: 'Could not parse the dimension file.',
                variant: 'destructive'
            });
        } finally {
            if (dimensionFileInputRef.current) {
                dimensionFileInputRef.current.value = '';
            }
        }
    };
    reader.readAsBinaryString(file);
  };


  const handlePrintSelected = () => {
    if (selectedWaybillIds.length > 0) {
      const ids = selectedWaybillIds.join(',');
      window.open(`/print/waybills?ids=${ids}`, '_blank');
    }
  };

  const handlePrintSelectedStickers = () => {
    if (selectedWaybillIds.length > 0) {
      const ids = selectedWaybillIds.join(',');
      window.open(`/print/stickers?ids=${ids}`, '_blank');
    }
  };
  
  const handlePrintTrip = () => {
    if (tripResult) {
       window.open(`/print/trip/${tripResult}`, '_blank');
    }
  };

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedWaybillIds(prev => {
        if (isSelected) {
            return [...prev, id];
        } else {
            return prev.filter(selectedId => selectedId !== id);
        }
    });
  };

  const handleSelectAllOnPage = (select: boolean) => {
    const currentPageIds = currentWaybills.map(w => w.id);
    if (select) {
        setSelectedWaybillIds(prev => {
            const newIds = currentPageIds.filter(id => !prev.includes(id));
            return [...prev, ...newIds];
        });
    } else {
        setSelectedWaybillIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };
  
  const handleUpdateStatus = (id: string, status: Waybill['status']) => {
    const waybill = waybills.find(w => w.id === id);
    if (waybill) {
        updateWaybill({...waybill, status});
    }
  };


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">Waybill Book</h1>
              <p className="text-muted-foreground">Manage all your shipments from one place.</p>
            </div>
             <div className="flex gap-2 flex-wrap justify-end">
                <Button onClick={handleDownloadExcel} variant="outline" size="sm" disabled={waybills.length === 0}>
                    <FileDown /> Download All Waybills
                </Button>
                <Button onClick={handleCreateNew} size="sm">
                    <PlusCircle /> Create Waybill
                </Button>
            </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="bulk-operations" className="border-b-0">
                <AccordionTrigger className="bg-card p-6 rounded-lg border shadow-sm hover:no-underline [&[data-state=open]]:rounded-b-none">
                    <div className="text-left">
                        <h2 className="text-lg font-semibold leading-none tracking-tight">Bulk Operations</h2>
                        <p className="text-sm text-muted-foreground mt-1.5">Upload waybills or update dimensions in bulk using Excel files.</p>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="bg-card p-6 pt-0 border border-t-0 rounded-b-lg">
                    <Tabs defaultValue="waybills" className="pt-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="waybills">Waybill Upload</TabsTrigger>
                            <TabsTrigger value="dimensions">Dimension Upload</TabsTrigger>
                        </TabsList>
                        <TabsContent value="waybills" className="mt-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={handleDownloadTemplate} variant="outline" className="w-full">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Waybill Template
                                </Button>
                                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                                    <FileUp className="mr-2 h-4 w-4" /> Upload Waybill File
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                            </div>
                        </TabsContent>
                        <TabsContent value="dimensions" className="mt-4">
                            <div className="space-y-4">
                                <div>
                                    <Label className="font-medium">Dimension Unit</Label>
                                    <RadioGroup defaultValue="cm" onValueChange={(value: 'cm' | 'in') => setDimensionUnit(value)} className="mt-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="cm" id="cm" className="peer sr-only" />
                                            <Label htmlFor="cm" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                Centimeters (cm)
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="in" id="in" className="peer sr-only" />
                                            <Label htmlFor="in" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                Inches (in)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button onClick={handleDownloadDimensionTemplate} variant="outline" className="w-full">
                                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Dimension Template
                                    </Button>
                                    <Button onClick={() => dimensionFileInputRef.current?.click()} className="w-full">
                                        <FileUp className="mr-2 h-4 w-4" /> Upload Dimension File
                                    </Button>
                                    <input type="file" ref={dimensionFileInputRef} onChange={handleDimensionUpload} className="hidden" accept=".xlsx, .xls" />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Card>
            <CardHeader>
               <div className="flex items-center justify-between gap-4 flex-wrap">
                 <div className="flex items-center gap-2">
                    <div className="relative flex-grow max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Search by waybill #, trip #, name, city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
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
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {dateRange && <Button variant="ghost" onClick={() => setDateRange(undefined)}>Clear</Button>}
                 </div>
                 <div className="flex items-center gap-2">
                    {tripResult && (
                        <Button onClick={handlePrintTrip} variant="outline" size="sm">
                            <Truck className="mr-2 h-4 w-4" /> Print Trip Sheet
                        </Button>
                    )}
                    {selectedWaybillIds.length > 0 && (
                        <>
                            <span className="text-sm text-muted-foreground">{selectedWaybillIds.length} selected</span>
                            <Button onClick={handlePrintSelected} variant="outline" size="sm">
                                <Printer /> Print Waybills
                            </Button>
                            <Button onClick={handlePrintSelectedStickers} variant="outline" size="sm">
                                <Copy /> Print Stickers
                            </Button>
                        </>
                    )}
                 </div>
               </div>
            </CardHeader>
            <CardContent>
                <WaybillList
                    waybills={currentWaybills}
                    selectedWaybillIds={selectedWaybillIds}
                    onSelectionChange={handleSelectionChange}
                    onSelectAllOnPage={handleSelectAllOnPage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onCreateNew={handleCreateNew}
                />
            </CardContent>
             {totalPages > 0 && (
                <CardFooter className="flex justify-center items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Label htmlFor="items-per-page">Rows per page</Label>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => setItemsPerPage(Number(value))}
                        >
                            <SelectTrigger id="items-per-page" className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100, 200].map(size => (
                                    <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-grow flex justify-center items-center gap-4">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft /> Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    </div>
  );
}

export default function WaybillsPage() {
    return <WaybillsPageContent />;
}

    