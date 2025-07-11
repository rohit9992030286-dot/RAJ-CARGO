'use client';

import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck, CheckCircle, BookCopy, Package } from 'lucide-react';

export default function DashboardPage() {
  const { waybills, isLoaded } = useWaybills();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalWaybills = waybills.length;
  const deliveredWaybills = waybills.filter(w => w.status === 'Delivered').length;
  const inTransitWaybills = waybills.filter(w => w.status === 'In Transit').length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
      <p className="text-muted-foreground mb-8">Here's a summary of your shipping activity.</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waybills</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
                <BookCopy className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalWaybills}</div>
            <p className="text-xs text-muted-foreground">Total waybills created</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <div className="p-2 bg-amber-100 rounded-full">
                <Truck className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{inTransitWaybills}</div>
            <p className="text-xs text-muted-foreground">Packages on their way</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{deliveredWaybills}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered packages</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
