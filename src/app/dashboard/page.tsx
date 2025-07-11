'use client';

import Link from 'next/link';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck, CheckCircle, BookCopy } from 'lucide-react';

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
        <Link href="/dashboard/waybills">
          <Card className="hover:shadow-lg transition-shadow h-full bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Waybills</CardTitle>
              <BookCopy className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900">{totalWaybills}</div>
              <p className="text-xs text-blue-700">Total waybills created</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/waybills">
            <Card className="hover:shadow-lg transition-shadow h-full bg-amber-50 border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-800">In Transit</CardTitle>
                    <Truck className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-amber-900">{inTransitWaybills}</div>
                    <p className="text-xs text-amber-700">Packages on their way</p>
                </CardContent>
            </Card>
        </Link>
        <Link href="/dashboard/waybills">
            <Card className="hover:shadow-lg transition-shadow h-full bg-green-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Delivered</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-green-900">{deliveredWaybills}</div>
                    <p className="text-xs text-green-700">Successfully delivered packages</p>
                </CardContent>
            </Card>
        </Link>
      </div>
    </div>
  );
}
