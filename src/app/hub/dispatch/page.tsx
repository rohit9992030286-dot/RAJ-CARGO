
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
import { Loader2, Package, Send, Truck, User, Phone, Briefcase, Building, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeliveryPartner {
    partnerCode: string;
    username: string;
}

export default function HubDispatchPage() {
    const { allManifests, isLoaded: manifestsLoaded, addManifest } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded, updateWaybill } = useWaybills();
    const { user, users } = useAuth();
    const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);

    const deliveryPartners = useMemo(() => {
        return users.filter(u => u.roles.includes('delivery') && u.partnerCode) as DeliveryPartner[];
    }, [users]);


    const verifiedWaybillsForDispatch = useMemo(() => {
        if (!manifestsLoaded || !waybillsLoaded) return [];

        const hubReceivedManifests = allManifests.filter(m => ['Received', 'Short Received'].includes(m.status));
        const dispatchedFromHubWbIds = new Set(allManifests.filter(m => m.origin === 'hub').flatMap(m => m.waybillIds));
        
        const verifiedWaybillIds = new Set<string>();

        hubReceivedManifests.forEach(manifest => {
            manifest.verifiedBoxIds?.forEach(boxId => {
                const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
                const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);
                if (waybill && !dispatchedFromHubWbIds.has(waybill.id)) {
                    verifiedWaybillIds.add(waybill.id);
                }
            });
        });
        
        return Array.from(verifiedWaybillIds).map(id => allWaybills.find(wb => wb.id === id)).filter((wb): wb is Waybill => !!wb);

    }, [allManifests, allWaybills, manifestsLoaded, waybillsLoaded]);

    const waybillsByCity = useMemo(() => {
        const hubReceivedManifests = allManifests.filter(m => ['Received', 'Short Received'].includes(m.status));

        return verifiedWaybillsForDispatch.reduce((acc, wb) => {
            const city = wb.receiverCity.toUpperCase();
            if (!acc[city]) {
                acc[city] = { waybills: [], pallet: undefined };
            }
            acc[city].waybills.push(wb);

            if (!acc[city].pallet) {
                for (const manifest of hubReceivedManifests) {
                    if (manifest.palletAssignments && manifest.palletAssignments[city]) {
                        acc[city].pallet = manifest.palletAssignments[city];
                        break;
                    }
                }
            }

            return acc;
        }, {} as Record<string, { waybills: Waybill[], pallet?: number }>);
    }, [verifiedWaybillsForDispatch, allManifests]);


    const handleCreateDispatch = () => {
        if (selectedWaybillIds.length === 0) {
            toast({ title: 'No Waybills Selected', description: 'Please select at least one waybill to dispatch.', variant: 'destructive'});
            return;
        }
        if (!vehicleNo.trim() || !driverName.trim() || !driverContact.trim() || !selectedPartner) {
            toast({ title: 'All Fields Required', description: 'Please fill in all vehicle, driver, and delivery partner details.', variant: 'destructive'});
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
            deliveryPartnerCode: selectedPartner.partnerCode,
            deliveryPartnerName: selectedPartner.username,
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
        setSelectedPartner(null);
    };

    const handleSelectCity = (city: string, checked: boolean) => {
        const cityWaybillIds = waybillsByCity[city].waybills.map(wb => wb.id);
        if (checked) {
            setSelectedWaybillIds(prev => [...new Set([...prev, ...cityWaybillIds])]);
        } else {
            setSelectedWaybillIds(prev => prev.filter(id => !cityWaybillIds.includes(id)));
        }
    };

    const handlePartnerSelect = (partnerCode: string) => {
        const partner = deliveryPartners.find(p => p.partnerCode === partnerCode);
        setSelectedPartner(partner || null);
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
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                     {Object.keys(waybillsByCity).length > 0 ? (
                        Object.entries(waybillsByCity).map(([city, data]) => {
                             const cityWaybillIds = data.waybills.map(wb => wb.id);
                             const isAllSelectedInCity = cityWaybillIds.every(id => selectedWaybillIds.includes(id));

                            return (
                                <Card key={city}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`select-all-${city}`}
                                                        checked={isAllSelectedInCity}
                                                        onCheckedChange={(checked) => handleSelectCity(city, !!checked)}
                                                        aria-label={`Select all for ${city}`}
                                                    />
                                                    <label htmlFor={`select-all-${city}`} className="text-lg font-semibold flex items-center gap-2">
                                                        <Building className="h-5 w-5 text-muted-foreground" />
                                                        Destination: {city}
                                                    </label>
                                                </div>
                                                <Badge variant="secondary">{data.waybills.length} Waybill(s)</Badge>
                                            </div>
                                            {data.pallet && (
                                                <Badge variant="outline" className="text-base font-bold py-1 px-3">
                                                    <Layers className="mr-2 h-4 w-4" />
                                                    Pallet #{data.pallet}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pl-2 pr-0 pb-0">
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                    <TableHead>Waybill #</TableHead>
                                                    <TableHead>Receiver</TableHead>
                                                    <TableHead>Booking Partner</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.waybills.map(wb => (
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
                                                        <TableCell>{wb.partnerCode || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                         </Table>
                                    </CardContent>
                                </Card>
                            )
                        })
                     ) : (
                        <Card className="lg:col-span-2">
                             <CardContent className="text-center py-16 border-2 border-dashed rounded-lg">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No Verified Waybills</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Once you verify incoming manifests, the waybills will appear here.
                                </p>
                            </CardContent>
                        </Card>
                     )}
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
                             <div>
                                <Label htmlFor="delivery-partner">Delivery Partner</Label>
                                 <Select value={selectedPartner?.partnerCode} onValueChange={handlePartnerSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a delivery partner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deliveryPartners.map(p => (
                                            <SelectItem key={p.partnerCode} value={p.partnerCode}>
                                                {p.username} ({p.partnerCode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                 </Select>
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
