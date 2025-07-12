'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillList } from '@/components/WaybillList';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export default function WaybillsPage() {
  const { waybills, deleteWaybill, isLoaded } = useWaybills();
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
  const router = useRouter();

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

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Waybill Book</h1>
            <div className="flex gap-2">
                {selectedWaybillIds.length > 0 && (
                  <Button onClick={handlePrintSelected} variant="default">
                      <Printer className="mr-2 h-4 w-4" /> Print Selected ({selectedWaybillIds.length})
                  </Button>
                )}
                <Button onClick={handleDownloadExcel} variant="outline" disabled={waybills.length === 0}>
                    <FileDown className="mr-2 h-4 w-4" /> Download Excel
                </Button>
                <Button onClick={handleCreateNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Waybill
                </Button>
            </div>
        </div>
        <WaybillList
            waybills={waybills}
            selectedWaybillIds={selectedWaybillIds}
            onSelectionChange={handleSelectionChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
        />
    </div>
  );
}
