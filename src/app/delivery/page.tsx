
'use client';

import { useState, useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package, Check, MoreHorizontal, X, User, Truck, Search } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Manifest } from '@/types/manifest';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Delivered: 'default',
  'In Transit': 'secondary',
  'Out for Delivery': 'secondary',
  Returned: 'destructive',
  Pending: 'outline',
  Cancelled: 'destructive',
};

const statusOptions: Waybill['status'][] = ['Out for Delivery', 'Delivered', 'Returned'];

interface ManifestForDelivery extends Manifest {
    waybills: Waybill[];
}

export default function DeliveryPage() {
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const { allWaybills, updateWaybill, getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingWaybill, setVerifyingWaybill] = useState<Waybill | null>(null);
  const [receivedBy, setReceivedBy] = useState('');

  const manifestsForDelivery: ManifestForDelivery[] = useMemo(() => {
    if (!user || isAuthLoading || !manifestsLoaded || !waybillsLoaded) return [];

    let partnerOutboundManifests = allManifests.filter(manifest =>
      manifest.origin === 'hub' && manifest.deliveryPartnerCode === user.partnerCode
    );

    if (searchTerm) {
      partnerOutboundManifests = partnerOutboundManifests.filter(m => m.manifestNo.includes(searchTerm));
    }

    return partnerOutboundManifests.map(manifest => ({
        ...manifest,
        waybills: manifest.waybillIds.map(id => getWaybillById(id)).filter((wb): wb is Waybill => !!wb)
    })).filter(m => m.waybills.length > 0)
     .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [allManifests, getWaybillById, user, isAuthLoading, manifestsLoaded, waybillsLoaded, searchTerm]);

  
  const handleUpdateStatus = (waybill: Waybill, status: Waybill['status']) => {
    if (status === 'Delivered') {
        setVerifyingWaybill(waybill);
    } else {
        updateWaybill({...waybill, status});
        toast({ title: "Status Updated", description: `Waybill #${waybill.waybillNumber} marked as ${status}.`});
    }
  };

  const handleConfirmDelivery = () => {
    if (!verifyingWaybill || !receivedBy.trim()) {
        toast({ title: "Receiver Name Required", description: "Please enter the name of the person who received the package.", variant: "destructive" });
        return;
    }
    updateWaybill({
        ...verifyingWaybill,
        status: 'Delivered',
        deliveryDate: new Date().toISOString().split('T')[0],
        receivedBy: receivedBy.trim()
    });
    toast({ title: "Delivery Confirmed!", description: `Waybill #${verifyingWaybill.waybillNumber} marked as delivered.`});
    setVerifyingWaybill(null);
    setReceivedBy('');
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
           <div className="flex items-center justify-between gap-4">
                <CardTitle>Assigned Manifests</CardTitle>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search by Manifest No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 font-mono"
                    />
                </div>
           </div>
           <CardDescription>
                Found {manifestsForDelivery.length} manifest(s) assigned to you.
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {manifestsForDelivery.length > 0 ? (
            manifestsForDelivery.map(manifest => (
                 <Card key={manifest.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 flex-row flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Truck className="h-6 w-6 text-primary"/>
                            <div>
                                <CardTitle className="text-xl">{manifest.manifestNo}</CardTitle>
                                <CardDescription>Dispatched on {format(new Date(manifest.date), 'PPP')}</CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary">{manifest.waybills.length} Waybills</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Waybill #</TableHead>
                                <TableHead>Receiver</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {manifest.waybills.map((wb) => (
                                <TableRow key={wb.id}>
                                    <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
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
                                                <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(wb, status)}>
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
                    </CardContent>
                </Card>
            ))
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

      {/* Verification Dialog */}
       <AlertDialog open={!!verifyingWaybill} onOpenChange={(open) => !open && setVerifyingWaybill(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Delivery for Waybill #{verifyingWaybill?.waybillNumber}</AlertDialogTitle>
                    <AlertDialogDescription>
                        To finalize the delivery, please enter the name of the person who received the package.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="received-by">Receiver's Name</Label>
                    <Input 
                        id="received-by"
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        placeholder="Enter full name"
                        autoFocus
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReceivedBy('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelivery}>
                        Confirm Delivery
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
