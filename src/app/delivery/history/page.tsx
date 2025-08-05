
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, CheckCircle, Calendar, User, XCircle } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface HistoryWaybill extends Waybill {
    manifestNo?: string;
}

export default function DeliveryHistoryPage() {
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();

  const { deliveredWaybills, returnedWaybills } = useMemo(() => {
    const hubManifests = allManifests.filter(m => m.origin === 'hub');
    const hubManifestWaybillIds = new Set(hubManifests.flatMap(m => m.waybillIds));

    const delivered: HistoryWaybill[] = [];
    const returned: HistoryWaybill[] = [];

    allWaybills.forEach(wb => {
        if (hubManifestWaybillIds.has(wb.id)) {
            const manifest = hubManifests.find(m => m.waybillIds.includes(wb.id));
            if (wb.status === 'Delivered' && wb.deliveryDate) {
                delivered.push({ ...wb, manifestNo: manifest?.manifestNo });
            } else if (wb.status === 'Returned') {
                 returned.push({ ...wb, manifestNo: manifest?.manifestNo });
            }
        }
    });

    delivered.sort((a, b) => new Date(b.deliveryDate!).getTime() - new Date(a.deliveryDate!).getTime());
    returned.sort((a, b) => new Date(b.shippingDate).getTime() - new Date(a.shippingDate).getTime());

    return { deliveredWaybills: delivered, returnedWaybills: returned };

  }, [allManifests, allWaybills]);
  
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
        <h1 className="text-3xl font-bold">Delivery History</h1>
        <p className="text-muted-foreground">A record of all completed deliveries and returned shipments.</p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6"/>
                  Successfully Delivered ({deliveredWaybills.length})
              </CardTitle>
          </CardHeader>
          <CardContent>
                {deliveredWaybills.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Waybill #</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Receiver</TableHead>
                            <TableHead>Received By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deliveredWaybills.map((wb) => (
                            <TableRow key={wb.id}>
                                <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                                <TableCell>{format(new Date(wb.deliveryDate!), 'PP')}</TableCell>
                                <TableCell>{wb.receiverName}</TableCell>
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
                ) : (
                     <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Delivered Waybills Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Once a waybill is marked as 'Delivered', it will appear here.
                        </p>
                    </div>
                )}
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-6 w-6"/>
                  Returned Shipments ({returnedWaybills.length})
              </CardTitle>
          </CardHeader>
          <CardContent>
                {returnedWaybills.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Waybill #</TableHead>
                            <TableHead>Booking Date</TableHead>
                            <TableHead>Receiver</TableHead>
                            <TableHead>Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {returnedWaybills.map((wb) => (
                            <TableRow key={wb.id}>
                                <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                                <TableCell>{format(new Date(wb.shippingDate), 'PP')}</TableCell>
                                <TableCell>{wb.receiverName}</TableCell>
                                <TableCell>{wb.receiverAddress}, {wb.receiverCity}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Returned Waybills</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                           No shipments have been marked as 'Returned'.
                        </p>
                    </div>
                )}
          </CardContent>
      </Card>
    </div>
  );
}
