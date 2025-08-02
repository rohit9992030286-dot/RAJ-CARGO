
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScanLine, AlertTriangle, ArrowRight, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useManifests } from '@/hooks/useManifests';

export default function HubDashboardPage() {
    const [manifestId, setManifestId] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const { getManifestById } = useManifests();

    const handleScan = () => {
        if (!manifestId.trim()) {
            toast({
                title: 'Manifest ID required',
                description: 'Please enter a manifest ID to start verification.',
                variant: 'destructive',
            });
            return;
        }

        const manifestExists = !!getManifestById(manifestId.trim());

        if (manifestExists) {
            router.push(`/hub/scan/${manifestId.trim()}`);
        } else {
            toast({
                title: 'Manifest Not Found',
                description: `No manifest with ID M-${manifestId.trim().substring(0,8)} found.`,
                variant: 'destructive',
            });
        }
    };

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
                        <CardDescription>Enter a Manifest ID to begin the verification process.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Manifest ID (e.g., ...)"
                                value={manifestId}
                                onChange={(e) => setManifestId(e.target.value)}
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
        </div>
    );
}
