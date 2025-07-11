'use client';

import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillList } from '@/components/WaybillList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function WaybillsPage() {
  const { waybills, deleteWaybill, isLoaded } = useWaybills();
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/dashboard/waybills/create');
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/waybills/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    deleteWaybill(id);
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
            <Button onClick={handleCreateNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Waybill
            </Button>
        </div>
        <WaybillList
            waybills={waybills}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
        />
    </div>
  );
}
