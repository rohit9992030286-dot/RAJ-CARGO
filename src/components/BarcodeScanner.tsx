
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera as CameraIcon, CameraOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    BarcodeDetector: new (options?: { formats: string[] }) => BarcodeDetector;
  }
  interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<any[]>;
    getSupportedFormats(): Promise<string[]>;
  }
}


interface BarcodeScannerProps {
  onScan: (scannedValue: string) => void;
  className?: string;
}

export function BarcodeScanner({ onScan, className }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null); // For the BarcodeDetector instance
  const streamRef = useRef<MediaStream | null>(null); // To hold the stream reference

  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const stopScan = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const startScan = useCallback(async () => {
    if (streamRef.current || !videoRef.current) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;

        videoRef.current.srcObject = stream;
        
        // Ensure metadata is loaded before playing
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play failed:", e));
        };
        
        setHasCameraPermission(true);

        if (!('BarcodeDetector' in window)) {
            toast({
                title: "Scanner Not Supported",
                description: "This browser doesn't support the built-in barcode scanner.",
                variant: 'destructive',
            });
            setIsScanning(false);
            return;
        }
        
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
        const formatsToUse = [
            'code_128', 'code_39', 'code_93', 'codabar',
            'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e', 'qr_code'
        ].filter(format => supportedFormats.includes(format));

        scannerRef.current = new window.BarcodeDetector({ formats: formatsToUse });
        setIsScanning(true);

    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsScanning(false);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
        });
    }
  }, [toast]);
  
  const scanFrame = useCallback(async () => {
      if (!isScanning || !videoRef.current || !scannerRef.current || videoRef.current.readyState < 2) {
          return;
      }

      try {
          const barcodes = await scannerRef.current.detect(videoRef.current);
          if (barcodes.length > 0) {
              const scannedValue = barcodes[0].rawValue;
              onScan(scannedValue);
              
              // Briefly pause to prevent immediate re-scan
              setIsScanning(false);
              setTimeout(() => {
                 // Check if stream is still active before restarting
                 if (streamRef.current?.active) {
                    setIsScanning(true);
                 }
              }, 1000); 
          }
      } catch (error) {
          console.error("Barcode detection failed:", error);
      }

  }, [isScanning, onScan]);

  useEffect(() => {
    let scanInterval: NodeJS.Timeout;

    if (isScanning) {
        scanInterval = setInterval(scanFrame, 200);
    }

    return () => {
      if(scanInterval) clearInterval(scanInterval);
    };
  }, [isScanning, scanFrame]);

  useEffect(() => {
    // This effect now only runs once on mount
    startScan();
    
    // The cleanup function will run on unmount
    return () => {
        stopScan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className={cn("relative w-full p-4 border rounded-md bg-muted/50", className)}>
        <div className="relative overflow-hidden rounded-md aspect-video bg-black flex items-center justify-center">
            <video ref={videoRef} className={cn("w-full h-full object-cover")} autoPlay playsInline muted />
            {hasCameraPermission === null && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p>Initializing Camera...</p>
                </div>
            )}
             {!isScanning && hasCameraPermission && streamRef.current?.active && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p>Processing...</p>
                </div>
            )}
            {hasCameraPermission === false && (
                 <Alert variant="destructive" className="absolute bottom-4 left-4 right-4 w-auto">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use the scanner.
                    </AlertDescription>
                </Alert>
            )}
        </div>
         <div className="mt-4 flex justify-center gap-4">
            {streamRef.current?.active ? (
                <Button onClick={stopScan} variant="destructive">
                    <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
                </Button>
            ) : (
                 <Button onClick={startScan}>
                    <CameraIcon className="mr-2 h-4 w-4" /> Start Camera
                </Button>
            )}
        </div>
    </div>
  );
}
