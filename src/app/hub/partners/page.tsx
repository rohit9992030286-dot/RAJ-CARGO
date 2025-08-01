'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Box, CheckCircle, Loader2, ScanLine, XCircle, AlertCircle, Circle, ArrowRight } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

function ScanManifestPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const manifestId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getManifestById, updateManifest, isLoaded: manifestsLoaded } = useManifests();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [scannedWaybillNumbers, setScannedWaybillNumbers] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (manifestId && manifestsLoaded) {
      const existingManifest = getManifestById(manifestId);
      if (existingManifest) {
        setManifest(existingManifest);
      } else {
        toast({ title: "Manifest not found", variant: "destructive"});
        router.push('/hub');
      }
    }
  }, [manifestId, manifestsLoaded, getManifestById, router, toast]);

  const manifestWaybills = useMemo(() => 
    manifest?.waybillIds.map(id => getWaybillById(id)).filter((w): w is Waybill => !!w) || [],
  [manifest, getWaybillById]);

  const handleVerifyWaybill = () => {
      setError(null);
      if (!inputValue.trim()) {
          setError("Please enter a waybill number to verify.");
          return;
      }
      
      const waybillExistsInManifest = manifestWaybills.some(wb => wb.waybillNumber === inputValue.trim());

      if (waybillExistsInManifest) {
          setScannedWaybillNumbers(prev => new Set(prev).add(inputValue.trim()));
          setInputValue('');
          toast({ title: "Verified", description: `Waybill #${inputValue.trim()} confirmed.`});
      } else {
          setError(`Waybill #${inputValue.trim()} is not part of this manifest.`);
      }
      scanInputRef.current?.focus();
  };

  const handleConfirmArrival = () => {
    if (manifest) {
      updateManifest({ ...manifest, status: 'Received' });
      toast({
        title: "Manifest Arrival Confirmed",
        description: `All ${manifestWaybills.length} waybills in manifest M-${manifest.id.substring(0,8)} have been marked as received.`,
      });
      router.push('/hub');
    }
  };

  const totalBoxes = manifestWaybills.reduce((sum, wb) => sum + wb.numberOfBoxes, 0);
  const totalWaybills = manifestWaybills.length;
  const verifiedCount = scannedWaybillNumbers.size;
  const verificationProgress = totalWaybills > 0 ? (verifiedCount / totalWaybills) * 100 : 0;
  const allVerified = totalWaybills > 0 && totalWaybills === verifiedCount;

  if (!waybillsLoaded || !manifestsLoaded || !manifest) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <Button variant="outline" size="sm" onClick={() => router.push('/hub')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub Dashboard
          </Button>
          <h1 className="text-3xl font-bold mt-4">
            Verify Manifest M-{manifest.id.substring(0,8)}
          </h1>
          <p className="text-muted-foreground">
            Dispatched on {format(new Date(manifest.date), 'PPP')} with vehicle {manifest.vehicleNo || 'N/A'}.
          </p>
        </div>
        {allVerified && (
             <Button onClick={handleConfirmArrival} size="lg">
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirm Full Shipment Arrival
            </Button>
        )}
      </div>

     <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Scan & Verify</CardTitle>
                    <CardDescription>Enter waybill number to confirm arrival.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            ref={scanInputRef}
                            placeholder="Scan or enter number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyWaybill(); }}
                            disabled={allVerified}
                            autoFocus
                        />
                        <Button onClick={handleVerifyWaybill} disabled={allVerified}>
                            <ScanLine className="mr-2 h-4 w-4" /> Verify
                        </Button>
                    </div>
                    {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Verification Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Verification Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <div className="flex justify-between mb-1 text-sm font-medium">
                            <span>Waybills Verified</span>
                            <span>{verifiedCount} of {totalWaybills}</span>
                        </div>
                        <Progress value={verificationProgress} />
                    </div>

                    {allVerified && (
                         <Alert variant="default" className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">All Verified!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                You can now confirm the full shipment arrival.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={() => router.push('/hub/dispatch')}
                    >
                        Go to Outbound Dispatch <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                 </CardFooter>
            </Card>
        </div>
        
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Expected Waybills in Manifest</CardTitle>
            <CardDescription>Total of {totalBoxes} box(es).</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Waybill #</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-center">Boxes</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {manifestWaybills.map((waybill) => {
                    const isVerified = scannedWaybillNumbers.has(waybill.waybillNumber);
                    return (
                        <TableRow key={waybill.id} className={cn(isVerified && 'bg-green-50/50 dark:bg-green-900/20')}>
                            <TableCell>
                                {isVerified ? (
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <CheckCircle className="h-5 w-5" /> Verified
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Circle className="h-5 w-5" /> Pending
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{waybill.waybillNumber}</TableCell>
                            <TableCell>{waybill.receiverName}</TableCell>
                            <TableCell>{waybill.receiverCity}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Box className="h-4 w-4 text-muted-foreground" />
                                    {waybill.numberOfBoxes}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
     </div>
    </div>
  );
}


export default function ScanManifestPageWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <ScanManifestPage />
        </Suspense>
    )
}