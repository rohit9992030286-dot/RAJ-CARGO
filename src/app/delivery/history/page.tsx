
'use client';
import { useMemo, useState } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, RotateCcw, Package, Calendar as CalendarIcon, Truck } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function HistoryTable({ waybills, status }: { waybills: Waybill[], status: 'Delivered' | 'Returned' }) {
    if (waybills.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No {status} Waybills</h3>
                <p className="mt-1 text-sm text-muted-foreground">No shipments were marked as '{status}' in the selected date range.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Waybill #</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {waybills.map((wb) => (
                    <TableRow key={wb.id}>
                        <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                        <TableCell>{wb.deliveryDate ? format(new Date(wb.deliveryDate), 'PP') : 'N/A'}</TableCell> 
                        <TableCell>{wb.receiverName}</TableCell>
                        <TableCell>{wb.receiverAddress}, {wb.receiverCity}, {wb.receiverPincode}</TableCell>
                        <TableCell>
                            <Badge 
                                variant={status === 'Delivered' ? 'default' : 'destructive'} 
                                className="flex items-center gap-1 w-fit"
                            >
                                {status === 'Delivered' ? <CheckCircle className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                                {wb.status}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function DeliveryHistoryPage() {
  const { waybills, isLoaded } = useWaybills();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [deliveredWaybills, returnedWaybills] = useMemo(() => {
    let delivered = waybills.filter((w): w is Waybill => !!w && w.status === 'Delivered');
    let returned = waybills.filter((w): w is Waybill => !!w && w.status === 'Returned');

    if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to || dateRange.from;

        const filterByDate = (w: Waybill) => {
            if (!w.deliveryDate) return false;
            const deliveryDate = new Date(w.deliveryDate);
            const toDateInclusive = new Date(toDate);
            toDateInclusive.setDate(toDateInclusive.getDate() + 1);
            return deliveryDate >= fromDate && deliveryDate < toDateInclusive;
        };
        delivered = delivered.filter(filterByDate);
        returned = returned.filter(filterByDate);
    }
    return [delivered, returned];
  }, [waybills, dateRange]);
  
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
            <h1 className="text-3xl font-bold">Delivery History</h1>
            <p className="text-muted-foreground">A record of all delivered and returned shipments.</p>
        </div>
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range for delivery</span>
                    )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                    />
                </PopoverContent>
            </Popover>
            {dateRange && <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>Clear</Button>}
        </div>
      </div>
      
      <Tabs defaultValue="delivered">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delivered">
                <CheckCircle className="mr-2 h-4 w-4"/>
                Delivered ({deliveredWaybills.length})
            </TabsTrigger>
            <TabsTrigger value="returned">
                <RotateCcw className="mr-2 h-4 w-4"/>
                Returned ({returnedWaybills.length})
            </TabsTrigger>
        </TabsList>
        <TabsContent value="delivered">
            <Card>
                <CardHeader>
                    <CardTitle>Completed Deliveries</CardTitle>
                    <CardDescription>Showing {deliveredWaybills.length} delivered waybill(s).</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoryTable waybills={deliveredWaybills} status="Delivered" />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="returned">
             <Card>
                <CardHeader>
                    <CardTitle>Returned Shipments</CardTitle>
                    <CardDescription>Showing {returnedWaybills.length} returned waybill(s).</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoryTable waybills={returnedWaybills} status="Returned" />
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
    </div>
  );
}
