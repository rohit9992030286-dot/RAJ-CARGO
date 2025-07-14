
'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillList } from '@/components/WaybillList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PlusCircle, FileDown, Printer, ChevronLeft, ChevronRight, Search, FileUp, FileSpreadsheet, Copy, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Waybill, waybillSchema } from '@/types/waybill';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';


export default function WaybillsPage() {
  const { waybills, deleteWaybill, updateWaybill, isLoaded, addWaybill } = useWaybills();
  const { addWaybillToInventory } = useWaybillInventory();
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const WAYBILLS_PER_PAGE = 10;

  const filteredWaybills = useMemo(() => {
    let filtered = waybills;

    if (searchTerm) {
      filtered = filtered.filter(w => 
          w.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.receiverCity.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (date) {
        const selectedDate = format(date, 'yyyy-MM-dd');
        filtered = filtered.filter(w => w.shippingDate === selectedDate);
    }
    
    return filtered;
  }, [waybills, searchTerm, date]);

  const indexOfLastWaybill = currentPage * WAYBILLS_PER_PAGE;
  const indexOfFirstWaybill = indexOfLastWaybill - WAYBILLS_PER_PAGE;
  const currentWaybills = filteredWaybills.slice(indexOfFirstWaybill, indexOfLastWaybill);
  const totalPages = Math.ceil(filteredWaybills.length / WAYBILLS_PER_PAGE);

  const handleCreateNew = () => {
    router.push('/dashboard/waybills/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/waybills/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    deleteWaybill(id);
    setSelectedWaybillIds(prev => prev.filter(selectedId => selectedId !== id));
  };
  
  const handleDownloadExcel = () => {
    if (waybills.length === 0) {
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(waybills);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waybills");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    
    saveAs(data, 'waybills.xlsx');
  };

  const handleDownloadTemplate = () => {
    const headers = Object.keys(waybillSchema.shape).filter(key => key !== 'id');
    const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waybill Template");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'waybill_template.xlsx');
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

            json.forEach((row, index) => {
                try {
                    let shippingDate;
                    if (row.shippingDate instanceof Date && !isNaN(row.shippingDate.getTime())) {
                        shippingDate = format(row.shippingDate, 'yyyy-MM-dd');
                    } else if (typeof row.shippingDate === 'string') {
                         const parsedDate = new Date(row.shippingDate);
                         if(!isNaN(parsedDate.getTime())) {
                           shippingDate = format(parsedDate, 'yyyy-MM-dd');
                         }
                    } else if (typeof row.shippingDate === 'number') {
                         // Handle Excel's numeric date format
                         const excelEpoch = new Date(1899, 11, 30);
                         const parsedDate = addDays(excelEpoch, row.shippingDate);
                         if(!isNaN(parsedDate.getTime())) {
                            shippingDate = format(parsedDate, 'yyyy-MM-dd');
                         }
                    }
                    
                    if (!shippingDate) {
                        shippingDate = format(new Date(), 'yyyy-MM-dd');
                    }

                    // Sanitize and coerce data types without strict validation
                    const newWaybillData: Waybill = {
                      id: crypto.randomUUID(),
                      waybillNumber: String(row.waybillNumber || ''),
                      invoiceNumber: String(row.invoiceNumber || ''),
                      eWayBillNo: String(row.eWayBillNo || ''),
                      senderName: String(row.senderName || ''),
                      senderAddress: String(row.senderAddress || ''),
                      senderCity: String(row.senderCity || ''),
                      senderPincode: String(row.senderPincode || ''),
                      senderPhone: String(row.senderPhone || ''),
                      receiverName: String(row.receiverName || ''),
                      receiverAddress: String(row.receiverAddress || ''),
                      receiverCity: String(row.receiverCity || ''),
                      receiverPincode: String(row.receiverPincode || ''),
                      receiverPhone: String(row.receiverPhone || ''),
                      packageDescription: String(row.packageDescription || ''),
                      status: row.status || 'Pending',
                      shippingDate: shippingDate,
                      shippingTime: String(row.shippingTime || '10:00'),
                      numberOfBoxes: Number(row.numberOfBoxes || 1),
                      packageWeight: Number(row.packageWeight || 0),
                      shipmentValue: Number(row.shipmentValue || 0),
                    };
                    
                    // Basic check to avoid blank waybill numbers
                    if (!newWaybillData.waybillNumber) {
                        console.error(`Error processing row ${index + 2}: Waybill number is missing.`);
                        skippedCount++;
                        return; // continue to next row
                    }

                    if (addWaybill(newWaybillData, true)) { // Pass true to suppress toast
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                } catch(error) {
                    console.error(`Error processing row ${index + 2}:`, error);
                    skippedCount++;
                }
            });

            toast({
                title: 'Upload Complete',
                description: `${addedCount} waybills added. ${skippedCount} waybills skipped (duplicates or errors).`,
            });
        } catch (error) {
            console.error("Error parsing Excel file", error);
            toast({
                title: 'Upload Failed',
                description: 'There was an error parsing the Excel file. Please check the format.',
                variant: 'destructive'
            });
        }
    };
    reader.readAsBinaryString(file);
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

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
                <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                    <FileSpreadsheet /> Download Template
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                    <FileUp /> Upload Excel
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                <Button onClick={handleDownloadExcel} variant="outline" size="sm" disabled={waybills.length === 0}>
                    <FileDown /> Download Excel
                </Button>
                <Button onClick={handleCreateNew} size="sm">
                    <PlusCircle /> Create Waybill
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
               <div className="flex items-center justify-between gap-4 flex-wrap">
                 <div className="flex items-center gap-2">
                    <div className="relative flex-grow max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Search by waybill #, name, city..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1); // Reset to first page on new search
                            }}
                            className="pl-10"
                        />
                    </div>
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
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                                setDate(newDate);
                                setCurrentPage(1);
                            }}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}
                 </div>
                 {selectedWaybillIds.length > 0 && (
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">{selectedWaybillIds.length} selected</span>
                    <Button onClick={handlePrintSelected} variant="outline" size="sm">
                        <Printer /> Print Waybills
                    </Button>
                    <Button onClick={handlePrintSelectedStickers} variant="outline" size="sm">
                        <Copy /> Print Stickers
                    </Button>
                  </div>
                )}
               </div>
            </CardHeader>
            <CardContent>
                <WaybillList
                    waybills={currentWaybills}
                    selectedWaybillIds={selectedWaybillIds}
                    onSelectionChange={handleSelectionChange}
                    onSelectAllChange={handleSelectAllOnPage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                    onCreateNew={handleCreateNew}
                />
            </CardContent>
             {totalPages > 1 && (
            <CardFooter className="flex justify-center items-center gap-4 mt-4">
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
            </CardFooter>
        )}
        </Card>
    </div>
  );
}
