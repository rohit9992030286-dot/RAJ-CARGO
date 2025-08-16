'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  BarcodeCapture,
  BarcodeCaptureOverlay,
  BarcodeCaptureSettings,
  Symbology,
  SymbologyDescription,
  Camera,
  CameraSwitchControl,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
  LaserlineViewfinder,
  LaserlineViewfinderStyle,
} from 'scandit-sdk';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera as CameraIcon, CameraOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (scannedValue: string) => void;
  className?: string;
}

const SCANDIT_LICENSE_KEY = process.env.NEXT_PUBLIC_SCANDIT_LICENSE_KEY || '-- ENTER YOUR SCANDIT LICENSE KEY HERE --';

export function BarcodeScanner({ onScan, className }: BarcodeScannerProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const context = useRef<DataCaptureContext | null>(null);
  const camera = useRef<Camera | null>(null);
  const barcodeCapture = useRef<BarcodeCapture | null>(null);

  const handleScan = useCallback((barcode: any) => {
    barcodeCapture.current?.setEnabled(false);
    onScan(barcode.data);
    setTimeout(() => {
        barcodeCapture.current?.setEnabled(true);
    }, 1000); // Cooldown to prevent re-scanning
  }, [onScan]);

  const startScan = useCallback(async () => {
    if (!context.current || !camera.current) return;

    try {
        await camera.current.switchToDesiredState(FrameSourceState.On);
        setIsScanning(true);
    } catch (error) {
        console.error('Error starting camera:', error);
        toast({
            variant: 'destructive',
            title: 'Camera Access Error',
            description: 'Could not start the camera. Please check permissions.',
        });
    }
  }, [toast]);
  
  const stopScan = useCallback(() => {
      if (camera.current?.switchToDesiredState) {
        camera.current.switchToDesiredState(FrameSourceState.Off);
      }
      setIsScanning(false);
  }, []);

  const initializeScanner = useCallback(async () => {
    if (viewRef.current) {
        try {
            context.current = await DataCaptureContext.create(SCANDIT_LICENSE_KEY);
            const view = await DataCaptureView.forContext(context.current);
            view.connectToElement(viewRef.current);
            
            camera.current = Camera.default;
            await context.current.setFrameSource(camera.current);
            
            const settings = new BarcodeCaptureSettings();
            settings.enableSymbologies([
                Symbology.Code128,
                Symbology.Code39,
                Symbology.QR,
                Symbology.EAN13UPCA,
                Symbology.DataMatrix,
                Symbology.UPCE,
            ]);
            barcodeCapture.current = await BarcodeCapture.forContext(context.current, settings);
            
            const listener = {
                didScan: (_: BarcodeCapture, session: any) => {
                    const barcode = session.newlyRecognizedBarcodes[0];
                    session.reset();
                    handleScan(barcode);
                },
            };

            barcodeCapture.current.addListener(listener);

            const overlay = await BarcodeCaptureOverlay.withBarcodeCaptureForView(barcodeCapture.current, view);
            overlay.viewfinder = new LaserlineViewfinder(LaserlineViewfinderStyle.Animated);
            
            setIsSdkLoaded(true);
            await startScan();

        } catch (error: any) {
             console.error("Scandit SDK initialization error:", error);
             if (error.name === 'UnsupportedBrowserError') {
                  toast({
                    variant: 'destructive',
                    title: 'Unsupported Browser',
                    description: 'This browser is not supported by the scanner.',
                });
             } else {
                 toast({
                    variant: 'destructive',
                    title: 'Scanner Initialization Failed',
                    description: 'Could not initialize the barcode scanner.',
                });
             }
        }
    }
  }, [handleScan, startScan, toast]);

  useEffect(() => {
    initializeScanner();
    return () => {
      context.current?.dispose();
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
       <div ref={viewRef} className="relative overflow-hidden rounded-md aspect-video bg-black flex items-center justify-center">
            {!isSdkLoaded && (
                <div className="text-white flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p>Initializing Scanner...</p>
                </div>
            )}
       </div>

        <div className="mt-4 flex justify-center">
            <Button onClick={handleToggleScan} variant={isScanning ? 'destructive': 'outline'} disabled={!isSdkLoaded}>
                {isScanning ? <CameraOff className="mr-2"/> : <CameraIcon className="mr-2"/>}
                {isScanning ? 'Stop Scanning' : 'Start Scanner'}
            </Button>
        </div>
    </div>
  );
}
