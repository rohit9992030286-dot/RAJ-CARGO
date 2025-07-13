
'use client';

import Link from 'next/link';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Truck, CheckCircle, BookCopy, Loader2, Package, XCircleIcon, IndianRupee } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import { useMemo } from 'react';


const chartConfig = {
  count: {
    label: 'Count',
  },
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  delivered: {
    label: 'Delivered',
    color: 'hsl(var(--chart-2))',
  },
  inTransit: {
    label: 'In Transit',
    color: 'hsl(var(--chart-3))',
  },
   pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-4))',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--chart-5))',
  },
} satisfies import('@/components/ui/chart').ChartConfig;


export default function DashboardPage() {
  const { waybills, isLoaded } = useWaybills();

  const todaysStats = useMemo(() => {
    const todaysWaybills = waybills.filter(w => w.shippingDate === format(new Date(), 'yyyy-MM-dd'));

    const totalWaybills = todaysWaybills.length;
    const deliveredWaybills = todaysWaybills.filter(w => w.status === 'Delivered').length;
    const inTransitWaybills = todaysWaybills.filter(w => w.status === 'In Transit').length;
    const pendingWaybills = todaysWaybills.filter(w => w.status === 'Pending').length;
    const cancelledWaybills = todaysWaybills.filter(w => w.status === 'Cancelled').length;

    const totalSales = todaysWaybills.reduce((total, waybill) => {
        const baseCharge = 150;
        const weightCharge = waybill.packageWeight * 10;
        return total + baseCharge + weightCharge;
    }, 0);

    const chartData = [
        { status: 'Total', count: totalWaybills, fill: 'var(--color-total)' },
        { status: 'Pending', count: pendingWaybills, fill: 'var(--color-pending)' },
        { status: 'In Transit', count: inTransitWaybills, fill: 'var(--color-inTransit)' },
        { status: 'Delivered', count: deliveredWaybills, fill: 'var(--color-delivered)' },
        { status: 'Cancelled', count: cancelledWaybills, fill: 'var(--color-cancelled)' },
    ];
    
    return {
        totalWaybills,
        deliveredWaybills,
        inTransitWaybills,
        totalSales,
        chartData
    };
  }, [waybills]);


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Today's Summary</h1>
        <p className="text-muted-foreground">Here's a summary of your shipping activity for {format(new Date(), 'PPP')}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Waybills</CardTitle>
              <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.totalWaybills}</div>
            </CardContent>
          </Card>
          <Link href="/dashboard/sales" className="block hover:shadow-lg transition-shadow rounded-lg">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{todaysStats.totalSales.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.inTransitWaybills}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.deliveredWaybills}</div>
            </CardContent>
          </Card>
      </div>

      <Card className="flex-grow">
          <CardHeader>
              <CardTitle>Today's Waybill Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
             <ChartContainer config={chartConfig} className="w-full h-full">
                 <BarChart data={todaysStats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
      </Card>
      
    </div>
  );
}
