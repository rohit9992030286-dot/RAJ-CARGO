
'use client'

import { useManifests } from "@/hooks/useManifests"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


export default function CreateManifestPage() {
    const { addManifest } = useManifests();
    const router = useRouter();
    const [vehicleNo, setVehicleNo] = useState('');
    const { toast } = useToast();

    const handleCreate = () => {
        if (!vehicleNo.trim()) {
            toast({
                title: "Vehicle Number Required",
                description: "Please enter a vehicle number for the manifest.",
                variant: "destructive"
            });
            return;
        }

        const newManifestId = addManifest({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            waybillIds: [],
            status: 'Draft',
            vehicleNo: vehicleNo.trim(),
            origin: 'booking',
        });
        router.replace(`/booking/manifest/${newManifestId}`);
    };

    return (
         <AlertDialog open={true} onOpenChange={() => router.push('/booking/manifest')}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Create New Manifest</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please enter the vehicle number that will be used for this manifest.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="vehicle-no-create">Vehicle Number</Label>
                    <Input 
                        id="vehicle-no-create"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        placeholder="e.g., MH-12-AB-1234"
                        autoFocus
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" onClick={() => router.push('/booking/manifest')}>Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreate}>
                        Create & Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
