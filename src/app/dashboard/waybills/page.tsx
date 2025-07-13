
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


export default function WaybillsPage() {
  const { waybills, deleteWaybill, isLoaded } = useWaybills();
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const WAYBILLS_PER_PAGE = 25;

  const filteredWaybills = useMemo(() => {
    if (!searchTerm) return waybills;
    return waybills.filter(w => 
        w.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelectAllOnPage = () => {
    const currentPageIds = currentWaybills.map(w => w.id);
    setSelectedWaybillIds(prev => {
        const newIds = currentPageIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
    });
  };

  const handleDeselectAll = () => {
    setSelectedWaybillIds([]);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
            <h1 className="text-3xl font-bold">Waybill Book</h1>
             <div className="relative flex-grow max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search waybills..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on new search
                    }}
                    className="pl-10"
                />
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
                <Button onClick={handleSelectAllOnPage} variant="outline" size="sm">
                    <CheckSquare className="mr-2 h-4 w-4" /> Select All on Page
                </Button>
                {selectedWaybillIds.length > 0 && (
                   <Button onClick={handleDeselectAll} variant="outline" size="sm">
                    <XSquare className="mr-2 h-4 w-4" /> Deselect All ({selectedWaybillIds.length})
                  </Button>
                )}
                {selectedWaybillIds.length > 0 && (
                  <Button onClick={handlePrintSelected} variant="default" size="sm">
                      <Printer className="mr-2 h-4 w-4" /> Print Selected ({selectedWaybillIds.length})
                  </Button>
                )}
                <Button onClick={handleDownloadExcel} variant="outline" size="sm" disabled={waybills.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> Download Excel
                </Button>
                <Button onClick={handleCreateNew} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Waybill
                </Button>
            </div>
        </div>

        <WaybillList
            waybills={currentWaybills}
            selectedWaybillIds={selectedWaybillIds}
            onSelectionChange={handleSelectionChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
        />

        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </span>
                <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )}
    </div>
  );
}
