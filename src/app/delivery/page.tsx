
'use client';
import { useMemo, useState } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Search, CheckCircle, RotateCcw, AlertCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';


export default function DeliverySheetPage() {
    const { manifests, allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, getWaybillById, updateWaybill, isLoaded: waybillsLoaded } = useWaybills();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [currentWaybillForUpdate, setCurrentWaybillForUpdate] = useState<Waybill | null>(null);

    const outForDeliveryWaybills = useMemo(() => {
        if (!manifestsLoaded || !waybillsLoaded) return [];

        const outForDeliveryIds = new Set<string>();

        // We should look through all manifests assigned to delivery people, not just the current user.
        const deliveryManifests = allManifests.filter(m => m.origin === 'hub');

        deliveryManifests.forEach(m => {
            m.waybillIds.forEach(id => {
                const wb = getWaybillById(id);
                if (wb && wb.status === 'Out for Delivery') {
                    outForDeliveryIds.add(id);
                }
            });
        });
        
        let waybills = Array.from(outForDeliveryIds).map(id => getWaybillById(id)).filter((wb): wb is Waybill => !!wb);

        if (searchTerm) {
            waybills = waybills.filter(wb =>
                wb.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wb.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                wb.receiverAddress.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return waybills;
    }, [allManifests, getWaybillById, manifestsLoaded, waybillsLoaded, searchTerm]);


    const handleUpdateStatus = (newStatus: 'Delivered' | 'Returned') => {
        if (!currentWaybillForUpdate) return;
        
        if (newStatus === 'Delivered' && !receivedBy.trim()) {
            toast({
                title: 'Receiver Name Required',
                description: "Please enter the name of the person who received the package.",
                variant: 'destructive',
            });
            return;
        }

        updateWaybill({
            ...currentWaybillForUpdate,
            status: newStatus,
            deliveryDate: new Date().toISOString(),
            receivedBy: newStatus === 'Delivered' ? receivedBy : undefined,
        });
        toast({
            title: `Waybill ${newStatus}`,
            description: `Waybill #${currentWaybillForUpdate.waybillNumber} has been marked as ${newStatus}.`
        });

        // Close dialog
        setCurrentWaybillForUpdate(null);
        setReceivedBy('');
    };

    const waybillsByManifest = useMemo(() => {
        // use 'manifests' here which is already filtered for the current delivery user
        return manifests
            .map(manifest => {
                const wbs = manifest.waybillIds
                    .map(id => outForDeliveryWaybills.find(wb => wb.id === id))
                    .filter((wb): wb is Waybill => !!wb);
                
                return {
                    manifestInfo: manifest,
                    waybills: wbs
                }
            })
            .filter(item => item.waybills.length > 0);

    }, [outForDeliveryWaybills, manifests]);


    if (!manifestsLoaded || !waybillsLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    

    return (
        <div className="space-y-8">
             <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/50 dark:to-teal-900/80 border border-green-200 dark:border-green-800 shadow-md">
                <h1 className="text-3xl font-bold text-green-800 dark:text-green-100">Delivery Sheet</h1>
                <p className="text-green-600 dark:text-green-300 mt-1">Manage and update the status of today's deliveries.</p>
            </div>
            
            <Card>
                <CardHeader>
                     <div className="flex justify-between items-center gap-4 flex-wrap">
                        <CardTitle>Shipments Out for Delivery</CardTitle>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                type="search"
                                placeholder="Search waybill #, name, address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {waybillsByManifest.length > 0 ? (
                        waybillsByManifest.map(({ manifestInfo, waybills }) => (
                            <Card key={manifestInfo.id} className="mb-6">
                                <CardHeader>
                                    <CardTitle>Manifest: {manifestInfo.manifestNo}</CardTitle>
                                    <CardDescription>Dispatched on {format(new Date(manifestInfo.date), 'PP')} with Vehicle {manifestInfo.vehicleNo}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Waybill #</TableHead>
                                                <TableHead>Receiver</TableHead>
                                                <TableHead>Address</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {waybills.map(wb => (
                                                <TableRow key={wb.id}>
                                                    <TableCell className="font-mono">{wb.waybillNumber}</TableCell>
                                                    <TableCell>{wb.receiverName}</TableCell>
                                                    <TableCell>{wb.receiverAddress}, {wb.receiverCity}</TableCell>
                                                    <TableCell>{wb.receiverPhone}</TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => setCurrentWaybillForUpdate(wb)}>
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Delivered
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirm Delivery?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Mark waybill #{currentWaybillForUpdate?.waybillNumber} as 'Delivered'.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <div className="py-4">
                                                                    <Label htmlFor="received-by">Received By</Label>
                                                                    <div className="relative mt-2">
                                                                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                                        <Input 
                                                                            id="received-by"
                                                                            value={receivedBy}
                                                                            onChange={(e) => setReceivedBy(e.target.value)}
                                                                            placeholder="Enter receiver's name"
                                                                            className="pl-10"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel onClick={() => setReceivedBy('')}>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleUpdateStatus('Delivered')}>Confirm</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="destructive" onClick={() => setCurrentWaybillForUpdate(wb)}>
                                                                    <RotateCcw className="mr-2 h-4 w-4" /> Returned
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirm Return?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Mark waybill #{currentWaybillForUpdate?.waybillNumber} as 'Returned'. This action cannot be easily undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleUpdateStatus('Returned')}>Confirm Return</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
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
                                <h3 className="mt-4 text-lg font-semibold">No Shipments Out for Delivery</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {searchTerm ? 'No waybills match your search.' : 'There are no waybills currently assigned to you for delivery.'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
