
'use client';

import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillForm } from '@/components/WaybillForm';
import { Waybill } from '@/types/waybill';

export default function CreateWaybillPage() {
  const router = useRouter();
  const { addWaybill } = useWaybills();

  const handleSave = (waybill: Waybill) => {
    const success = addWaybill(waybill);
    if (success) {
      router.push('/booking/waybills');
    }
    return success;
  };

  const handleCancel = () => {
    router.push('/booking/waybills');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create New Waybill</h1>
      <WaybillForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
