
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Map as MapIcon, Package, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface StateData {
    state: string;
    boxCount: number;
}

export default function VehicleMappingPage() {
    const { allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();

    const pendingDispatchData = useMemo((): StateData[] => {
        if (!manifestsLoaded || !waybillsLoaded) return [];
        
        // Get all waybill IDs that have been dispatched from a hub
        const dispatchedFromHubWbIds = new Set(
            allManifests.filter(m => m.origin === 'hub').flatMap(m => m.waybillIds)
        );

        // Get all box IDs that have been verified at a hub
        const verifiedBoxIds = new Set(
            allManifests.filter(m => ['Received', 'Short Received'].includes(m.status)).flatMap(m => m.verifiedBoxIds || [])
        );

        const stateBoxCount: Record<string, number> = {};

        verifiedBoxIds.forEach(boxId => {
            const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
            const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);

            // Count the box only if its waybill has NOT been dispatched from the hub yet
            if (waybill && !dispatchedFromHubWbIds.has(waybill.id)) {
                const state = waybill.receiverState.toUpperCase();
                if (!stateBoxCount[state]) {
                    stateBoxCount[state] = 0;
                }
                stateBoxCount[state]++;
            }
        });

        return Object.entries(stateBoxCount)
            .map(([state, boxCount]) => ({ state, boxCount }))
            .sort((a,b) => b.boxCount - a.boxCount);

    }, [allManifests, allWaybills, manifestsLoaded, waybillsLoaded]);


    if (!manifestsLoaded || !waybillsLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalPendingBoxes = pendingDispatchData.reduce((acc, state) => acc + state.boxCount, 0);

    return (
        <div className="space-y-8">
            <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/80 border border-orange-200 dark:border-orange-800 shadow-md">
                <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-100">Hub Outbound Planning</h1>
                <p className="text-orange-600 dark:text-orange-300 mt-1">A state-wise overview of boxes pending for outbound dispatch from the hub.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Boxes by State</CardTitle>
                    <CardDescription>
                        There are a total of <span className="font-bold text-primary">{totalPendingBoxes}</span> boxes waiting to be dispatched.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                        {pendingDispatchData.length > 0 ? (
                            <>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={pendingDispatchData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="state" type="category" width={80} />
                                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }}/>
                                            <Legend />
                                            <Bar dataKey="boxCount" name="Pending Boxes" fill="hsl(var(--primary))" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>State</TableHead>
                                                <TableHead className="text-right">Pending Boxes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingDispatchData.map(data => (
                                                <TableRow key={data.state}>
                                                    <TableCell className="font-medium">{data.state}</TableCell>
                                                    <TableCell className="text-right font-bold text-primary">{data.boxCount}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            <div className="lg:col-span-2 text-center py-16 border-2 border-dashed rounded-lg">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No Pending Dispatches</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    All verified boxes have been dispatched from the hub.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
