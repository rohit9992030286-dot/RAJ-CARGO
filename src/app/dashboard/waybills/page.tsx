
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillList } from '@/components/WaybillList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, FileDown, Printer, CheckSquare, XSquare, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Waybill } from '@/types/waybill';


export default function WaybillsPage() {
  const { waybills, deleteWaybill, updateWaybill, isLoaded } = useWaybills();
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const WAYBILLS_PER_PAGE = 10;

  const filteredWaybills = useMemo(() => {
    if (!searchTerm) return waybills;
    return waybills.filter(w => 
        w.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.receiverCity.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [waybills, searchTerm]);

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
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create a Blob
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    
    // Use file-saver to trigger download
    saveAs(data, 'waybills.xlsx');
  };

  const handlePrintSelected = () => {
    if (selectedWaybillIds.length > 0) {
      const ids = selectedWaybillIds.join(',');
      window.open(`/print/waybills?ids=${ids}`, '_blank');
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
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
                    <FileDown /> Download Excel
                </Button>
                <Button onClick={handleCreateNew} size="sm">
                    <PlusCircle /> Create Waybill
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
               <div className="flex items-center justify-between gap-4">
                 <div className="relative flex-grow max-w-md">
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
                 {selectedWaybillIds.length > 0 && (
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">{selectedWaybillIds.length} selected</span>
                    <Button onClick={handlePrintSelected} variant="outline" size="sm">
                        <Printer /> Print Selected
                    </Button>
                    <Button onClick={() => setSelectedWaybillIds([])} variant="ghost" size="sm">
                        <XSquare /> Deselect All
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
