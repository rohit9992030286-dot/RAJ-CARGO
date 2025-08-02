
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanLine, AlertTriangle, ArrowRight, Truck, History, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useManifests } from '@/hooks/useManifests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function HubDashboardPage() {
    const [manifestNo, setManifestNo] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const { getManifestByNumber, manifests, isLoaded } = useManifests();

    const handleScan = () => {
        const manifestNumber = manifestNo.trim();
        if (!manifestNumber) {
            toast({
                title: 'Manifest Number required',
                description: 'Please enter a manifest number to start verification.',
                variant: 'destructive',
            });
            return;
        }

        const manifest = getManifestByNumber(manifestNumber);

        if (manifest) {
            router.push(`/hub/scan/${manifest.id}`);
        } else {
            toast({
                title: 'Manifest Not Found',
                description: `No manifest with number ${manifestNumber} found.`,
                variant: 'destructive',
            });
        }
    };
    
    const verificationHistory = useMemo(() => {
        return manifests.filter(m => m.status === 'Received' || m.status === 'Short Received');
    }, [manifests]);
    
     if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Hub Dashboard</h1>
                <p className="text-muted-foreground">Verify incoming shipments and manage outbound dispatch.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <ScanLine className="h-6 w-6" />
                            <span>Scan to Verify Incoming Shipment</span>
                        </CardTitle>
                        <CardDescription>Enter a Manifest Number to begin the verification process.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Manifest Number (e.g., M-RC-1001)"
                                value={manifestNo}
                                onChange={(e) => setManifestNo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                className="font-mono"
                            />
                            <Button onClick={handleScan}>
                                Verify <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Truck className="h-6 w-6" />
                            <span>Outbound Dispatch</span>
                        </CardTitle>
                        <CardDescription>Create new manifests for shipments going out for delivery.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Consolidate received waybills into a new manifest for final delivery.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.push('/hub/dispatch')} className="w-full">
                           Go to Outbound Dispatch
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <History className="h-6 w-6" />
                        <span>Verification History</span>
                    </CardTitle>
                    <CardDescription>A log of all previously verified manifests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Manifest #</TableHead>
                                <TableHead>Date Verified</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Waybills</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {verificationHistory.length > 0 ? (
                                verificationHistory.map(manifest => (
                                    <TableRow key={manifest.id}>
                                        <TableCell className="font-mono">{manifest.manifestNo}</TableCell>
                                        <TableCell>{format(new Date(manifest.date), 'PP')}</TableCell>
                                        <TableCell>
                                            <Badge variant={manifest.status === 'Received' ? 'default' : 'destructive'}>
                                                {manifest.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{manifest.waybillIds.length}</TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="icon" onClick={() => router.push(`/hub/scan/${manifest.id}`)}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No manifests have been verified yet.
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
