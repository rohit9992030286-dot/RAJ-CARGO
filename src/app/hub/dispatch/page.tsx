
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function HubDispatchPage() {

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Outbound Dispatch</h1>
                <p className="text-muted-foreground">Create and manage manifests for final delivery.</p>
            </div>

            <Card className="text-center py-16 border-2 border-dashed rounded-lg">
                <CardHeader>
                    <Truck className="mx-auto h-16 w-16 text-muted-foreground" />
                    <CardTitle className="mt-4">Outbound Dispatch Coming Soon</CardTitle>
                </CardHeader>
                 <CardContent>
                    <CardDescription>
                        This section will allow you to select verified waybills and create new manifests for final delivery.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    )
}
