
'use client';

import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Truck, Loader2, ScanLine, CheckCircle } from 'lucide-react';
import { Manifest } from '@/types/manifest';
import { format } from 'date-fns';
import { useMemo } from 'react';

export default function HubPage() {
  const router = useRouter();
  const { manifests, isLoaded: manifestsLoaded } = useManifests();
  const { waybills, isLoaded: waybillsLoaded } = useWaybills();
  
  const incomingManifests = useMemo(() => {
    // Hub users should only see manifests from booking partners that are dispatched to them, or already received by them.
    return manifests.filter(m => m.origin === 'booking' && (m.status === 'Dispatched' || m.status === 'Received'));
  }, [manifests]);

  const getManifestDetails = useMemo(() => {
    const waybillMap = new Map(waybills.map(w => [w.id, w]));

    return (manifest: Manifest) => {
        const manifestWaybills = manifest.waybillIds.map(id => waybillMap.get(id)).filter(w => w);
        const boxCount = manifestWaybills.reduce((total, wb) => total + (wb?.numberOfBoxes || 0), 0);
        
        const uniqueCities = [...new Set(manifestWaybills.map(wb => wb?.receiverCity).filter(Boolean))];
        const destinations = uniqueCities.join(', ') || 'N/A';
        
        return {
            waybillCount: manifestWaybills.length,
            boxCount,
            destinations,
        };
    };
  }, [waybills]);

  if (!manifestsLoaded || !waybillsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const handleVerifyManifest = (id: string) => {
    router.push(`/hub/scan/${id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hub Operations Dashboard</h1>
        <p className="text-muted-foreground">Manage and verify incoming manifests that have been dispatched.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Incoming Manifests</CardTitle>
          <CardDescription>
            There are {incomingManifests.filter(m => m.status === 'Dispatched').length} dispatched manifest(s) awaiting verification at the hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manifest ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Vehicle No.</TableHead>
                <TableHead className="text-center">Waybills</TableHead>
                <TableHead className="text-center">Boxes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomingManifests.length > 0 ? (
                incomingManifests.map((manifest) => {
                  const details = getManifestDetails(manifest);
                  return (
                    <TableRow key={manifest.id}>
                      <TableCell className="font-medium truncate" style={{maxWidth: '100px'}}>M-{manifest.id.substring(0, 8)}</TableCell>
                      <TableCell>{format(new Date(manifest.date), 'PPP')}</TableCell>
                      <TableCell><Badge variant="outline">{manifest.creatorPartnerCode || 'N/A'}</Badge></TableCell>
                      <TableCell>{manifest.vehicleNo || 'N/A'}</TableCell>
                      <TableCell className="text-center">{details.waybillCount}</TableCell>
                      <TableCell className="text-center">{details.boxCount}</TableCell>
                      <TableCell className="text-right">
                        {manifest.status === 'Received' ? (
                            <div className="flex items-center justify-end gap-2 text-green-600 font-semibold">
                                <CheckCircle className="h-5 w-5" />
                                <span>Verified</span>
                            </div>
                        ) : (
                           <Button variant="outline" size="sm" onClick={() => handleVerifyManifest(manifest.id)}>
                              <ScanLine className="mr-2 h-4 w-4" /> Verify Shipment
                           </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="text-center py-8">
                        <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Incoming Manifests</h3>
                        <p className="mt-1 text-sm text-muted-foreground">There are currently no manifests marked as 'Dispatched' from booking partners.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
