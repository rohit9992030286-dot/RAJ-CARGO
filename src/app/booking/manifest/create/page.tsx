
'use client'

import { useManifests } from "@/hooks/useManifests"
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const { toast } = useToast();

    const handleCreate = () => {
        if (!vehicleNo.trim() || !driverName.trim() || !driverContact.trim()) {
            toast({
                title: "All fields are required",
                description: "Please enter vehicle number, driver name, and contact number.",
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
            driverName: driverName.trim(),
            driverContact: driverContact.trim(),
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
                        Please enter the vehicle and driver details for this manifest.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="vehicle-no-create">Vehicle Number *</Label>
                        <Input 
                            id="vehicle-no-create"
                            value={vehicleNo}
                            onChange={(e) => setVehicleNo(e.target.value)}
                            placeholder="e.g., MH-12-AB-1234"
                            autoFocus
                        />
                    </div>
                     <div>
                        <Label htmlFor="driver-name-create">Driver Name *</Label>
                        <Input 
                            id="driver-name-create"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="e.g., Suresh Kumar"
                        />
                    </div>
                     <div>
                        <Label htmlFor="driver-contact-create">Driver Contact No. *</Label>
                        <Input 
                            id="driver-contact-create"
                            value={driverContact}
                            onChange={(e) => setDriverContact(e.target.value)}
                            placeholder="e.g., 9876543210"
                        />
                    </div>
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
