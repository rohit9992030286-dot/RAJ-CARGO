
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Package, Truck, PlusCircle, Building } from 'lucide-react';
import { Waybill } from '@/types/waybill';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';


export default function HubDispatchPage() {
  const router = useRouter();
  const { manifests, addManifest, isLoaded: manifestsLoaded } = useManifests();
  const { waybills, getWaybillById, updateWaybill, isLoaded: waybillsLoaded } = useWaybills();
  const [selectedWaybillIds, setSelectedWaybillIds] = useState<string[]>([]);
  const [vehicleNo, setVehicleNo] = useState('');
  const { toast } = useToast();
  
  const waybillsReadyForDispatch = useMemo(() => {
    // Get IDs of all waybills that are already in a newly created 'hub' manifest or a dispatched one.
    const dispatchedWaybillIds = new Set(
        manifests.filter(m => m.origin === 'hub').flatMap(m => m.waybillIds)
    );

    // Get all waybills from manifests that have been 'Received' at the hub.
    const receivedManifestWaybillIds = manifests
      .filter(m => m.status === 'Received')
      .flatMap(m => m.waybillIds);
      
    // Filter for waybills that have been received but are NOT yet in a new dispatched hub manifest.
    return receivedManifestWaybillIds
      .map(id => getWaybillById(id))
      .filter((w): w is Waybill => !!w && !dispatchedWaybillIds.has(w.id));
  }, [manifests, getWaybillById]);
  
  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedWaybillIds(prev => {
        if (isSelected) {
            return [...prev, id];
        } else {
            return prev.filter(selectedId => selectedId !== id);
        }
    });
  };
  
  const handleSelectAll = (select: boolean) => {
      if (select) {
          setSelectedWaybillIds(waybillsReadyForDispatch.map(w => w.id));
      } else {
          setSelectedWaybillIds([]);
      }
  };


  const handleCreateManifest = () => {
    if (selectedWaybillIds.length === 0) return;
    if (!vehicleNo.trim()) {
        toast({ title: 'Vehicle Number Required', description: 'Please enter a vehicle number to create the manifest.', variant: 'destructive' });
        return;
    }
    
    const selectedWaybills = selectedWaybillIds.map(id => getWaybillById(id)).filter(w => w) as Waybill[];

    const newManifestId = addManifest({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        waybillIds: selectedWaybills.map(w => w.id),
        status: 'Draft',
        vehicleNo: vehicleNo.trim(),
        origin: 'hub',
    });

    // Mark these waybills as 'Pending' for the new manifest
    selectedWaybills.forEach(wb => {
        updateWaybill({ ...wb, status: 'Pending' });
    });
    
    // Reset selection and vehicle number
    setSelectedWaybillIds([]);
    setVehicleNo('');

    router.push(`/booking/manifest/${newManifestId}`);
  };


  if (!manifestsLoaded || !waybillsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const allSelected = waybillsReadyForDispatch.length > 0 && selectedWaybillIds.length === waybillsReadyForDispatch.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Outbound Dispatch</h1>
        <p className="text-muted-foreground">Select waybills to create a new outbound manifest for the next destination.</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <div>
              <CardTitle>Waybills Ready for Dispatch</CardTitle>
              <CardDescription>
                {waybillsReadyForDispatch.length} waybill(s) are waiting to be dispatched.
              </CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{selectedWaybillIds.length} of {waybillsReadyForDispatch.length} selected</span>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={selectedWaybillIds.length === 0}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Create Manifest
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Create New Outbound Manifest</AlertDialogTitle>
                            <AlertDialogDescription>
                                Enter the vehicle number for this manifest. This cannot be changed later.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                           <Label htmlFor="vehicle-no-dialog">Vehicle Number</Label>
                           <Input 
                             id="vehicle-no-dialog"
                             value={vehicleNo}
                             onChange={(e) => setVehicleNo(e.target.value)}
                             placeholder="e.g., MH-12-AB-1234"
                           />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setVehicleNo('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCreateManifest}>
                                Create Manifest
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {waybillsReadyForDispatch.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Waybill #</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Destination City</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead className="text-center">Boxes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waybillsReadyForDispatch.map((wb) => (
                  <TableRow key={wb.id} data-state={selectedWaybillIds.includes(wb.id) && "selected"}>
                     <TableCell>
                        <Checkbox
                            checked={selectedWaybillIds.includes(wb.id)}
                            onCheckedChange={(checked) => handleSelectionChange(wb.id, !!checked)}
                            aria-label={`Select waybill ${wb.waybillNumber}`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{wb.waybillNumber}</TableCell>
                    <TableCell>{wb.receiverName}</TableCell>
                    <TableCell>{wb.receiverCity}</TableCell>
                    <TableCell>{wb.receiverPincode}</TableCell>
                    <TableCell className="text-center">{wb.numberOfBoxes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
