
'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Box, CheckCircle, Loader2, ScanLine, XCircle, AlertCircle, Circle, ArrowRight, Save, Pallet } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { sortIntoPallets } from '@/ai/flows/pallet-sorter';

interface ExpectedBox {
    waybillId: string;
    waybillNumber: string;
    boxNumber: number;
    totalBoxes: number;
    boxId: string;
    destination: string;
}

interface LastScanResult {
    boxId: string;
    pallet: number;
}

function ScanManifestPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const manifestId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getManifestById, updateManifest, isLoaded: manifestsLoaded } = useManifests();
  const { getWaybillById, isLoaded: waybillsLoaded } = useWaybills();
  
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [scannedBoxIds, setScannedBoxIds] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [palletAssignments, setPalletAssignments] = useState<Record<string, number>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<LastScanResult | null>(null);


  useEffect(() => {
    if (manifestId && manifestsLoaded) {
      const existingManifest = getManifestById(manifestId);
      if (existingManifest) {
        setManifest(existingManifest);
        if (existingManifest.verifiedBoxIds) {
            setScannedBoxIds(new Set(existingManifest.verifiedBoxIds));
        }
      } else {
        toast({ title: "Manifest not found", variant: "destructive"});
        router.push('/hub');
      }
    }
  }, [manifestId, manifestsLoaded, getManifestById, router, toast]);

  const expectedBoxes = useMemo((): ExpectedBox[] => {
    if (!manifest) return [];
    
    return manifest.waybillIds.flatMap(wbId => {
        const waybill = getWaybillById(wbId);
        if (!waybill) return [];

        return Array.from({ length: waybill.numberOfBoxes }, (_, i) => {
            const boxNumber = i + 1;
            return {
                waybillId: waybill.id,
                waybillNumber: waybill.waybillNumber,
                boxNumber,
                totalBoxes: waybill.numberOfBoxes,
                boxId: `${waybill.waybillNumber}-${boxNumber}`,
                destination: waybill.receiverCity
            };
        });
    });
  },[manifest, getWaybillById]);
  
  useEffect(() => {
    if (expectedBoxes.length > 0) {
        const uniqueCities = [...new Set(expectedBoxes.map(b => b.destination))];
        const palletNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
        setIsAiLoading(true);
        sortIntoPallets({ cities: uniqueCities, palletNumbers })
            .then(result => {
                setPalletAssignments(result.assignments);
            })
            .catch(err => {
                console.error("AI Pallet Sorter Error:", err);
                toast({ title: "AI Sorter Failed", description: "Could not get pallet assignments.", variant: "destructive"});
            })
            .finally(() => setIsAiLoading(false));
    }
  }, [expectedBoxes, toast]);


  const handleVerifyBox = () => {
      setError(null);
      setLastScanResult(null);
      const scannedId = inputValue.trim();
      if (!scannedId) {
          setError("Please scan or enter a box ID.");
          return;
      }
      
      const box = expectedBoxes.find(box => box.boxId === scannedId);

      if (box) {
          setScannedBoxIds(prev => new Set(prev).add(scannedId));
          setInputValue('');
          const assignedPallet = palletAssignments[box.destination];
          if(assignedPallet) {
            setLastScanResult({ boxId: scannedId, pallet: assignedPallet });
          }
          toast({ title: "Verified", description: `Box #${scannedId} confirmed.`});
      } else {
          setError(`Box ID #${scannedId} is not part of this manifest.`);
      }
      scanInputRef.current?.focus();
  };
  
  const handleSaveAndConfirm = () => {
    if (manifest) {
      const allVerified = expectedBoxes.length > 0 && expectedBoxes.length === scannedBoxIds.size;
      const newStatus = allVerified ? 'Received' : 'Short Received';

      updateManifest({ 
          ...manifest,
          status: newStatus,
          verifiedBoxIds: Array.from(scannedBoxIds),
      });

      toast({
        title: `Verification Saved: ${newStatus}`,
        description: `${scannedBoxIds.size} of ${expectedBoxes.length} boxes have been verified and saved.`,
      });
      router.push('/hub');
    }
  };
  
  const totalBoxes = expectedBoxes.length;
  const verifiedCount = scannedBoxIds.size;
  const verificationProgress = totalBoxes > 0 ? (verifiedCount / totalBoxes) * 100 : 0;
  const allVerified = totalBoxes > 0 && totalBoxes === verifiedCount;

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
            Verify Manifest {manifest.manifestNo}
          </h1>
          <p className="text-muted-foreground">
            Dispatched on {format(new Date(manifest.date), 'PPP')} with vehicle {manifest.vehicleNo || 'N/A'}.
          </p>
        </div>
        <Button onClick={handleSaveAndConfirm} size="lg" disabled={verifiedCount === 0}>
            <Save className="mr-2 h-5 w-5" />
            Save & Confirm ({verifiedCount}/{totalBoxes})
        </Button>
      </div>

     <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Scan & Verify</CardTitle>
                    <CardDescription>Scan individual box sticker barcode.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            ref={scanInputRef}
                            placeholder="Scan or enter box barcode"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyBox(); }}
                            disabled={allVerified}
                            autoFocus
                        />
                        <Button onClick={handleVerifyBox} disabled={allVerified}>
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
                    {lastScanResult && (
                        <Alert variant="default" className="bg-primary/10 border-primary/20">
                            <Pallet className="h-5 w-5 text-primary"/>
                            <AlertTitle className="text-xl font-bold">
                                Place on Pallet #{lastScanResult.pallet}
                            </AlertTitle>
                            <AlertDescription>
                                Box <strong>{lastScanResult.boxId}</strong> goes to Pallet #{lastScanResult.pallet}.
                            </AlertDescription>
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
                            <span>Boxes Verified</span>
                            <span>{verifiedCount} of {totalBoxes}</span>
                        </div>
                        <Progress value={verificationProgress} />
                    </div>

                    {allVerified && (
                         <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800 dark:text-green-300">All Verified!</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                You can now save and confirm the full shipment arrival.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                 <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={() => router.push('/hub/dispatch')}
                        variant="secondary"
                    >
                        Go to Outbound Dispatch <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                 </CardFooter>
            </Card>
        </div>
        
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Expected Boxes in Manifest</CardTitle>
            <CardDescription>Total of {totalBoxes} box(es).</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead>Box ID</TableHead>
                    <TableHead>Waybill #</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Pallet</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {expectedBoxes.map((box) => {
                    const isVerified = scannedBoxIds.has(box.boxId);
                    const pallet = palletAssignments[box.destination];
                    return (
                        <TableRow key={box.boxId} className={cn(isVerified && 'bg-green-50/50 dark:bg-green-900/20')}>
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
                            <TableCell className="font-medium font-mono">{box.boxId}</TableCell>
                            <TableCell>{box.waybillNumber}</TableCell>
                            <TableCell>{box.destination}</TableCell>
                            <TableCell>
                                {isAiLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {pallet && <span className="font-semibold">{pallet}</span>}
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
