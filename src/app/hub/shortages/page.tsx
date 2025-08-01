
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Eye, BadgeHelp } from 'lucide-react';
import { Manifest } from '@/types/manifest';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ShortagesPage() {
  const router = useRouter();
  const { manifests, isLoaded: manifestsLoaded } = useManifests();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  
  const shortManifests = useMemo(() => {
    return manifests.filter(m => m.status === 'Short Received');
  }, [manifests]);

  const getManifestDetails = (manifest: Manifest) => {
    const totalBoxes = manifest.waybillIds
      .map(id => getWaybillById(id))
      .reduce((acc, wb) => acc + (wb?.numberOfBoxes || 0), 0);
      
    const verifiedBoxes = manifest.verifiedBoxIds?.length || 0;

    return {
      totalBoxes,
      verifiedBoxes,
      shortage: totalBoxes - verifiedBoxes
    };
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
        <h1 className="text-3xl font-bold">Shortage Report</h1>
        <p className="text-muted-foreground">Review manifests that were received with missing boxes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Short Received Manifests</CardTitle>
          <CardDescription>
            Found {shortManifests.length} manifest(s) with shortages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manifest ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Origin Partner</TableHead>
                <TableHead>Vehicle No.</TableHead>
                <TableHead className="text-center">Expected</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="text-center">Shortage</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortManifests.length > 0 ? (
                shortManifests.map((manifest) => {
                  const details = getManifestDetails(manifest);
                  return (
                    <TableRow key={manifest.id}>
                      <TableCell className="font-medium">M-{manifest.id.substring(0, 8)}</TableCell>
                      <TableCell>{format(new Date(manifest.date), 'PP')}</TableCell>
                      <TableCell><Badge variant="outline">{manifest.creatorPartnerCode}</Badge></TableCell>
                      <TableCell>{manifest.vehicleNo}</TableCell>
                      <TableCell className="text-center">{details.totalBoxes}</TableCell>
                      <TableCell className="text-center">{details.verifiedBoxes}</TableCell>
                      <TableCell className="text-center text-destructive font-bold">{details.shortage}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/hub/scan/${manifest.id}`)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                     <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <BadgeHelp className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Shortages Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            All manifests have been fully accounted for.
                        </p>
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
