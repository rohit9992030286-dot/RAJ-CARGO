
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Box, CheckCircle, Loader2, ScanLine, XCircle } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function ScanManifestPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const manifestId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getManifestById, updateManifest, isLoaded: manifestsLoaded } = useManifests();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [scannedWaybills, setScannedWaybills] = useState<string[]>([]);
  
  useEffect(() => {
    if (manifestId && manifestsLoaded) {
      const existingManifest = getManifestById(manifestId);
      if (existingManifest) {
        setManifest(existingManifest);
      } else {
        toast({ title: "Manifest not found", variant: "destructive"});
        router.push('/hub');
      }
    }
  }, [manifestId, manifestsLoaded, getManifestById, router, toast]);

  const manifestWaybills = manifest?.waybillIds.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w) || [];
  
  const handleConfirmArrival = () => {
    if (manifest) {
      // In a real app, you might update the manifest status
      // to something like 'Arrived at Hub'.
      // For now, we just show a confirmation.
      toast({
        title: "Manifest Arrival Confirmed",
        description: `All ${manifestWaybills.length} waybills in manifest M-${manifest.id.substring(0,8)} have been marked as received.`,
      });
      router.push('/hub');
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
          <Button variant="outline" size="sm" onClick={() => router.push('/hub')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub Dashboard
          </Button>
          <h1 className="text-3xl font-bold mt-4">
            Verify Manifest M-{manifest.id.substring(0,8)}
          </h1>
          <p className="text-muted-foreground">
            Dispatched on {format(new Date(manifest.date), 'PPP')} with vehicle {manifest.vehicleNo || 'N/A'}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan & Verify</CardTitle>
          <CardDescription>
            This manifest contains {manifestWaybills.length} waybill(s) with a total of {totalBoxes} box(es). 
            (Scanning functionality coming soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="p-8 text-center border-2 border-dashed rounded-lg">
                <ScanLine className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Scanning Interface Placeholder</h3>
                <p className="mt-1 text-sm text-muted-foreground">A camera or input field will be added here to scan waybill barcodes.</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleConfirmArrival} size="lg">
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirm Full Shipment Arrival
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Expected Waybills in Manifest</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill #</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-center">Boxes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifestWaybills.map((waybill) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ScanManifestPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <ScanManifestPage />
        </Suspense>
    )
}
