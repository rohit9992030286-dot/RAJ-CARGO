
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, CheckCircle, Calendar, User } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface DeliveredWaybill extends Waybill {
    manifestNo?: string;
}

export default function DeliveredHistoryPage() {
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const { allWaybills, getWaybillById, isLoaded: waybillsLoaded } = useWaybills();

  const deliveredWaybillsByDate = useMemo(() => {
    const hubManifests = allManifests.filter(m => m.origin === 'hub');
    const hubManifestWaybillIds = new Set(hubManifests.flatMap(m => m.waybillIds));

    const deliveredWaybills: DeliveredWaybill[] = [];
    allWaybills.forEach(wb => {
        if (hubManifestWaybillIds.has(wb.id) && wb.status === 'Delivered' && wb.deliveryDate) {
            const manifest = hubManifests.find(m => m.waybillIds.includes(wb.id));
            deliveredWaybills.push({ ...wb, manifestNo: manifest?.manifestNo });
        }
    });

    // Group by delivery date
    return deliveredWaybills.reduce((acc, wb) => {
      const date = wb.deliveryDate!;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(wb);
      return acc;
    }, {} as Record<string, DeliveredWaybill[]>);

  }, [allManifests, allWaybills, getWaybillById]);
  
  const sortedDates = useMemo(() => {
      return Object.keys(deliveredWaybillsByDate).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  }, [deliveredWaybillsByDate]);
  
  if (!manifestsLoaded || !waybillsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Delivered History</h1>
        <p className="text-muted-foreground">A record of all successfully delivered waybills.</p>
      </div>

      {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <Card key={date}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground"/>
                        <span>Deliveries on {format(new Date(date), 'PPP')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Waybill #</TableHead>
                          <TableHead>Manifest #</TableHead>
                          <TableHead>Receiver</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Received By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveredWaybillsByDate[date].map((wb) => (
                          <TableRow key={wb.id}>
                            <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                            <TableCell className="font-mono">{wb.manifestNo || 'N/A'}</TableCell>
                            <TableCell>{wb.receiverName}</TableCell>
                            <TableCell>{wb.receiverAddress}, {wb.receiverCity}</TableCell>
                            <TableCell>
                                <Badge variant="default" className="flex items-center gap-1 w-fit">
                                    <CheckCircle className="h-3 w-3" />
                                    {wb.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                 <User className="h-4 w-4 text-muted-foreground"/>
                                 <span>{wb.receivedBy || 'N/A'}</span>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
          ))
      ) : (
        <Card>
            <CardContent className="text-center py-16 border-2 border-dashed rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Delivered Waybills Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Once a waybill is marked as 'Delivered', it will appear here.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
