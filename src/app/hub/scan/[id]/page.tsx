
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

type ExpectedBox = {
  id: string; // waybillNumber + boxNumber
  waybillNumber: string;
  receiverName: string;
  receiverCity: string;
  boxNumber: number;
  totalBoxes: number;
};

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

  const expectedBoxes = useMemo(() => {
    if (!manifest) return [];
    
    const boxes: ExpectedBox[] = [];
    manifest.waybillIds.forEach(waybillId => {
      const waybill = getWaybillById(waybillId);
      if (waybill) {
        for (let i = 1; i <= waybill.numberOfBoxes; i++) {
          boxes.push({
            id: `${waybill.waybillNumber}-${i}`,
            waybillNumber: waybill.waybillNumber,
            receiverName: waybill.receiverName,
            receiverCity: waybill.receiverCity,
            boxNumber: i,
            totalBoxes: waybill.numberOfBoxes,
          });
        }
      }
    });
    return boxes;
  }, [manifest, getWaybillById]);
  

  const handleVerifyBox = () => {
      setError(null);
      const scannedId = inputValue.trim();
      if (!scannedId) {
          setError("Please scan or enter a box ID.");
          return;
      }
      
      const boxExistsInManifest = expectedBoxes.some(box => box.id === scannedId);

      if (boxExistsInManifest) {
          if (scannedBoxIds.has(scannedId)) {
            setError(`Box ID #${scannedId} has already been verified.`);
          } else {
            setScannedBoxIds(prev => new Set(prev).add(scannedId));
            toast({ title: "Verified", description: `Box #${scannedId} confirmed.` });
          }
      } else {
          setError(`Box with ID #${scannedId} is not part of this manifest.`);
      }
      setInputValue('');
      scanInputRef.current?.focus();
  };

  const handleConfirmArrival = () => {
    if (manifest) {
      updateManifest({ ...manifest, status: 'Received' });
      toast({
        title: "Manifest Arrival Confirmed",
        description: `All ${expectedBoxes.length} boxes in manifest M-${manifest.id.substring(0,8)} have been marked as received.`,
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
                    <CardDescription>Scan each box sticker to confirm arrival.</CardDescription>
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
            <CardTitle>Expected Boxes in Manifest</CardTitle>
            <CardDescription>Total of {totalBoxes} box(es) expected.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Box ID</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-center">Box</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {expectedBoxes.map((box) => {
                    const isVerified = scannedBoxIds.has(box.id);
                    return (
                        <TableRow key={box.id} className={cn(isVerified && 'bg-green-50/50 dark:bg-green-900/20')}>
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
                            <TableCell className="font-medium font-mono text-xs">{box.id}</TableCell>
                            <TableCell>{box.receiverName}</TableCell>
                            <TableCell>{box.receiverCity}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Box className="h-4 w-4 text-muted-foreground" />
                                    {box.boxNumber} of {box.totalBoxes}
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
