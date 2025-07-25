
'use client';

import { useMemo, useState } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, Package, Calendar as CalendarIcon } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


export default function DeliveredPage() {
  const { waybills, isLoaded } = useWaybills();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const deliveredWaybills = useMemo(() => {
    let filtered = waybills.filter((w): w is Waybill => !!w && w.status === 'Delivered');
    if (date) {
        const selectedDate = format(date, 'yyyy-MM-dd');
        filtered = filtered.filter(w => w.shippingDate === selectedDate);
    }
    return filtered;
  }, [waybills, date]);
  
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Delivered Waybills</h1>
        <p className="text-muted-foreground">A record of all successfully delivered shipments.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
              <div>
                <CardTitle>Completed Deliveries</CardTitle>
                <CardDescription>
                  Showing {deliveredWaybills.length} delivered waybill(s).
                </CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Filter by date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
                {date && <Button variant="ghost" size="sm" onClick={() => setDate(undefined)}>Clear</Button>}
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {deliveredWaybills.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waybill #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveredWaybills.map((wb) => (
                  <TableRow key={wb.id}>
                    <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                    <TableCell>{format(new Date(wb.shippingDate), 'PP')}</TableCell> 
                    <TableCell>{wb.receiverName}</TableCell>
                    <TableCell>{wb.receiverAddress}, {wb.receiverCity}, {wb.receiverPincode}</TableCell>
                    <TableCell>
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            {wb.status}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Delivered Waybills</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {date ? "No waybills were delivered on this date." : "No waybills have been marked as 'Delivered' yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
