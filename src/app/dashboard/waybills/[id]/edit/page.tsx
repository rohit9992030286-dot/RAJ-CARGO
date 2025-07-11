'use client';

import { useRouter, useParams } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillForm } from '@/components/WaybillForm';
import { Waybill } from '@/types/waybill';

export default function EditWaybillPage() {
  const router = useRouter();
  const params = useParams();
  const { getWaybillById, updateWaybill, isLoaded } = useWaybills();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const waybillToEdit = getWaybillById(id);

  const handleSave = (waybill: Waybill) => {
    updateWaybill(waybill);
    router.push('/dashboard/waybills');
    return true; // Assume update is always successful
  };

  const handleCancel = () => {
    router.push('/dashboard/waybills');
  };

  if (!isLoaded) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
  }

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
