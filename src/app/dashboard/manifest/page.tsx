
'use client';

import { useState, useMemo } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Waybill } from '@/types/waybill';

export default function ManifestPage() {
  const { waybills, isLoaded } = useWaybills();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const waybillsForDate = useMemo(() => {
    if (!date) return [];
    return waybills.filter(w => new Date(w.shippingDate).toDateString() === date.toDateString());
  }, [waybills, date]);

  const handlePrintManifest = () => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      window.open(`/print/manifest?date=${formattedDate}`, '_blank');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Daily Manifest</h1>
          <p className="text-muted-foreground">Select a date to view and print the manifest for that day.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handlePrintManifest} disabled={!date || waybillsForDate.length === 0}>
            <Printer className="mr-2 h-4 w-4" /> Print Manifest
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manifest for {date ? format(date, 'MMMM d, yyyy') : 'N/A'}</CardTitle>
          <CardDescription>
            Found {waybillsForDate.length} waybill(s) for the selected date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill #</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Receiver City</TableHead>
                <TableHead>Boxes</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waybillsForDate.length > 0 ? (
                waybillsForDate.map((waybill: Waybill) => (
                  <TableRow key={waybill.id}>
                    <TableCell className="font-medium">{waybill.waybillNumber}</TableCell>
                    <TableCell>{waybill.senderName}</TableCell>
                    <TableCell>{waybill.receiverName}</TableCell>
                    <TableCell>{waybill.receiverCity}</TableCell>
                    <TableCell>{waybill.numberOfBoxes}</TableCell>
                    <TableCell>{waybill.packageWeight}</TableCell>
                    <TableCell>{waybill.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No waybills for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
