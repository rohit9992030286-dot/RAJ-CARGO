
'use client';

import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, Pencil, Trash2, Truck, Loader2 } from 'lucide-react';
import { Manifest } from '@/types/manifest';
import { format } from 'date-fns';
import { useMemo } from 'react';

export default function ManifestListPage() {
  const router = useRouter();
  const { manifests, deleteManifest, isLoaded: manifestsLoaded } = useManifests();
  const { waybills, getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  
  const handleCreateManifest = () => {
    router.push('/booking/manifest/create');
  };

  const handleViewManifest = (id: string) => {
    router.push(`/booking/manifest/${id}`);
  };

  const handleDelete = (id: string) => {
    // Implement confirmation dialog if needed
    deleteManifest(id);
  };
  
  const bookingManifests = useMemo(() => {
    return manifests.filter(m => m.origin === 'booking');
  }, [manifests]);

  if (!manifestsLoaded || !waybillsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

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


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Dispatch Manifests</h1>
          <p className="text-muted-foreground">Manage, create, and dispatch your manifests.</p>
        </div>
        <Button onClick={handleCreateManifest}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Manifest
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Manifests</CardTitle>
          <CardDescription>
            You have {bookingManifests.length} manifest(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manifest #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Destinations</TableHead>
                <TableHead>Vehicle No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Waybills</TableHead>
                <TableHead className="text-center">Boxes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingManifests.length > 0 ? (
                bookingManifests.map((manifest) => {
                  const details = getManifestDetails(manifest);
                  return (
                    <TableRow key={manifest.id}>
                      <TableCell className="font-medium">{manifest.manifestNo}</TableCell>
                      <TableCell>{format(new Date(manifest.date), 'PPP')}</TableCell>
                      <TableCell className="truncate" style={{maxWidth: '150px'}}>{details.destinations}</TableCell>
                      <TableCell>{manifest.vehicleNo || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={manifest.status === 'Dispatched' ? 'default' : 'outline'}>
                          {manifest.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{details.waybillCount}</TableCell>
                      <TableCell className="text-center">{details.boxCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewManifest(manifest.id)}>
                          {manifest.status === 'Draft' ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{manifest.status === 'Draft' ? 'Edit' : 'View'}</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(manifest.id)} disabled={manifest.status === 'Dispatched'}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="text-center py-8">
                        <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Manifests Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first manifest.</p>
                        <div className="mt-6">
                            <Button onClick={handleCreateManifest}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create First Manifest
                            </Button>
                        </div>
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
