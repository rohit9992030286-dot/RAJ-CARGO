
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillForm } from '@/components/WaybillForm';
import { Waybill } from '@/types/waybill';
import { Loader2 } from 'lucide-react';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';

export default function EditWaybillPage() {
  const router = useRouter();
  const params = useParams();
  const { getWaybillById, updateWaybill, isLoaded } = useWaybills();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  if (!isLoaded) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  const waybillToEdit = getWaybillById(id);

  const handleSave = (waybill: Waybill) => {
    updateWaybill(waybill);
    router.push('/booking/waybills');
    return true; // Assume update is always successful
  };

  const handleCancel = () => {
    router.push('/booking/waybills');
  };

  if (!waybillToEdit) {
    return <div>Waybill not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Waybill #{waybillToEdit.waybillNumber}</h1>
      <WaybillForm initialData={waybillToEdit} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
