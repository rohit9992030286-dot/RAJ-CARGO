'use client';

import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Box, CheckCircle, Loader2, ScanLine, XCircle, AlertCircle, Circle, ArrowRight, Save, Layers, AlertTriangle, Clock } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore, differenceInHours } from 'date-fns';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { Badge } from '@/components/ui/badge';

interface ExpectedBox {
    waybillId: string;
    waybillNumber: string;
    boxNumber: number;
    totalBoxes: number;
    boxId: string;
    destination: string;
    eWayBillExpiryDate?: string;
}

interface LastScanResult {
    boxId: string;
    pallet: number;
}

function speak(text: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

function ScanManifestPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const manifestId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getManifestById, updateManifest, allManifests, isLoaded: manifestsLoaded } = useManifests();
  const { getWaybillById, allWaybills, isLoaded: waybillsLoaded } = useWaybills();
  
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [scannedBoxIds, setScannedBoxIds] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [palletAssignments, setPalletAssignments] = useState<Record<string, number>>({});
  const [isAssignmentLoading, setIsAssignmentLoading] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<LastScanResult | null>(null);

  useEffect(() => {
    if (manifestId && manifestsLoaded) {
      const existingManifest = getManifestById(manifestId);
      if (existingManifest) {
        setManifest(existingManifest);
        if (existingManifest.verifiedBoxIds) {
            setScannedBoxIds(new Set(existingManifest.verifiedBoxIds));
        }
        if (existingManifest.palletAssignments) {
            setPalletAssignments(existingManifest.palletAssignments);
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
                destination: waybill.receiverCity.toUpperCase(),
                eWayBillExpiryDate: waybill.eWayBillExpiryDate,
            };
        });
    });
  },[manifest, getWaybillById]);
  
  useEffect(() => {
    if (expectedBoxes.length > 0 && Object.keys(palletAssignments).length === 0 && !isAssignmentLoading && manifest?.status === 'Dispatched') {
        setIsAssignmentLoading(true);

        const citiesOnFloor = new Map<string, number>(); // Map city -> pallet number
        const occupiedPallets = new Set<number>();
        
        const dispatchedFromHubWbIds = new Set(allManifests.filter(m => m.origin === 'hub').flatMap(m => m.waybillIds));
        const hubReceivedAndNotDispatchedWbIds = new Set(
            allManifests.filter(m => ['Received', 'Short Received'].includes(m.status))
            .flatMap(m => m.verifiedBoxIds?.map(boxId => allWaybills.find(wb => wb.waybillNumber === boxId.substring(0, boxId.lastIndexOf('-')))?.id) || [])
            .filter((id): id is string => !!id && !dispatchedFromHubWbIds.has(id))
        );

        allManifests.forEach(m => {
            if ((m.status === 'Received' || m.status === 'Short Received') && m.palletAssignments) {
                 Object.entries(m.palletAssignments).forEach(([city, pallet]) => {
                     const cityUpper = city.toUpperCase();
                     const cityHasActiveWaybills = allWaybills.some(wb => 
                        wb.receiverCity.toUpperCase() === cityUpper && hubReceivedAndNotDispatchedWbIds.has(wb.id)
                     );

                     if(cityHasActiveWaybills){
                        citiesOnFloor.set(cityUpper, pallet);
                        occupiedPallets.add(pallet);
                     }
                 })
            }
        })
        
        let nextPallet = 1;
        const newAssignments: Record<string, number> = {};
        const uniqueCitiesForCurrentManifest = [...new Set(expectedBoxes.map(b => b.destination))];
        
        uniqueCitiesForCurrentManifest.forEach(city => {
            if (citiesOnFloor.has(city)) {
                newAssignments[city] = citiesOnFloor.get(city)!;
            } else {
                while(occupiedPallets.has(nextPallet)){
                    nextPallet++;
                }
                if(nextPallet <= 100) {
                    newAssignments[city] = nextPallet;
                    occupiedPallets.add(nextPallet);
                    citiesOnFloor.set(city, nextPallet);
                } else {
                    newAssignments[city] = 1;
                }
            }
        });

        setPalletAssignments(newAssignments);
        setIsAssignmentLoading(false);
    }
  }, [expectedBoxes, palletAssignments, isAssignmentLoading, allManifests, allWaybills, manifest?.status]);

  const handleVerifyBox = (scannedId: string) => {
      setError(null);
      setLastScanResult(null);
      if (!scannedId) {
          setError("Please scan or enter a box ID.");
          return;
      }
      
      const box = expectedBoxes.find(b => b.boxId === scannedId);

      if (box) {
          setScannedBoxIds(prev => new Set(prev).add(scannedId));
          setInputValue('');
          const assignedPallet = palletAssignments[box.destination];
          if(assignedPallet) {
            setLastScanResult({ boxId: scannedId, pallet: assignedPallet });
            speak(`Pallet ${assignedPallet}`);
          }
          
          // E-Way Bill Check during scan
          if (box.eWayBillExpiryDate) {
              const expiry = new Date(box.eWayBillExpiryDate);
              const now = new Date();
              if (isBefore(expiry, now)) {
                  toast({
                      title: "CRITICAL: E-WAY BILL EXPIRED!",
                      description: `Box #${scannedId} has an expired E-Way bill. Flag for correction.`,
                      variant: "destructive"
                  });
                  speak("Warning: E-Way bill expired");
              } else if (differenceInHours(expiry, now) <= 48) {
                  toast({
                      title: "Urgent: E-Way Bill Expiring Soon",
                      description: `Box #${scannedId} expires in ${differenceInHours(expiry, now)} hours.`,
                  });
              }
          }

          toast({ title: "Verified", description: `Box #${scannedId} confirmed.`});
      } else {
          setError(`Box ID #${scannedId} is not part of this manifest.`);
      }
      scanInputRef.current?.focus();
  };
  
  const handleManualVerify = () => {
    handleVerifyBox(inputValue.trim());
  }

  const handleSaveAndConfirm = () => {
    if (manifest) {
      const allVerified = expectedBoxes.length > 0 && expectedBoxes.length === scannedBoxIds.size;
      const newStatus = allVerified ? 'Received' : 'Short Received';

      updateManifest({ 
          ...manifest,
          status: newStatus,
          verifiedBoxIds: Array.from(scannedBoxIds),
          verifiedDate: new Date().toISOString(),
          palletAssignments: palletAssignments
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
  
  const checkEWayBillExpiry = (expiryDateString?: string) => {
    if (!expiryDateString) return null;
    const expiryDate = new Date(expiryDateString);
    const now = new Date();
    if (isBefore(expiryDate, now)) {
        return { message: "E-WAY BILL EXPIRED!", isCritical: true, icon: AlertCircle };
    }
    const hoursLeft = differenceInHours(expiryDate, now);
    if (hoursLeft <= 48) {
        return { message: `Expires in ${hoursLeft}h`, isCritical: false, icon: Clock };
    }
    return null;
  }

  if (!waybillsLoaded || !manifestsLoaded || !manifest) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/hub')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Manifest Verification
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Manifest <span className="font-mono font-bold text-primary">{manifest.manifestNo}</span> • {totalBoxes} Boxes
          </p>
        </div>
        <Button onClick={handleSaveAndConfirm} size="lg" className="shadow-lg" disabled={verifiedCount === 0 && manifest.status === 'Dispatched'}>
            <Save className="mr-2 h-5 w-5" />
            Save & Confirm Receipt ({verifiedCount}/{totalBoxes})
        </Button>
      </div>

     <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-primary/10">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                        <ScanLine className="h-5 w-5 text-primary"/>
                        Scanner Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <BarcodeScanner onScan={handleVerifyBox} className="border-2 border-primary/20" />
                    <div className="flex items-center gap-2 px-2">
                        <hr className="flex-grow border-border" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">or manual entry</span>
                        <hr className="flex-grow border-border" />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            ref={scanInputRef}
                            placeholder="Enter barcode..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleManualVerify(); }}
                            disabled={allVerified}
                            className="font-mono h-12"
                        />
                        <Button onClick={handleManualVerify} disabled={allVerified} className="h-12 px-6">
                            Verify
                        </Button>
                    </div>
                    {error && (
                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Scan Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    )}
                    {lastScanResult && (
                        <div className="bg-blue-600 text-white p-6 rounded-xl text-center shadow-inner animate-in zoom-in-95 duration-200">
                            <p className="text-sm font-bold uppercase opacity-80 mb-1">Assigned Pallet</p>
                            <p className="text-6xl font-black">{lastScanResult.pallet}</p>
                            <p className="mt-3 text-sm font-medium opacity-90">Box: {lastScanResult.boxId}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Session Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-muted-foreground uppercase tracking-wider">Completion</span>
                            <span className={cn(allVerified ? "text-green-600" : "text-primary")}>{Math.round(verificationProgress)}%</span>
                        </div>
                        <Progress value={verificationProgress} className="h-3" />
                        <p className="text-xs text-center text-muted-foreground font-medium">
                            {verifiedCount} of {totalBoxes} items accounted for
                        </p>
                    </div>

                    {allVerified && (
                         <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4 flex flex-col items-center text-center gap-2">
                            <div className="p-2 bg-green-500 rounded-full text-white">
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="font-bold text-green-700 dark:text-green-400">All Boxes Verified</h3>
                            <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                                The shipment matches the manifest. You can now finalize receipt.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Card className="lg:col-span-2 shadow-lg border-none">
            <CardHeader className="border-b">
                <CardTitle>Manifest Items List</CardTitle>
                <CardDescription>Verified items will be highlighted in green.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="w-[140px] font-bold">Status</TableHead>
                            <TableHead className="font-bold">Box ID</TableHead>
                            <TableHead className="font-bold">Waybill Details</TableHead>
                            <TableHead className="font-bold text-center">Pallet</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {expectedBoxes.map((box) => {
                        const isVerified = scannedBoxIds.has(box.boxId);
                        const pallet = palletAssignments[box.destination.toUpperCase()];
                        const expiryInfo = checkEWayBillExpiry(box.eWayBillExpiryDate);
                        const ExpiryIcon = expiryInfo?.icon;

                        return (
                            <TableRow key={box.boxId} className={cn("transition-colors", isVerified ? 'bg-green-50 dark:bg-green-900/10' : '')}>
                                <TableCell>
                                    {isVerified ? (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-600 flex items-center gap-1.5 w-fit">
                                            <CheckCircle className="h-3 w-3" /> VERIFIED
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="flex items-center gap-1.5 w-fit text-muted-foreground">
                                            <Circle className="h-3 w-3" /> PENDING
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono font-bold">{box.boxId}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            {box.waybillNumber}
                                            {expiryInfo && (
                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 h-5 flex items-center gap-1 border-none", expiryInfo.isCritical ? "bg-destructive text-destructive-foreground" : "bg-amber-100 text-amber-700")}>
                                                    {ExpiryIcon && <ExpiryIcon className="h-2.5 w-2.5" />}
                                                    {expiryInfo.message}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-tight">
                                            <ArrowRight className="h-3 w-3" /> {box.destination}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {isAssignmentLoading && !pallet && <Loader2 className="h-4 w-4 animate-spin mx-auto opacity-20" />}
                                    {pallet ? (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm mx-auto border border-blue-200">
                                            {pallet}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground opacity-20">-</span>
                                    )}
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
