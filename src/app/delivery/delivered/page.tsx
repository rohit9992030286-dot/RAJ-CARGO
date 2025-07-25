
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, CheckCircle } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function DeliveredHistoryPage() {
  const { manifests, isLoaded: manifestsLoaded } = useManifests();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();

  const deliveredWaybills = useMemo(() => {
    const hubManifestWaybillIds = manifests
      .filter(m => m.origin === 'hub')
      .flatMap(m => m.waybillIds);

    return hubManifestWaybillIds
      .map(id => getWaybillById(id))
      .filter((w): w is Waybill => !!w && w.status === 'Delivered');
  }, [manifests, getWaybillById]);
  
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

      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
          <CardDescription>
            You have a total of {deliveredWaybills.length} delivered waybill(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveredWaybills.length > 0 ? (
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
                {deliveredWaybills.map((wb) => (
                  <TableRow key={wb.id}>
                    <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                    <TableCell>{format(new Date(), 'PPP')}</TableCell> 
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
              <h3 className="mt-4 text-lg font-semibold">No Delivered Waybills Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Once a waybill is marked as 'Delivered', it will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
