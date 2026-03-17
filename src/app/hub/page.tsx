'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanLine, AlertTriangle, ArrowRight, Truck, History, Eye, Loader2, Search, Clock, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useManifests } from '@/hooks/useManifests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isBefore, differenceInHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useWaybills } from '@/hooks/useWaybills';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { cn } from '@/lib/utils';

export default function HubDashboardPage() {
    const [manifestNo, setManifestNo] = useState('');
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();
    const { manifests, allManifests, isLoaded } = useManifests();
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

        const manifest = allManifests.find(m => m.manifestNo === manifestNumber);

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

    const getEWayBillStatus = (waybillIds: string[]) => {
        const statuses = waybillIds.map(id => {
            const wb = getWaybillById(id);
            if (!wb || !wb.eWayBillExpiryDate) return 'none';
            const expiry = new Date(wb.eWayBillExpiryDate);
            const now = new Date();
            if (isBefore(expiry, now)) return 'expired';
            if (differenceInHours(expiry, now) <= 48) return 'soon';
            return 'valid';
        });

        if (statuses.includes('expired')) return { label: 'Expired', color: 'bg-destructive text-destructive-foreground', icon: AlertCircle };
        if (statuses.includes('soon')) return { label: 'Expiring Soon', color: 'bg-amber-500 text-white', icon: Clock };
        if (statuses.every(s => s === 'none')) return { label: 'N/A', color: 'bg-muted text-muted-foreground', icon: Package };
        return { label: 'Valid', color: 'bg-green-500 text-white', icon: CheckCircle };
    };
    
    const incomingManifests = useMemo(() => {
        if (!user || !associationsLoaded) return [];
        return allManifests.filter(m => {
            if (m.status !== 'Dispatched') return false;
            if (m.origin === 'booking') {
                return associations.bookingToHub[m.creatorPartnerCode] === user.partnerCode;
            }
            if (m.origin === 'hub') {
                return m.destinationHubCode === user.partnerCode;
            }
            return false;
        });
    }, [allManifests, user, associations, associationsLoaded]);

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
    
     if (!isLoaded || !waybillsLoaded || !associationsLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight">Hub Operations</h1>
                    <p className="text-blue-100 mt-2 text-lg opacity-90">Central control for manifest verification and logistics.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 opacity-70">Current Hub</p>
                        <p className="text-xl font-bold mt-1 flex items-center gap-2">
                            <Truck className="h-5 w-5" /> {user?.partnerCode}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 opacity-70">Pending Arrival</p>
                        <p className="text-xl font-bold mt-1 flex items-center gap-2">
                            <Package className="h-5 w-5" /> {incomingManifests.length} Manifests
                        </p>
                    </div>
                </div>
                <div className="absolute right-[-5%] top-[-20%] opacity-10 pointer-events-none">
                    <ScanLine size={300} />
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 shadow-md border-none bg-white dark:bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <ScanLine className="h-6 w-6" />
                            </div>
                            <span>Direct Scan Entry</span>
                        </CardTitle>
                        <CardDescription>Enter a Manifest Number to start verifying contents immediately.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <Input
                                placeholder="Enter Manifest Number..."
                                value={manifestNo}
                                onChange={(e) => setManifestNo(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                className="font-mono text-lg h-12 border-2 focus:border-primary transition-all"
                            />
                            <Button onClick={handleScan} size="lg" className="w-full shadow-lg shadow-primary/20">
                                Start Verification <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-md border-none bg-white dark:bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-amber-600">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600">
                                <Truck className="h-6 w-6" />
                            </div>
                            <span>Incoming Shipments & E-Way Bills</span>
                        </CardTitle>
                        <CardDescription>Monitor manifests in transit to this hub and manage E-Way bill expiries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {incomingManifests.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Manifest #</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>E-Way Bill Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incomingManifests.map(manifest => {
                                        const ewayStatus = getEWayBillStatus(manifest.waybillIds);
                                        const StatusIcon = ewayStatus.icon;
                                        return (
                                            <TableRow key={manifest.id} className="group hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-mono font-bold text-blue-600">{manifest.manifestNo}</TableCell>
                                                <TableCell className="font-medium">{manifest.creatorPartnerCode}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("flex items-center gap-1.5 px-3 py-1", ewayStatus.color)}>
                                                        <StatusIcon className="h-3.5 w-3.5" />
                                                        {ewayStatus.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => router.push(`/hub/scan/${manifest.id}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Verify <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                                <div className="flex justify-center mb-4">
                                    <Package className="h-12 w-12 text-muted-foreground opacity-20" />
                                </div>
                                <p className="text-muted-foreground font-medium">No pending incoming shipments.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Card className="shadow-md border-none bg-white dark:bg-card">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div>
                            <CardTitle className="flex items-center gap-3 text-indigo-600">
                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600">
                                    <History className="h-6 w-6" />
                                </div>
                                <span>Recently Verified Manifests</span>
                            </CardTitle>
                            <CardDescription>Track records of previously received shipments and reported shortages.</CardDescription>
                         </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="search"
                                placeholder="Search manifests..."
                                value={historySearchTerm}
                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                className="pl-10 h-10 border-muted"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-bold">Manifest #</TableHead>
                                <TableHead className="font-bold">Received Date</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="text-center font-bold">Boxes</TableHead>
                                <TableHead className="text-center font-bold text-destructive">Shortage</TableHead>
                                <TableHead className="text-right font-bold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {verificationHistory.length > 0 ? (
                                verificationHistory.map(manifest => (
                                    <TableRow key={manifest.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="font-mono font-medium">{manifest.manifestNo}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {manifest.verifiedDate ? format(new Date(manifest.verifiedDate), 'PPp') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={manifest.status === 'Received' ? 'default' : 'destructive'} className="rounded-md font-bold uppercase tracking-wider text-[10px]">
                                                {manifest.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 font-semibold">
                                                <span className="text-green-600">{manifest.verifiedCount}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span>{manifest.totalBoxes}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {manifest.shortageCount > 0 ? (
                                                <Badge variant="destructive" className="font-bold">{manifest.shortageCount}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground opacity-30">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="outline" size="sm" onClick={() => router.push(`/hub/scan/${manifest.id}`)}>
                                                <Eye className="h-4 w-4 mr-2" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-32">
                                         <div className="flex flex-col items-center justify-center opacity-40">
                                            <History size={48} className="mb-2" />
                                            <p>{historySearchTerm ? 'No manifests match your search.' : 'No manifests have been verified yet.'}</p>
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
