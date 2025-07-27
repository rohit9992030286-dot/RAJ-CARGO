
'use client';

import Link from 'next/link';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Truck, CheckCircle, BookCopy, Loader2, Package, XCircleIcon, ArrowRight, PlusCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';


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
        chartData
    };
  }, [waybills]);

  if (!isLoaded) {
     return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's a summary of your shipping activity for {format(new Date(), 'PPP')}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Waybills</CardTitle>
              <BookCopy className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.totalWaybills}</div>
            </CardContent>
            <CardFooter className="mt-auto">
               <p className="text-xs text-muted-foreground">Total waybills for today</p>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.inTransitWaybills}</div>
            </CardContent>
             <CardFooter className="mt-auto">
               <p className="text-xs text-muted-foreground">Currently on their way</p>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.deliveredWaybills}</div>
            </CardContent>
            <CardFooter className="mt-auto">
               <p className="text-xs text-muted-foreground">Successfully delivered today</p>
            </CardFooter>
          </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
                <CardTitle>Today's Waybill Status Overview</CardTitle>
                <CardDescription>A visual breakdown of all waybills created today.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pl-0">
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
         <Card className="flex flex-col justify-between bg-primary/90 text-primary-foreground">
            <CardHeader>
                <CardTitle>Quick Action</CardTitle>
                <CardDescription className="text-primary-foreground/80">Ready to ship something new?</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Create a new waybill and get your next shipment on its way in minutes.</p>
            </CardContent>
            <CardFooter>
                 <Link href="/booking/waybills/create" className="w-full">
                   <Button variant="secondary" className="w-full">
                       <PlusCircle className="mr-2 h-4 w-4" /> Create New Waybill
                   </Button>
                </Link>
            </CardFooter>
        </Card>
      </div>
      
    </div>
  );
}
