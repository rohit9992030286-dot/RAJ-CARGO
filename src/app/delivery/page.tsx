
'use client';
import { useMemo, useState } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Search, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';
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


export default function DeliverySheetPage() {
    const { manifests, allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, getWaybillById, updateWaybill, isLoaded: waybillsLoaded } = useWaybills();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

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


    const handleUpdateStatus = (waybill: Waybill, newStatus: 'Delivered' | 'Returned') => {
        updateWaybill({
            ...waybill,
            status: newStatus,
            deliveryDate: new Date().toISOString()
        });
        toast({
            title: `Waybill ${newStatus}`,
            description: `Waybill #${waybill.waybillNumber} has been marked as ${newStatus}.`
        });
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
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold">Delivery Sheet</h1>
                    <p className="text-muted-foreground">Manage and update the status of today's deliveries.</p>
                </div>
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

            {waybillsByManifest.length > 0 ? (
                waybillsByManifest.map(({ manifestInfo, waybills }) => (
                    <Card key={manifestInfo.id}>
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
                                                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Delivered
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirm Delivery?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Mark waybill #{wb.waybillNumber} as 'Delivered'. This action cannot be easily undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleUpdateStatus(wb, 'Delivered')}>Confirm</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive">
                                                            <RotateCcw className="mr-2 h-4 w-4" /> Returned
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Confirm Return?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Mark waybill #{wb.waybillNumber} as 'Returned'. This action cannot be easily undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleUpdateStatus(wb, 'Returned')}>Confirm Return</AlertDialogAction>
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
        </div>
    );
}
