
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
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const scannerRef = useRef<any>(null);

  const startScan = useCallback(async () => {
    if (!videoRef.current) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCameraPermission(true);
        setIsScanning(true);

        if (!('BarcodeDetector' in window)) {
            toast({
                title: "Scanner Not Supported",
                description: "This browser doesn't support the built-in barcode scanner.",
                variant: 'destructive',
            });
            setIsScanning(false);
            return;
        }

        scannerRef.current = new window.BarcodeDetector({
            formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'data_matrix', 'upc_e']
        });

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
  
  const stopScan = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);
  
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
                  if (videoRef.current?.srcObject) setIsScanning(true);
              }, 1500); 
          }
      } catch (error) {
          console.error("Barcode detection failed:", error);
      }

  }, [isScanning, onScan]);

  useEffect(() => {
    startScan();

    const interval = setInterval(() => {
      scanFrame();
    }, 200);

    return () => {
      clearInterval(interval);
      stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleScan = () => {
    if (isScanning) {
        stopScan();
    } else {
        startScan();
    }
  };

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
        <div className="mt-4 flex justify-center">
            <Button onClick={handleToggleScan} variant={isScanning ? 'destructive': 'outline'}>
                {isScanning ? <CameraOff className="mr-2"/> : <CameraIcon className="mr-2"/>}
                {isScanning ? 'Stop Scanning' : 'Start Scanner'}
            </Button>
        </div>
    </div>
  );
}
