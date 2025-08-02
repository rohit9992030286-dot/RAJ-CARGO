
'use client';

import { useState, useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, Check, MoreHorizontal, X, User } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Manifest } from '@/types/manifest';

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Delivered: 'default',
  'In Transit': 'secondary',
  'Out for Delivery': 'secondary',
  Returned: 'destructive',
  Pending: 'outline',
  Cancelled: 'destructive',
};

const statusOptions: Waybill['status'][] = ['Out for Delivery', 'Delivered', 'Returned'];

interface WaybillForDelivery extends Waybill {
    manifestDate: string;
}

export default function DeliveryPage() {
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const { allWaybills, updateWaybill, getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  const { user, isLoading: isAuthLoading } = useAuth();

  const waybillsForDelivery = useMemo(() => {
    if (!user || !isAuthLoading || !manifestsLoaded || !waybillsLoaded) return [];

    const waybillsToDeliver: WaybillForDelivery[] = [];
    const processedWaybillIds = new Set<string>();

    const partnerOutboundManifests = allManifests.filter(manifest =>
      manifest.origin === 'hub' && manifest.deliveryPartnerCode === user.partnerCode
    );

    partnerOutboundManifests.forEach(manifest => {
      manifest.waybillIds.forEach(waybillId => {
        if (processedWaybillIds.has(waybillId)) return;

        const waybill = getWaybillById(waybillId);
        if (waybill && (waybill.status === 'Out for Delivery' || waybill.status === 'Delivered' || waybill.status === 'Returned')) {
          waybillsToDeliver.push({
            ...waybill,
            manifestDate: manifest.date,
          });
          processedWaybillIds.add(waybillId);
        }
      });
    });

    return waybillsToDeliver;
  }, [allManifests, getWaybillById, user, isAuthLoading, manifestsLoaded, waybillsLoaded]);

  
  const handleUpdateStatus = (id: string, status: Waybill['status']) => {
    const waybill = allWaybills.find(w => w.id === id);
    if (waybill) {
        updateWaybill({...waybill, status});
    }
  };


  if (!manifestsLoaded || !waybillsLoaded || isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Active Delivery Sheet</h1>
        <p className="text-muted-foreground">Manage final delivery of all incoming waybills.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waybills for Delivery</CardTitle>
          <CardDescription>
            There are {waybillsForDelivery.length} waybill(s) assigned to you for delivery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waybillsForDelivery.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waybill #</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waybillsForDelivery.map((wb) => (
                  <TableRow key={wb.id}>
                    <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                    <TableCell>{format(new Date(wb.manifestDate), 'PP')}</TableCell>
                    <TableCell>{wb.receiverName}</TableCell>
                    <TableCell>{wb.receiverAddress}, {wb.receiverCity}, {wb.receiverPincode}</TableCell>
                    <TableCell>{wb.receiverPhone}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="w-[150px] justify-between">
                                  <Badge variant={statusVariantMap[wb.status] || 'default'} className="p-1">
                                      {wb.status}
                                  </Badge>
                                  <MoreHorizontal className="w-4 h-4 ml-2" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuLabel>Update Delivery Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {statusOptions.map(status => (
                                  <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(wb.id, status)}>
                                      {status}
                                      {wb.status === status && <Check className="w-4 h-4 ml-auto" />}
                                  </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Active Waybills for Delivery</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are currently no manifests assigned to you.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
