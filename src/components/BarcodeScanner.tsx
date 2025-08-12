'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, ScanLine, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (scannedValue: string) => void;
  className?: string;
}

export function BarcodeScanner({ onScan, className }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const animationFrameId = useRef<number>();

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          onScan(code.data);
          setIsScanning(false); // Stop scanning after a successful scan
        }
      }
    }
    if (isScanning) {
        animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [isScanning, onScan]);

  useEffect(() => {
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isScanning, tick]);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
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
  };

  const stopScan = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
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
            <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !isScanning })} autoPlay playsInline muted />
            {!isScanning && (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Camera className="h-12 w-12" />
                    <p>Camera is off</p>
                </div>
            )}
             {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-3/4 h-1/2">
                        <div className="absolute top-0 left-0 border-t-4 border-l-4 border-primary h-8 w-8 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 border-t-4 border-r-4 border-primary h-8 w-8 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 border-b-4 border-l-4 border-primary h-8 w-8 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-primary h-8 w-8 rounded-br-lg"></div>
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/70 animate-ping"></div>
                    </div>
                </div>
            )}
       </div>
       <canvas ref={canvasRef} style={{ display: 'none' }} />

        {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
            <CameraOff className="h-4 w-4" />
            <AlertTitle>Camera Permission Denied</AlertTitle>
            <AlertDescription>
                You must grant camera access to use the scanner. Please update your browser settings.
            </AlertDescription>
            </Alert>
        )}
        <div className="mt-4 flex justify-center">
            <Button onClick={handleToggleScan} variant={isScanning ? 'destructive': 'outline'}>
                {isScanning ? <CameraOff className="mr-2"/> : <Camera className="mr-2"/>}
                {isScanning ? 'Stop Scanning' : 'Start Scanner'}
            </Button>
        </div>
    </div>
  );
}
