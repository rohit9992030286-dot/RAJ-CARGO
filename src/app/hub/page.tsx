
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
            <div className="p-8 rounded-xl bg-card border relative overflow-hidden">
                <div className="absolute top-0 right-0 -z-0">
                    <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_3_2)">
                        <path d="M100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z" fill="url(#paint0_radial_3_2)"/>
                        <path d="M127.188 199.389C157.971 188.498 183.33 166.974 196.357 138.834C209.384 110.693 208.767 78.4111 194.675 50.418C180.583 22.4249 154.248 1.40509 123.465 -9.48622C92.6823 -20.3775 59.21 -19.9698 28.1475 -8.44855C-2.91497 3.07271 -30.0822 25.132 -48.2163 53.2721C-66.3504 81.4123 -74.4925 113.885 -71.2163 145.878C-67.9401 177.871 -53.472 207.411 -31.2581 229.076" fill="url(#paint1_linear_3_2)"/>
                        </g>
                        <defs>
                        <radialGradient id="paint0_radial_3_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100) rotate(90) scale(100)">
                        <stop stopColor="hsl(var(--primary) / 0.1)"/>
                        <stop offset="1" stopColor="hsl(var(--primary) / 0)"/>
                        </radialGradient>
                        <linearGradient id="paint1_linear_3_2" x1="82.4519" y1="185.038" x2="-23.7548" y2="-13.4357" gradientUnits="userSpaceOnUse">
                        <stop stopColor="hsl(var(--primary) / 0.05)"/>
                        <stop offset="1" stopColor="hsl(var(--primary) / 0)"/>
                        </linearGradient>
                        <clipPath id="clip0_3_2">
                        <rect width="200" height="200" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </div>
                <div className="relative">
                    <h1 className="text-4xl font-bold">Hub Dashboard</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Verify incoming shipments and manage outbound dispatch.</p>
                </div>
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
