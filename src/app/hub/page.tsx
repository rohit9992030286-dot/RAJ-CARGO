
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useManifests } from '@/hooks/useManifests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Truck, Loader2, ScanLine, ArrowRight, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function HubPage() {
  const router = useRouter();
  const { allManifests, isLoaded: manifestsLoaded } = useManifests();
  const [manifestIdInput, setManifestIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFindManifest = () => {
    setError(null);
    if (!manifestIdInput.trim()) {
      setError('Please enter a manifest ID.');
      return;
    }
    
    const manifest = allManifests.find(m => m.id.substring(0, 8).toLowerCase() === manifestIdInput.trim().toLowerCase());

    if (manifest) {
      if (manifest.status === 'Received') {
          toast({
            title: 'Manifest Already Verified',
            description: `Manifest M-${manifest.id.substring(0,8)} has already been marked as received.`,
            variant: 'default'
          });
      }
      router.push(`/hub/scan/${manifest.id}`);
    } else {
      setError('No manifest found with that ID.');
    }
  };

  if (!manifestsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Hub Operations</h1>
        <p className="text-muted-foreground">Scan manifests to verify incoming shipments or manage outbound dispatches.</p>
      </div>
      
       <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScanLine className="h-6 w-6 text-primary" />
                    <span>Scan to Verify</span>
                </CardTitle>
                <CardDescription>Enter the Manifest ID (e.g., M-xxxx) from the manifest sheet to begin verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter Manifest ID"
                        value={manifestIdInput}
                        onChange={(e) => setManifestIdInput(e.target.value.replace(/^m-/i, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && handleFindManifest()}
                        className="flex-grow"
                    />
                    <Button onClick={handleFindManifest}>
                        <ScanLine className="mr-2 h-4 w-4" /> Find & Verify
                    </Button>
                </div>
                 {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
             <CardFooter>
                 <Link href="/hub/dispatch" className="w-full">
                    <Button variant="outline" className="w-full">
                        Go to Outbound Dispatch <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
             </CardFooter>
        </Card>
    </div>
  );
}
