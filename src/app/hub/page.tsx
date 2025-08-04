
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanLine, AlertTriangle, ArrowRight, Truck, History, Eye, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useManifests } from '@/hooks/useManifests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useWaybills } from '@/hooks/useWaybills';

export default function HubDashboardPage() {
    const [manifestNo, setManifestNo] = useState('');
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const { getManifestByNumber, manifests, isLoaded } = useManifests();
    const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();

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
        let history = manifests.filter(m => m.status === 'Received' || m.status === 'Short Received')
            .map(manifest => {
                const totalBoxes = manifest.waybillIds.reduce((acc, id) => {
                    const wb = getWaybillById(id);
                    return acc + (wb?.numberOfBoxes || 0);
                }, 0);
                const verifiedCount = manifest.verifiedBoxIds?.length || 0;
                return {
                    ...manifest,
                    totalBoxes,
                    verifiedCount,
                    shortageCount: totalBoxes - verifiedCount
                };
            });
        
        if (historySearchTerm) {
            history = history.filter(m => m.manifestNo.toLowerCase().includes(historySearchTerm.toLowerCase()));
        }

        return history;

    }, [manifests, getWaybillById, historySearchTerm]);
    
     if (!isLoaded || !waybillsLoaded) {
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
                    <div className="flex justify-between items-center">
                         <div>
                            <CardTitle className="flex items-center gap-3">
                                <History className="h-6 w-6" />
                                <span>Verification History</span>
                            </CardTitle>
                            <CardDescription>A log of all previously verified manifests.</CardDescription>
                         </div>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                type="search"
                                placeholder="Search by Manifest No..."
                                value={historySearchTerm}
                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                className="pl-10 font-mono"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Manifest #</TableHead>
                                <TableHead>Dispatch Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Expected</TableHead>
                                <TableHead className="text-center">Received</TableHead>
                                <TableHead className="text-center">Shortage</TableHead>
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
                                        <TableCell className="text-center font-medium">{manifest.totalBoxes}</TableCell>
                                        <TableCell className="text-center text-green-600 font-medium">{manifest.verifiedCount}</TableCell>
                                        <TableCell className="text-center text-destructive font-bold">{manifest.shortageCount > 0 ? manifest.shortageCount : '-'}</TableCell>
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
                                    <TableCell colSpan={7} className="text-center h-24">
                                         {historySearchTerm ? 'No manifests match your search.' : 'No manifests have been verified yet.'}
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
