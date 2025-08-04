
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, History, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OutboundHistoryPage() {
    const { allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { isLoaded: waybillsLoaded } = useWaybills();

    const outboundHistory = useMemo(() => {
        if (!manifestsLoaded) return [];
        return allManifests.filter(m => m.origin === 'hub');
    }, [allManifests, manifestsLoaded]);
    
    const handlePrintManifest = (manifestId: string) => {
        window.open(`/print/manifest?id=${manifestId}`, '_blank');
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
                <h1 className="text-3xl font-bold">Outbound Manifest History</h1>
                <p className="text-muted-foreground">A record of all manifests dispatched from the hub.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dispatch History</CardTitle>
                    <CardDescription>
                       Found {outboundHistory.length} outbound manifest(s).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {outboundHistory.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Manifest #</TableHead>
                                    <TableHead>Dispatch Date</TableHead>
                                    <TableHead>Delivery Partner</TableHead>
                                    <TableHead>Vehicle No</TableHead>
                                    <TableHead>Waybills</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {outboundHistory.map(manifest => (
                                    <TableRow key={manifest.id}>
                                        <TableCell className="font-mono">{manifest.manifestNo}</TableCell>
                                        <TableCell>{format(new Date(manifest.date), 'PP')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{manifest.deliveryPartnerName} ({manifest.deliveryPartnerCode})</Badge>
                                        </TableCell>
                                        <TableCell>{manifest.vehicleNo}</TableCell>
                                        <TableCell>{manifest.waybillIds.length}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handlePrintManifest(manifest.id)}>
                                                <Printer className="mr-2 h-4 w-4" /> Print Manifest
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <History className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Outbound History</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                No manifests have been dispatched from the hub yet.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
