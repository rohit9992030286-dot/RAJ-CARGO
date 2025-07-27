
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useWaybills } from '@/hooks/useWaybills';
import { useManifests } from '@/hooks/useManifests';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, BookCopy, Truck, Package, List, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const chartConfig = {
  count: {
    label: 'Count',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-4))',
  },
  inTransit: {
    label: 'In Transit',
    color: 'hsl(var(--chart-3))',
  },
  outForDelivery: {
    label: 'Out for Delivery',
    color: 'hsl(var(--chart-2))',
  },
  delivered: {
    label: 'Delivered',
    color: 'hsl(var(--chart-1))',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--chart-5))',
  },
  returned: {
    label: 'Returned',
    color: 'hsl(var(--destructive))',
  },
} satisfies import('@/components/ui/chart').ChartConfig;


export default function SystemOverviewPage() {
    const { users, isLoading: usersLoading } = useAuth();
    const { allWaybills, isLoaded: waybillsLoading } = useWaybills();
    const { allManifests, isLoaded: manifestsLoading } = useManifests();
    const { waybillInventory, isInventoryLoaded } = useWaybillInventory();

    const stats = useMemo(() => {
        const waybillStatusCounts = allWaybills.reduce((acc, wb) => {
            acc[wb.status] = (acc[wb.status] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        const chartData = [
            { status: 'Pending', count: waybillStatusCounts['Pending'] || 0, fill: 'var(--color-pending)' },
            { status: 'In Transit', count: waybillStatusCounts['In Transit'] || 0, fill: 'var(--color-inTransit)' },
            { status: 'Out for Delivery', count: waybillStatusCounts['Out for Delivery'] || 0, fill: 'var(--color-outForDelivery)' },
            { status: 'Delivered', count: waybillStatusCounts['Delivered'] || 0, fill: 'var(--color-delivered)' },
            { status: 'Cancelled', count: waybillStatusCounts['Cancelled'] || 0, fill: 'var(--color-cancelled)' },
            { status: 'Returned', count: waybillStatusCounts['Returned'] || 0, fill: 'var(--color-returned)' },
        ];

        return {
            totalUsers: users.length,
            totalWaybills: allWaybills.length,
            totalManifests: allManifests.length,
            inventoryCount: waybillInventory.length,
            chartData
        }

    }, [users, allWaybills, allManifests, waybillInventory]);

    const isLoading = usersLoading || waybillsLoading || manifestsLoading || !isInventoryLoaded;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="text-muted-foreground">A high-level view of all data in the application.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waybills</CardTitle>
            <BookCopy className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWaybills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Manifests</CardTitle>
            <Truck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalManifests}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Inventory</CardTitle>
            <List className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inventoryCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Waybill Status Distribution</CardTitle>
            <CardDescription>A summary of all waybills across the system by their current status.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full pl-0">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="status" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        angle={-45}
                        textAnchor="end"
                        minTickGap={-100}
                        height={60}
                    />
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
