
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
      partnerOutboundManifests = partnerOutboundManifests.filter(m => m.manifestNo.toLowerCase().includes(searchTerm.toLowerCase()));
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
            <h1 className="text-4xl font-bold">Active Delivery Sheet</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage final delivery of all incoming waybills.</p>
        </div>
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
                Found {manifestsForDelivery.length} manifest(s) assigned to you for delivery.
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
                                <CardDescription>Dispatched from Hub on {format(new Date(manifest.date), 'PPP')}</CardDescription>
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
