
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
    <div className="space-y-8">
       <div className="p-8 rounded-xl bg-card border relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-0">
             <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_3_2)">
                <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="url(#paint0_radial_3_2)"/>
                <path d="M127.188 199.389C157.971 188.498 183.33 166.974 196.357 138.834C209.384 110.693 208.767 78.4111 194.675 50.418C180.583 22.4249 154.248 1.40509 123.465 -9.48622C92.6823 -20.3775 59.21 -19.9698 28.1475 -8.44855C-2.91497 3.07271 -30.0822 25.132 -48.2163 53.2721C-66.3504 81.4123 -74.4925 113.885 -71.2163 145.878C-67.9401 177.871 -53.472 207.411 -31.2581 229.076" fill="url(#paint1_linear_3_2)"/>
                </g>
                <defs>
                <radialGradient id="paint0_radial_3_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100) rotate(90) scale(100)">
                <stop stopColor="hsl(var(--primary) / 0.1)"/>
                <stop offset="1" stopColor="hsl(var(--primary) / 0)"/>
                </radialGradient>
                <linearGradient id="paint1_linear_3_2" x1="82.4519" y1="185.038" x2="-23.7548" y2="-13.4357" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary) / 0.05)"/>
                <stop offset="1" stopColor="hsl(var(--primary) / 0)"/>
                </linearGradient>
                <clipPath id="clip0_3_2">
                <rect width="200" height="200" fill="white"/>
                </clipPath>
                </defs>
            </svg>
        </div>
        <div className="relative">
            <h1 className="text-4xl font-bold">Booking Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Here's a summary of your shipping activity for {format(new Date(), 'PPP')}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
