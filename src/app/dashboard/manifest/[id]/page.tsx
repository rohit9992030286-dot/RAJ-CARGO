
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Printer, Truck, PlusCircle, AlertCircle, Trash2, Box, Save, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function EditManifestPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const manifestId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getManifestById, updateManifest, isLoaded: manifestsLoaded } = useManifests();
  const { waybills, updateWaybill, getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [waybillNumber, setWaybillNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (manifestId && manifestsLoaded) {
      const existingManifest = getManifestById(manifestId);
      if (existingManifest) {
        setManifest(existingManifest);
      } else {
        toast({ title: "Manifest not found", variant: "destructive"});
        router.push('/dashboard/manifest');
      }
    }
  }, [manifestId, manifestsLoaded, getManifestById, router, toast]);

  const manifestWaybills = manifest?.waybillIds.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w) || [];
  const isDispatched = manifest?.status === 'Dispatched';

  const handleAddWaybill = () => {
    setError(null);
    if (!waybillNumber) {
      setError('Please enter a waybill number.');
      return;
    }
    const waybill = waybills.find(w => w.waybillNumber === waybillNumber);
    if (!waybill) {
      setError('Waybill not found.');
      return;
    }
    if (waybill.status !== 'Pending') {
      setError(`Waybill #${waybill.waybillNumber} cannot be added as it is already ${waybill.status}.`);
      return;
    }
    if (manifest?.waybillIds.includes(waybill.id)) {
      setError(`Waybill #${waybill.waybillNumber} is already in the manifest.`);
      return;
    }
    
    if (manifest) {
      const updatedWaybills = [...manifest.waybillIds, waybill.id];
      setManifest({ ...manifest, waybillIds: updatedWaybills });
    }
    setWaybillNumber('');
  };

  const handleRemoveWaybill = (id: string) => {
     if (manifest) {
      const updatedWaybills = manifest.waybillIds.filter(wid => wid !== id);
      setManifest({ ...manifest, waybillIds: updatedWaybills });
    }
  };
  
  const handleSaveManifest = () => {
      if (manifest) {
          updateManifest(manifest);
      }
  };

  const handleDispatchManifest = () => {
    if (!manifest || manifest.waybillIds.length === 0) {
      toast({ title: "Manifest is empty", description: "Add waybills to the manifest before dispatching.", variant: "destructive" });
      return;
    }
    
    manifestWaybills.forEach(waybill => {
      updateWaybill({ ...waybill, status: 'In Transit' });
    });

    const dispatchedManifest = { ...manifest, status: 'Dispatched' as 'Dispatched' };
    updateManifest(dispatchedManifest);
    setManifest(dispatchedManifest); // Update local state to reflect change

    toast({ title: "Manifest Dispatched", description: `${manifestWaybills.length} waybills are now in transit.` });
  };

  const handlePrintManifest = () => {
     if (manifest && manifest.waybillIds.length > 0) {
      const url = `/print/manifest?id=${manifest.id}`;
      window.open(url, '_blank');
    }
  };

  const totalBoxes = manifestWaybills.reduce((sum, wb) => sum + wb.numberOfBoxes, 0);

  if (!manifestsLoaded || !waybillsLoaded || !manifest) {
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
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/manifest')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Manifests
          </Button>
          <h1 className="text-3xl font-bold mt-4">
            {isDispatched ? 'Viewing' : 'Editing'} Manifest M-{manifest.id.substring(0,8)}
          </h1>
          <p className="text-muted-foreground">
            Created on {format(new Date(manifest.date), 'PPP')}
          </p>
        </div>
      </div>
      
      {!isDispatched && (
        <Card>
          <CardHeader>
            <CardTitle>Add Waybill to Manifest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="waybill-number"
                placeholder="Enter Waybill Number (e.g., SW-123456)"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWaybill()}
                className="flex-grow"
              />
              <Button onClick={handleAddWaybill}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add to Manifest
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Manifest</CardTitle>
          <CardDescription>
            {manifestWaybills.length} waybill(s) added, totalling {totalBoxes} box(es).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
              <Label htmlFor="vehicle-no">Vehicle No.</Label>
              <Input
                id="vehicle-no"
                placeholder="e.g., MH-12-AB-1234"
                value={manifest.vehicleNo || ''}
                onChange={(e) => setManifest({...manifest, vehicleNo: e.target.value})}
                disabled={isDispatched}
              />
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill #</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Receiver City</TableHead>
                <TableHead className="text-center">Boxes</TableHead>
                {!isDispatched && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifestWaybills.length > 0 ? (
                manifestWaybills.map((waybill: Waybill) => (
                  <TableRow key={waybill.id}>
                    <TableCell className="font-medium">{waybill.waybillNumber}</TableCell>
                    <TableCell>{waybill.receiverName}</TableCell>
                    <TableCell>{waybill.receiverCity}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                         <Box className="h-4 w-4 text-muted-foreground" />
                         {waybill.numberOfBoxes}
                      </div>
                    </TableCell>
                    {!isDispatched && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveWaybill(waybill.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isDispatched ? 4 : 5} className="h-24 text-center">
                    No waybills added to the manifest yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
             <Button onClick={handlePrintManifest} variant="outline" disabled={manifestWaybills.length === 0}>
                <Printer className="mr-2 h-4 w-4" /> Print Manifest
              </Button>
             {!isDispatched && (
                <>
                <Button onClick={handleSaveManifest} variant="secondary">
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button onClick={handleDispatchManifest} disabled={manifestWaybills.length === 0}>
                    <Send className="mr-2 h-4 w-4" /> Dispatch Manifest
                </Button>
                </>
             )}
        </CardFooter>
      </Card>
    </div>
  );
}
