
'use client';
import { useMemo, useState, useRef } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Search, CheckCircle, RotateCcw, AlertCircle, User, Camera, Clock, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore, differenceInHours } from 'date-fns';
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
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function DeliverySheetPage() {
    const { manifests, allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, getWaybillById, updateWaybill, isLoaded: waybillsLoaded } = useWaybills();
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [currentWaybillForUpdate, setCurrentWaybillForUpdate] = useState<Waybill | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const podInputRef = useRef<HTMLInputElement>(null);

    const outForDeliveryWaybills = useMemo(() => {
        if (!manifestsLoaded || !waybillsLoaded) return [];

        const outForDeliveryIds = new Set<string>();
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

    const handleUpdateStatus = async (newStatus: 'Delivered' | 'Returned') => {
        if (!currentWaybillForUpdate) return;
        
        if (newStatus === 'Delivered') {
            if (!receivedBy.trim()) {
                toast({ title: 'Receiver Name Required', description: "Enter the name of the person who received the package.", variant: 'destructive' });
                return;
            }
            if (!podInputRef.current?.files?.[0]) {
                toast({ title: 'POD Image Required', description: "Please upload a photo of the signed delivery proof.", variant: 'destructive' });
                return;
            }
        }

        setIsUploading(true);
        try {
            let podImageUrl = '';
            if (newStatus === 'Delivered' && podInputRef.current?.files?.[0]) {
                const file = podInputRef.current.files[0];
                const filename = `pod/${user?.partnerCode || 'unassigned'}/${currentWaybillForUpdate.waybillNumber}.jpg`;
                
                const response = await fetch(`/api/upload?filename=${filename}`, {
                    method: 'POST',
                    body: file,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to upload POD image.');
                }
                
                const blob = await response.json();
                podImageUrl = blob.url;
            }

            updateWaybill({
                ...currentWaybillForUpdate,
                status: newStatus,
                deliveryDate: new Date().toISOString(),
                receivedBy: newStatus === 'Delivered' ? receivedBy : undefined,
                podImageUrl: podImageUrl || currentWaybillForUpdate.podImageUrl
            });

            toast({ title: `Waybill ${newStatus}`, description: `Waybill #${currentWaybillForUpdate.waybillNumber} updated.` });
            setCurrentWaybillForUpdate(null);
            setReceivedBy('');
            if(podInputRef.current) podInputRef.current.value = "";
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Could not upload POD image. Please try again.";
            toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsUploading(false);
        }
    };

    const checkEWayBillExpiry = (expiryDateString?: string) => {
        if (!expiryDateString) return null;
        const expiryDate = new Date(expiryDateString);
        const now = new Date();
        if (isBefore(expiryDate, now)) {
            return { label: "EXPIRED", color: "bg-destructive", icon: AlertCircle };
        }
        const hoursLeft = differenceInHours(expiryDate, now);
        if (hoursLeft <= 48) {
            return { label: `${hoursLeft}h left`, color: "bg-amber-500", icon: Clock };
        }
        return { label: "Valid", color: "bg-green-500", icon: CheckCircle };
    }

    const waybillsByManifest = useMemo(() => {
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
        <div className="space-y-8 max-w-7xl mx-auto">
             <div className="p-6 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Delivery Control Sheet</h1>
                <p className="opacity-90 mt-1">Manage last-mile deliveries and upload proof of delivery images.</p>
            </div>
            
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        type="search"
                        placeholder="Search waybill #, name, address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 shadow-sm"
                    />
                </div>
            </div>

            {waybillsByManifest.length > 0 ? (
                waybillsByManifest.map(({ manifestInfo, waybills }) => (
                    <Card key={manifestInfo.id} className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Manifest: {manifestInfo.manifestNo}</CardTitle>
                                    <CardDescription>Vehicle {manifestInfo.vehicleNo} • {waybills.length} pending deliveries</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-white">{format(new Date(manifestInfo.date), 'PP')}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10">
                                        <TableHead className="font-bold">Waybill #</TableHead>
                                        <TableHead className="font-bold">E-Way Bill</TableHead>
                                        <TableHead className="font-bold">Receiver & Address</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {waybills.map(wb => {
                                        const ewayStatus = checkEWayBillExpiry(wb.eWayBillExpiryDate);
                                        const EwayIcon = ewayStatus?.icon;
                                        return (
                                            <TableRow key={wb.id} className="hover:bg-muted/5 transition-colors">
                                                <TableCell className="font-mono font-bold text-primary">{wb.waybillNumber}</TableCell>
                                                <TableCell>
                                                    {ewayStatus ? (
                                                        <Badge className={cn("flex items-center gap-1 w-fit", ewayStatus.color)}>
                                                            <EwayIcon className="h-3 w-3" />
                                                            {ewayStatus.label}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">No E-Way Bill</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{wb.receiverName}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[250px]">{wb.receiverAddress}, {wb.receiverCity}</span>
                                                        <span className="text-xs font-medium mt-1">{wb.receiverPhone}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm" onClick={() => setCurrentWaybillForUpdate(wb)}>
                                                                <CheckCircle className="mr-2 h-4 w-4" /> Delivered
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="max-w-md">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2">
                                                                    <Camera className="h-5 w-5 text-primary" />
                                                                    Complete Delivery
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Confirm delivery for Waybill <span className="font-bold text-black">#{currentWaybillForUpdate?.waybillNumber}</span>.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <div className="py-6 space-y-6">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="received-by" className="font-bold">Receiver's Name *</Label>
                                                                    <div className="relative">
                                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                                        <Input 
                                                                            id="received-by"
                                                                            value={receivedBy}
                                                                            onChange={(e) => setReceivedBy(e.target.value)}
                                                                            placeholder="Full name of person who accepted package"
                                                                            className="pl-10 h-12"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="pod-upload" className="font-bold">Upload POD Photo *</Label>
                                                                    <div 
                                                                        className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors"
                                                                        onClick={() => podInputRef.current?.click()}
                                                                    >
                                                                        <Camera className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                                                                        <p className="text-sm font-medium">Click to take a photo or select image</p>
                                                                        <p className="text-xs text-muted-foreground mt-1">Proof of Delivery (Signed Copy)</p>
                                                                        <Input 
                                                                            type="file"
                                                                            ref={podInputRef}
                                                                            id="pod-upload"
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                            capture="environment"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel disabled={isUploading}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    disabled={isUploading}
                                                                    onClick={(e) => { e.preventDefault(); handleUpdateStatus('Delivered'); }}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : 'Verify & Deliver'}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setCurrentWaybillForUpdate(wb)}>
                                                                <RotateCcw className="mr-2 h-4 w-4" /> Returned
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirm Return?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Mark waybill #{currentWaybillForUpdate?.waybillNumber} as 'Returned'.
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
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed shadow-sm">
                    <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold">Clear Schedule</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                        {searchTerm ? 'No waybills match your search criteria.' : 'You have no pending deliveries assigned to you at this moment.'}
                    </p>
                </div>
            )}
        </div>
    );
}
