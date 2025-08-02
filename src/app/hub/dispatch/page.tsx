
'use client';

import { useMemo, useState } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Package, Send, Truck, User, Phone, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HubDispatchPage() {
    const { allManifests, isLoaded: manifestsLoaded, addManifest } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded, updateWaybill } = useWaybills();
    const { user } = useAuth();
    const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');


    const verifiedWaybillsForDispatch = useMemo(() => {
        if (!manifestsLoaded || !waybillsLoaded) return [];

        const hubReceivedManifests = allManifests.filter(m => ['Received', 'Short Received'].includes(m.status));
        const verifiedWaybillIds = new Set<string>();

        hubReceivedManifests.forEach(manifest => {
            manifest.verifiedBoxIds?.forEach(boxId => {
                const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
                const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);
                if (waybill && waybill.status !== 'Out for Delivery' && waybill.status !== 'Delivered') {
                    verifiedWaybillIds.add(waybill.id);
                }
            });
        });
        
        return Array.from(verifiedWaybillIds).map(id => allWaybills.find(wb => wb.id === id)).filter((wb): wb is Waybill => !!wb);

    }, [allManifests, allWaybills, manifestsLoaded, waybillsLoaded]);

    const handleCreateDispatch = () => {
        if (selectedWaybillIds.length === 0) {
            toast({ title: 'No Waybills Selected', description: 'Please select at least one waybill to dispatch.', variant: 'destructive'});
            return;
        }
        if (!vehicleNo.trim() || !driverName.trim() || !driverContact.trim()) {
            toast({ title: 'Vehicle/Driver Info Missing', description: 'Please fill in all vehicle and driver details.', variant: 'destructive'});
            return;
        }

        const newManifestId = addManifest({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            waybillIds: selectedWaybillIds,
            status: 'Dispatched',
            vehicleNo: vehicleNo,
            driverName: driverName,
            driverContact: driverContact,
            origin: 'hub',
        });

        // Update status of dispatched waybills
        selectedWaybillIds.forEach(id => {
            const waybill = allWaybills.find(wb => wb.id === id);
            if (waybill) {
                updateWaybill({ ...waybill, status: 'Out for Delivery' });
            }
        });

        toast({
            title: 'Manifest Dispatched',
            description: `Outbound manifest created with ${selectedWaybillIds.length} waybills.`,
        });

        setSelectedWaybillIds([]);
        setVehicleNo('');
        setDriverName('');
        setDriverContact('');
    };

    const isAllSelected = verifiedWaybillsForDispatch.length > 0 && selectedWaybillIds.length === verifiedWaybillsForDispatch.length;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedWaybillIds(verifiedWaybillsForDispatch.map(wb => wb.id));
        } else {
            setSelectedWaybillIds([]);
        }
    };

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
                <h1 className="text-3xl font-bold">Outbound Dispatch</h1>
                <p className="text-muted-foreground">Create and manage manifests for final delivery.</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Verified Waybills Ready for Dispatch</CardTitle>
                            <CardDescription>Select waybills to include in a new outbound manifest.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {verifiedWaybillsForDispatch.length > 0 ? (
                                 <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={isAllSelected}
                                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                    aria-label="Select all"
                                                />
                                            </TableHead>
                                            <TableHead>Waybill #</TableHead>
                                            <TableHead>Receiver</TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Booking Partner</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {verifiedWaybillsForDispatch.map(wb => (
                                            <TableRow 
                                                key={wb.id} 
                                                data-state={selectedWaybillIds.includes(wb.id) && "selected"}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedWaybillIds.includes(wb.id)}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedWaybillIds(prev => 
                                                                checked ? [...prev, wb.id] : prev.filter(id => id !== wb.id)
                                                            )
                                                        }}
                                                        aria-label={`Select waybill ${wb.waybillNumber}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                                                <TableCell>{wb.receiverName}</TableCell>
                                                <TableCell>{wb.receiverCity}</TableCell>
                                                <TableCell>{wb.partnerCode || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                 </Table>
                             ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Verified Waybills</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Once you verify incoming manifests, the waybills will appear here.
                                    </p>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-1">
                    <Card className="sticky top-8">
                        <CardHeader>
                            <CardTitle>Create Outbound Manifest</CardTitle>
                            <CardDescription>{selectedWaybillIds.length} waybill(s) selected.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label htmlFor="vehicle-no">Vehicle No.</Label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="vehicle-no" placeholder="e.g., MH-12-AB-1234" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="driver-name">Driver Name</Label>
                                 <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="driver-name" placeholder="Driver's full name" value={driverName} onChange={e => setDriverName(e.target.value)} className="pl-10"/>
                                </div>
                            </div>
                             <div>
                                <Label htmlFor="driver-contact">Driver Contact</Label>
                                 <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input id="driver-contact" placeholder="Driver's phone number" value={driverContact} onChange={e => setDriverContact(e.target.value)} className="pl-10"/>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleCreateDispatch} disabled={selectedWaybillIds.length === 0}>
                                <Send className="mr-2 h-4 w-4" /> Create & Dispatch Manifest
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}

