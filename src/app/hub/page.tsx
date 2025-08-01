
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Truck, Loader2, ScanLine, CheckCircle, ArrowRight } from 'lucide-react';
import { Manifest } from '@/types/manifest';
import { format } from 'date-fns';
import { useMemo } from 'react';

export default function HubPage() {
  const router = useRouter();
  const { manifests, isLoaded: manifestsLoaded } = useManifests();
  const { waybills, isLoaded: waybillsLoaded } = useWaybills();
  
  const getManifestDetails = (manifest: Manifest) => {
    const manifestWaybills = manifest.waybillIds.map(id => waybills.find(w => w.id === id)).filter(w => w);
    const boxCount = manifestWaybills.reduce((total, wb) => total + (wb?.numberOfBoxes || 0), 0);
    
    const uniqueCities = [...new Set(manifestWaybills.map(wb => wb?.receiverCity).filter(Boolean))];
    const destinations = uniqueCities.join(', ') || 'N/A';
    
    return {
        waybillCount: manifestWaybills.length,
        boxCount,
        destinations,
    };
  };

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

  const incomingManifests = manifests.filter(m => m.origin === 'booking');
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hub Operations Dashboard</h1>
        <p className="text-muted-foreground">Manage incoming verifications and outbound dispatches.</p>
      </div>

       <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-6 w-6 text-primary" />
              <span>Incoming Verification</span>
            </CardTitle>
            <CardDescription>Verify manifests that have arrived at the hub.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Scan waybills from incoming trucks to confirm receipt of all packages.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button className="w-full" onClick={() => document.getElementById('incoming-manifests')?.focus()}>
              View Incoming Manifests
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span>Outbound Dispatch</span>
            </CardTitle>
            <CardDescription>Create new manifests for the next destination.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Group verified waybills and dispatch them to the next hub or delivery center.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/hub/dispatch" className="w-full">
              <Button className="w-full">
                Go to Dispatch <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <Card id="incoming-manifests" tabIndex={-1} className="focus:ring-2 focus:ring-primary focus:outline-none">
        <CardHeader>
          <CardTitle>Incoming Manifests for Verification</CardTitle>
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
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-4 text-lg font-semibold">All Verifications Complete</h3>
                        <p className="mt-1 text-sm text-muted-foreground">You are all caught up! There are no incoming manifests that require your attention.</p>
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
