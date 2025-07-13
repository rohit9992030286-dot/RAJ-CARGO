
'use client';

import { useState } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Printer, Truck, Search, PlusCircle, AlertCircle, Trash2, Box } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ManifestPage() {
  const { waybills, updateWaybill, isLoaded } = useWaybills();
  const { toast } = useToast();
  const [waybillNumber, setWaybillNumber] = useState('');
  const [manifestWaybills, setManifestWaybills] = useState<Waybill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [vehicleNo, setVehicleNo] = useState('');

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
    if (manifestWaybills.some(w => w.id === waybill.id)) {
      setError(`Waybill #${waybill.waybillNumber} is already in the manifest.`);
      return;
    }
    setManifestWaybills(prev => [...prev, waybill]);
    setWaybillNumber('');
  };

  const handleRemoveWaybill = (id: string) => {
    setManifestWaybills(prev => prev.filter(w => w.id !== id));
  };
  
  const handleDispatchManifest = () => {
    if (manifestWaybills.length === 0) {
      toast({ title: "Manifest is empty", description: "Add waybills to the manifest before dispatching.", variant: "destructive" });
      return;
    }
    
    manifestWaybills.forEach(waybill => {
      updateWaybill({ ...waybill, status: 'In Transit' });
    });

    toast({ title: "Manifest Dispatched", description: `${manifestWaybills.length} waybills are now in transit.` });
    setManifestWaybills([]);
    setVehicleNo('');
  };

  const handlePrintManifest = () => {
     if (manifestWaybills.length > 0) {
      const ids = manifestWaybills.map(w => w.id).join(',');
      const date = new Date().toISOString().split('T')[0];
      const url = `/print/manifest?date=${date}&ids=${ids}&vehicleNo=${encodeURIComponent(vehicleNo)}`;
      window.open(url, '_blank');
    }
  };

  const totalBoxes = manifestWaybills.reduce((sum, wb) => sum + wb.numberOfBoxes, 0);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Build Dispatch Manifest</h1>
          <p className="text-muted-foreground">Add waybills to create and dispatch a new manifest.</p>
        </div>
      </div>
      
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
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
              />
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill #</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Receiver City</TableHead>
                <TableHead className="text-center">Boxes</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleRemoveWaybill(waybill.id)}>
                         <Trash2 className="h-4 w-4 text-destructive" />
                         <span className="sr-only">Remove</span>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
             <Button onClick={handleDispatchManifest} disabled={manifestWaybills.length === 0}>
                <Truck className="mr-2 h-4 w-4" /> Dispatch Manifest
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
