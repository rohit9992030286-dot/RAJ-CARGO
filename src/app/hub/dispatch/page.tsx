
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Package, Truck, PlusCircle, Building } from 'lucide-react';
import { Waybill } from '@/types/waybill';

export default function HubDispatchPage() {
  const router = useRouter();
  const { manifests, addManifest, isLoaded: manifestsLoaded } = useManifests();
  const { waybills, getWaybillById, updateWaybill, isLoaded: waybillsLoaded } = useWaybills();
  
  const waybillsReadyForDispatch = useMemo(() => {
    // 1. Get IDs of all waybills that are in 'Dispatched' manifests, which means they are in transit to a new destination
    const dispatchedWaybillIds = new Set(
        manifests.filter(m => m.status === 'Dispatched').flatMap(m => m.waybillIds)
    );

    // 2. Get all waybills from manifests that have been 'Received'
    const receivedManifestWaybillIds = manifests
      .filter(m => m.status === 'Received')
      .flatMap(m => m.waybillIds);
      
    // 3. Filter for waybills that have been received but are NOT yet in a new dispatched manifest
    return receivedManifestWaybillIds
      .map(id => getWaybillById(id))
      .filter((w): w is Waybill => !!w && !dispatchedWaybillIds.has(w.id));
  }, [manifests, getWaybillById]);
  
  const waybillsByCity = useMemo(() => {
    return waybillsReadyForDispatch.reduce((acc, waybill) => {
        const city = waybill.receiverCity;
        if (!acc[city]) {
            acc[city] = [];
        }
        acc[city].push(waybill);
        return acc;
    }, {} as Record<string, Waybill[]>);
  }, [waybillsReadyForDispatch]);


  const handleCreateManifest = (city: string, waybillsForCity: Waybill[]) => {
    const newManifestId = addManifest({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        waybillIds: waybillsForCity.map(w => w.id),
        status: 'Draft',
        vehicleNo: '',
        origin: 'hub',
    });

    // Mark these waybills as 'Pending' for the new manifest
    waybillsForCity.forEach(wb => {
        updateWaybill({ ...wb, status: 'Pending' });
    });

    router.push(`/booking/manifest/${newManifestId}`);
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
        <p className="text-muted-foreground">Group verified waybills and dispatch them to their next destination.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Waybills Ready for Dispatch</CardTitle>
          <CardDescription>
            {waybillsReadyForDispatch.length} waybill(s) have been received at the hub and are waiting to be sorted into new manifests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(waybillsByCity).length > 0 ? (
             <Accordion type="single" collapsible className="w-full">
                {Object.entries(waybillsByCity).map(([city, cityWaybills]) => (
                    <AccordionItem value={city} key={city}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-4">
                                <Building className="h-5 w-5 text-primary"/>
                                <span className="text-lg font-semibold">{city}</span>
                                <span className="text-sm text-muted-foreground">({cityWaybills.length} waybills)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="p-4 bg-muted/50 rounded-lg">
                             <div className="flex justify-end mb-4">
                               <Button size="sm" onClick={() => handleCreateManifest(city, cityWaybills)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Manifest for {city}
                               </Button>
                             </div>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waybill #</TableHead>
                                        <TableHead>Receiver</TableHead>
                                        <TableHead>Pincode</TableHead>
                                        <TableHead className="text-center">Boxes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cityWaybills.map(wb => (
                                        <TableRow key={wb.id}>
                                            <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                                            <TableCell>{wb.receiverName}</TableCell>
                                            <TableCell>{wb.receiverPincode}</TableCell>
                                            <TableCell className="text-center">{wb.numberOfBoxes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
             </Accordion>
          ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Waybills to Dispatch</h3>
                <p className="mt-1 text-sm text-muted-foreground">First, verify an incoming manifest from the Hub Dashboard.</p>
                 <div className="mt-6">
                    <Button onClick={() => router.push('/hub')}>
                        <Truck className="mr-2 h-4 w-4" />
                        Go to Hub Dashboard
                    </Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
