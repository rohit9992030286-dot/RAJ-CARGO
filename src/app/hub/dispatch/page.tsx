
'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Package, Send, Truck, User, Phone, Briefcase, Building, Layers, ScanLine, AlertCircle, CheckCircle, Circle, XCircle, Cpu } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, User as AuthUser } from '@/hooks/useAuth.tsx';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useVehicles } from '@/hooks/useVehicles';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExpectedBox {
    waybillId: string;
    waybillNumber: string;
    boxNumber: number;
    totalBoxes: number;
    boxId: string;
    destination: string;
    receiverName: string;
    pallet?: number;
}

type DispatchType = 'delivery' | 'hub';

export default function HubDispatchPage() {
    const { allManifests, isLoaded: manifestsLoaded, addManifest } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded, updateWaybill } = useWaybills();
    const { user, users } = useAuth();
    const { vehicles, isLoaded: vehiclesLoaded } = useVehicles();
    const [scannedBoxIds, setScannedBoxIds] = useState<string[]>([]);
    const { toast } = useToast();
    const router = useRouter();
    const scanInputRef = useRef<HTMLInputElement>(null);
    const [scanInputValue, setScanInputValue] = useState('');
    const [dispatchType, setDispatchType] = useState<DispatchType>('delivery');

    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [manualVehicleNo, setManualVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [destinationPartnerCode, setDestinationPartnerCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { deliveryPartners, hubPartners } = useMemo(() => {
        const deliveryPartners = users.filter(u => u.roles.includes('delivery'));
        const hubPartners = users.filter(u => u.roles.includes('hub') && u.username !== user?.username);
        return { deliveryPartners, hubPartners };
    }, [users, user]);
    
     useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (dispatchType === 'hub' && selectedVehicleId) {
            const vehicle = vehicles.find(v => v.id === selectedVehicleId);
            if(vehicle) {
                setDriverName(vehicle.driverName);
            }
        } else {
             if (dispatchType === 'delivery') {
                setDriverName('');
                setDriverContact('');
             }
        }
    }, [selectedVehicleId, vehicles, dispatchType]);

    useEffect(() => {
      setDestinationPartnerCode(null);
      setSelectedVehicleId(null);
      setManualVehicleNo('');
      setDriverName('');
      setDriverContact('');
    }, [dispatchType]);


    const expectedBoxesForDispatch = useMemo((): ExpectedBox[] => {
        if (!manifestsLoaded || !waybillsLoaded) return [];

        const hubReceivedManifests = allManifests.filter(m => ['Received', 'Short Received'].includes(m.status));
        const dispatchedFromHubWbIds = new Set(allManifests.filter(m => m.origin === 'hub').flatMap(m => m.waybillIds));
        
        const palletAssignments = new Map<string, number>();
        hubReceivedManifests.forEach(m => {
            if(m.palletAssignments){
                Object.entries(m.palletAssignments).forEach(([city, pallet]) => {
                    palletAssignments.set(city.toUpperCase(), pallet);
                })
            }
        });
        
        const expectedBoxes: ExpectedBox[] = [];

        hubReceivedManifests.forEach(manifest => {
            manifest.verifiedBoxIds?.forEach(boxId => {
                const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
                const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);
                if (waybill && !dispatchedFromHubWbIds.has(waybill.id)) {
                    const boxNumber = parseInt(boxId.substring(boxId.lastIndexOf('-') + 1), 10);
                    const city = waybill.receiverCity.toUpperCase();
                    if (!expectedBoxes.some(b => b.boxId === boxId)) {
                         expectedBoxes.push({
                            waybillId: waybill.id,
                            waybillNumber: waybill.waybillNumber,
                            boxId: boxId,
                            boxNumber: boxNumber,
                            totalBoxes: waybill.numberOfBoxes,
                            destination: city,
                            receiverName: waybill.receiverName,
                            pallet: palletAssignments.get(city)
                        });
                    }
                }
            });
        });
        
        return expectedBoxes;

    }, [allManifests, allWaybills, manifestsLoaded, waybillsLoaded]);

    const boxesByCity = useMemo(() => {
        return expectedBoxesForDispatch.reduce((acc, box) => {
            const city = box.destination;
            if (!acc[city]) {
                acc[city] = { boxes: [], pallet: box.pallet };
            }
            acc[city].boxes.push(box);
            return acc;
        }, {} as Record<string, { boxes: ExpectedBox[], pallet?: number }>);
    }, [expectedBoxesForDispatch]);

    const handleScanBox = (scannedId: string) => {
        setError(null);
        if (!scannedId) return;

        const box = expectedBoxesForDispatch.find(b => b.boxId === scannedId);
        if (!box) {
            setError(`Box ${scannedId} is not expected for dispatch.`);
            return;
        }

        if (scannedBoxIds.includes(scannedId)) {
            setError(`Box ${scannedId} has already been scanned.`);
            return;
        }

        setScannedBoxIds(prev => [...prev, scannedId]);
        toast({ title: 'Box Loaded', description: `Box ${scannedId} added to manifest.`});
    };

    const handleVerifyClick = () => {
        handleScanBox(scanInputValue);
        setScanInputValue('');
        scanInputRef.current?.focus();
    };

    const handleCreateDispatch = () => {
        const loadedWaybillIds = [...new Set(scannedBoxIds.map(boxId => expectedBoxesForDispatch.find(b => b.boxId === boxId)!.waybillId))];

        if (loadedWaybillIds.length === 0) {
            toast({ title: 'No Waybills Loaded', description: 'Please scan at least one box to dispatch.', variant: 'destructive'});
            return;
        }
        if (!destinationPartnerCode) {
             toast({ title: 'Destination Required', description: `Please select a destination ${partnerTypeLabel.toLowerCase()}.`, variant: 'destructive'});
            return;
        }
        
        let vehicleNumber = '';
        let finalDriverName = driverName;

        if (dispatchType === 'hub') {
            const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
            if (!selectedVehicle) {
                toast({ title: 'Vehicle Required', description: 'Please select a vehicle for hub-to-hub transfer.', variant: 'destructive' });
                return;
            }
            vehicleNumber = selectedVehicle.vehicleNumber;
        } else { // delivery
            if (!manualVehicleNo.trim()) {
                 toast({ title: 'Vehicle Number Required', description: 'Please enter a vehicle number for delivery.', variant: 'destructive' });
                 return;
            }
            vehicleNumber = manualVehicleNo;
        }


        let deliveryDetails = {};
        if(dispatchType === 'delivery') {
            const partner = deliveryPartners.find(p => p.partnerCode === destinationPartnerCode);
            deliveryDetails = {
                deliveryPartnerCode: destinationPartnerCode,
                deliveryPartnerName: partner?.username,
            }
        } else { // hub
             const partner = hubPartners.find(p => p.partnerCode === destinationPartnerCode);
            deliveryDetails = {
                destinationHubCode: destinationPartnerCode,
                destinationHubName: partner?.username,
            }
        }

        addManifest({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            waybillIds: loadedWaybillIds,
            status: 'Dispatched',
            vehicleNo: vehicleNumber,
            driverName: finalDriverName,
            driverContact: driverContact,
            origin: 'hub',
            ...deliveryDetails
        });

        loadedWaybillIds.forEach(id => {
            const waybill = allWaybills.find(wb => wb.id === id);
            if (waybill) {
                const newStatus = dispatchType === 'delivery' ? 'Out for Delivery' : 'In Transit';
                updateWaybill({ ...waybill, status: newStatus });
            }
        });

        toast({
            title: 'Manifest Dispatched',
            description: `Outbound manifest created with ${loadedWaybillIds.length} waybills.`,
        });

        setScannedBoxIds([]);
        setSelectedVehicleId(null);
        setDestinationPartnerCode(null);
        setManualVehicleNo('');
        setDriverName('');
        setDriverContact('');
    };
    

    if (!manifestsLoaded || !waybillsLoaded || !vehiclesLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    const partnerList = dispatchType === 'delivery' ? deliveryPartners : hubPartners;
    const partnerTypeLabel = dispatchType === 'delivery' ? 'Delivery Partner' : 'Hub';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Outbound Dispatch</h1>
                <p className="text-muted-foreground">Scan boxes to create manifests for final delivery or hub transfer.</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                     {Object.keys(boxesByCity).length > 0 ? (
                        Object.entries(boxesByCity).map(([city, data]) => {
                             const loadedInCity = data.boxes.filter(b => scannedBoxIds.includes(b.boxId)).length;
                             const totalInCity = data.boxes.length;
                             const allInCityLoaded = loadedInCity === totalInCity;

                            return (
                                <Card key={city} className={allInCityLoaded ? 'border-green-500' : ''}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    <Building className="h-5 w-5 text-muted-foreground" />
                                                    Destination: {city}
                                                </h3>
                                                <Badge variant="secondary">{loadedInCity} / {totalInCity} Loaded</Badge>
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
                                                    <TableHead className="w-[120px]">Status</TableHead>
                                                    <TableHead>Box ID</TableHead>
                                                    <TableHead>Waybill #</TableHead>
                                                    <TableHead>Receiver</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.boxes.map(box => (
                                                    <TableRow 
                                                        key={box.boxId} 
                                                        data-state={scannedBoxIds.includes(box.boxId) && "selected"}
                                                    >
                                                         <TableCell>
                                                            {scannedBoxIds.includes(box.boxId) ? (
                                                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                                                    <CheckCircle className="h-5 w-5" /> Loaded
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                    <Circle className="h-5 w-5" /> Pending
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-mono">{box.boxId}</TableCell>
                                                        <TableCell className="font-medium">{box.waybillNumber}</TableCell>
                                                        <TableCell>{box.receiverName}</TableCell>
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
                            <CardTitle>Scan to Load & Create Manifest</CardTitle>
                            <CardDescription>{scannedBoxIds.length} box(es) loaded.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="scan-box">Scan Box Barcode</Label>
                                <div className="flex gap-2">
                                <Input
                                    ref={scanInputRef}
                                    id="scan-box"
                                    placeholder="Scan barcode to load..."
                                    value={scanInputValue}
                                    onChange={(e) => setScanInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleVerifyClick();
                                        }
                                    }}
                                    className="font-mono text-lg h-12"
                                />
                                <Button onClick={handleVerifyClick} className="h-12">
                                    <ScanLine className="h-6 w-6" />
                                </Button>
                                </div>
                            </div>
                             {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Scan Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-4 pt-4 border-t">
                                <div>
                                    <Label>Dispatch Type</Label>
                                    <Tabs value={dispatchType} onValueChange={(v) => setDispatchType(v as DispatchType)} className="w-full mt-1">
                                      <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="delivery"><Truck className="mr-2 h-4 w-4"/>To Delivery</TabsTrigger>
                                        <TabsTrigger value="hub"><Cpu className="mr-2 h-4 w-4"/>To Hub</TabsTrigger>
                                      </TabsList>
                                    </Tabs>
                                </div>

                                {dispatchType === 'hub' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="vehicle-no">Vehicle No.</Label>
                                            <Select value={selectedVehicleId || ''} onValueChange={setSelectedVehicleId}>
                                                <SelectTrigger id="vehicle-no" className="mt-1">
                                                    <SelectValue placeholder="Select a vehicle" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicles.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>
                                                            {v.vehicleNumber} ({v.driverName})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div>
                                            <Label htmlFor="driver-name-hub">Driver Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <Input id="driver-name-hub" placeholder="Driver's name" value={driverName} disabled className="pl-10"/>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                     <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="vehicle-no-delivery">Vehicle No.</Label>
                                            <Input id="vehicle-no-delivery" placeholder="e.g., MH-12-AB-1234" value={manualVehicleNo} onChange={e => setManualVehicleNo(e.target.value)} />
                                        </div>
                                         <div>
                                            <Label htmlFor="driver-name-delivery">Driver Name</Label>
                                            <Input id="driver-name-delivery" placeholder="e.g., Suresh Kumar" value={driverName} onChange={e => setDriverName(e.target.value)} />
                                        </div>
                                         <div>
                                            <Label htmlFor="driver-contact-delivery">Driver Contact</Label>
                                            <Input id="driver-contact-delivery" placeholder="e.g., 9876543210" value={driverContact} onChange={e => setDriverContact(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <Label htmlFor="delivery-partner">Assign to {partnerTypeLabel}</Label>
                                    <Select value={destinationPartnerCode || ''} onValueChange={setDestinationPartnerCode}>
                                        <SelectTrigger id="delivery-partner" className="mt-1">
                                            <SelectValue placeholder={`Select a ${partnerTypeLabel.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partnerList.map(partner => (
                                                <SelectItem key={partner.username} value={partner.partnerCode!}>
                                                    {partner.username} ({partner.partnerCode})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleCreateDispatch} disabled={scannedBoxIds.length === 0}>
                                <Send className="mr-2 h-4 w-4" /> Create & Dispatch Manifest
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    );
}

    