
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Map as MapIcon, Package, Weight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface StateData {
    state: string;
    boxCount: number;
    totalActualWeight: number;
    totalChargeableWeight: number;
}

export default function VehicleMappingPage() {
    const { allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();

    const pendingDispatchData = useMemo((): StateData[] => {
        if (!manifestsLoaded || !waybillsLoaded) return [];
        
        const dispatchedFromHubWbIds = new Set(
            allManifests.filter(m => m.origin === 'hub').flatMap(m => m.waybillIds)
        );

        const verifiedBoxIds = new Set(
            allManifests.filter(m => ['Received', 'Short Received'].includes(m.status)).flatMap(m => m.verifiedBoxIds || [])
        );
        
        const stateData: Record<string, { boxCount: number; waybillIds: Set<string> }> = {};

        verifiedBoxIds.forEach(boxId => {
            const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
            const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);

            if (waybill && !dispatchedFromHubWbIds.has(waybill.id)) {
                const state = waybill.receiverState.toUpperCase();
                if (!stateData[state]) {
                    stateData[state] = { boxCount: 0, waybillIds: new Set() };
                }
                stateData[state].boxCount++;
                stateData[state].waybillIds.add(waybill.id);
            }
        });

        return Object.entries(stateData)
            .map(([state, data]) => {
                const waybillsForState = Array.from(data.waybillIds).map(id => allWaybills.find(wb => wb.id === id)).filter(wb => wb);
                const totalActualWeight = waybillsForState.reduce((sum, wb) => sum + (wb?.packageWeight || 0), 0);
                const totalChargeableWeight = waybillsForState.reduce((sum, wb) => sum + (wb?.chargeableWeight || 0), 0);
                
                return { 
                    state, 
                    boxCount: data.boxCount,
                    totalActualWeight,
                    totalChargeableWeight
                };
            })
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
                <p className="text-orange-600 dark:text-orange-300 mt-1">A state-wise overview of boxes and weight pending for outbound dispatch from the hub.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Boxes by State</CardTitle>
                    <CardDescription>
                        There are a total of <span className="font-bold text-primary">{totalPendingBoxes}</span> boxes waiting to be dispatched.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid lg:grid-cols-5 gap-8">
                        {pendingDispatchData.length > 0 ? (
                            <>
                                <div className="h-[400px] lg:col-span-3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={pendingDispatchData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="state" type="category" width={80} />
                                            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value: number) => value.toFixed(2)} />
                                            <Legend />
                                            <Bar dataKey="boxCount" name="Boxes" fill="hsl(var(--primary))" />
                                            <Bar dataKey="totalActualWeight" name="Actual Wt. (kg)" fill="hsl(var(--chart-2))" />
                                            <Bar dataKey="totalChargeableWeight" name="Chargeable Wt. (kg)" fill="hsl(var(--chart-3))" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="lg:col-span-2">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>State</TableHead>
                                                <TableHead className="text-right">Boxes</TableHead>
                                                <TableHead className="text-right">Act. Wt.</TableHead>
                                                <TableHead className="text-right">Chg. Wt.</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingDispatchData.map(data => (
                                                <TableRow key={data.state}>
                                                    <TableCell className="font-medium">{data.state}</TableCell>
                                                    <TableCell className="text-right font-bold text-primary">{data.boxCount}</TableCell>
                                                    <TableCell className="text-right">{data.totalActualWeight.toFixed(2)} kg</TableCell>
                                                    <TableCell className="text-right">{data.totalChargeableWeight.toFixed(2)} kg</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            <div className="lg:col-span-5 text-center py-16 border-2 border-dashed rounded-lg">
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

    