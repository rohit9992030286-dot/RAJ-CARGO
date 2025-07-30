
'use client';

import { useRouter } from 'next/navigation';
import { useWaybills } from '@/hooks/useWaybills';
import { WaybillForm } from '@/components/WaybillForm';
import { Waybill } from '@/types/waybill';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateWaybillPage() {
  const router = useRouter();
  const { addWaybill } = useWaybills();
  const { user } = useAuth();
  
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

  if (user?.role === 'admin') {
    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-destructive" />
                    Access Denied
                </CardTitle>
                <CardDescription>
                    Administrators are not permitted to create new waybills. This action is restricted to users with the 'booking' role.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Your account has administrative privileges, which are intended for managing users, settings, and overall system health.</p>
                <p className="mt-2">To create a waybill, please log in with a staff account that has booking permissions.</p>
                <Button onClick={() => router.push('/booking/waybills')} className="mt-4">
                    Back to Waybill Book
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create New Waybill</h1>
      <WaybillForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
