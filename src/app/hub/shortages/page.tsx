
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Loader2, Package, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ShortagesPage() {
    const { manifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();
    const router = useRouter();

    const shortReceivedManifests = useMemo(() => {
        return manifests.filter(m => m.status === 'Short Received').map(manifest => {
            const manifestWaybills = manifest.waybillIds.map(id => allWaybills.find(wb => wb.id === id)).filter(Boolean);
            
            let totalBoxes = 0;
            const waybillDetails: { waybillNumber: string; partnerCode?: string; totalBoxes: number; }[] = [];
            
            manifestWaybills.forEach(wb => {
                totalBoxes += wb.numberOfBoxes;
                waybillDetails.push({ 
                    waybillNumber: wb.waybillNumber, 
                    partnerCode: wb.partnerCode,
                    totalBoxes: wb.numberOfBoxes
                });
            });

            const verifiedCount = manifest.verifiedBoxIds?.length || 0;
            const shortageCount = totalBoxes - verifiedCount;
            
            return {
                ...manifest,
                waybillDetails,
                totalBoxes,
                verifiedCount,
                shortageCount,
            };
        });
    }, [manifests, allWaybills]);

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
                <p className="text-muted-foreground">List of all manifests that were received with missing boxes.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Short Received Manifests</CardTitle>
                    <CardDescription>
                       Found {shortReceivedManifests.length} manifest(s) with shortages.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {shortReceivedManifests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Manifest ID</TableHead>
                                    <TableHead>Date Received</TableHead>
                                    <TableHead>Booking Partner(s)</TableHead>
                                    <TableHead>Waybill(s)</TableHead>
                                    <TableHead className="text-center">Expected</TableHead>
                                    <TableHead className="text-center">Received</TableHead>
                                    <TableHead className="text-center">Shortage</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shortReceivedManifests.map(manifest => (
                                    <TableRow key={manifest.id}>
                                        <TableCell className="font-mono">M-{manifest.id.substring(0,8)}</TableCell>
                                        <TableCell>{format(new Date(manifest.date), 'PP')}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {[...new Set(manifest.waybillDetails.map(d => d.partnerCode))].map(pc => (
                                                    <Badge key={pc} variant="outline">{pc}</Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                             {manifest.waybillDetails.map(d => d.waybillNumber).join(', ')}
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{manifest.totalBoxes}</TableCell>
                                        <TableCell className="text-center text-green-600 font-medium">{manifest.verifiedCount}</TableCell>
                                        <TableCell className="text-center text-destructive font-bold">{manifest.shortageCount}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => router.push(`/hub/scan/${manifest.id}`)}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View/Continue Verification</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Shortages Reported</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                All manifests have been fully verified so far.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
