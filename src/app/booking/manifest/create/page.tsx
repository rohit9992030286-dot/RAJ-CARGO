
'use client'

import { useManifests } from "@/hooks/useManifests"
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function CreateManifestPage() {
    const { addManifest } = useManifests();
    const router = useRouter();

    useEffect(() => {
        const newManifestId = addManifest({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            waybillIds: [],
            status: 'Draft',
            vehicleNo: ''
        });
        router.replace(`/booking/manifest/${newManifestId}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-4 text-muted-foreground">Creating new manifest...</p>
        </div>
    )
}
