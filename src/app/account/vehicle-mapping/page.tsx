
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Map as MapIcon, Package, Weight, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface CityData {
    city: string;
    boxCount: number;
    totalActualWeight: number;
    totalChargeableWeight: number;
}

interface StateData {
    state: string;
    destinations: CityData[];
    totalBoxes: number;
}


export default function VehicleMappingPage() {
    const { allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();

    const pendingDispatchData = useMemo((): StateData[] => {
        if (!manifestsLoaded || !waybillsLoaded) return [];

        // 1. Find all box IDs that have already been dispatched from a hub.
        const dispatchedFromHubBoxIds = new Set<string>();
        allManifests.forEach(m => {
            if (m.origin === 'hub') {
                (m.waybillIds || []).forEach(wbId => {
                    const wb = allWaybills.find(waybill => waybill.id === wbId);
                    if (wb) {
                        for (let i = 1; i <= wb.numberOfBoxes; i++) {
                            dispatchedFromHubBoxIds.add(`${wb.waybillNumber}-${i}`);
                        }
                    }
                });
            }
        });

        // 2. Get all boxes that have been verified at any hub and are not yet dispatched onward.
        const pendingBoxes: { boxId: string, waybill: import('@/types/waybill').Waybill }[] = [];
        allManifests.forEach(m => {
            if (['Received', 'Short Received'].includes(m.status)) {
                m.verifiedBoxIds?.forEach(boxId => {
                    if (!dispatchedFromHubBoxIds.has(boxId)) {
                        const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
                        const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);
                        if (waybill && !pendingBoxes.some(p => p.boxId === boxId)) {
                            pendingBoxes.push({ boxId, waybill });
                        }
                    }
                });
            }
        });

        // 3. Group these pending boxes by destination state, then by city.
        const boxesByState: Record<string, Record<string, { waybillIds: Set<string>, boxCount: number }>> = {};

        pendingBoxes.forEach(({ waybill }) => {
            if (!waybill.receiverState || !waybill.receiverCity) return;
            
            const state = waybill.receiverState.toUpperCase();
            const city = waybill.receiverCity.toUpperCase();

            if (!boxesByState[state]) {
                boxesByState[state] = {};
            }
            if (!boxesByState[state][city]) {
                boxesByState[state][city] = { waybillIds: new Set(), boxCount: 0 };
            }
            boxesByState[state][city].waybillIds.add(waybill.id);
        });

        // Calculate box count for each city based on waybills
         Object.values(boxesByState).forEach(cities => {
            Object.values(cities).forEach(cityData => {
                 cityData.boxCount = Array.from(cityData.waybillIds)
                    .reduce((sum, wbId) => {
                        const wb = allWaybills.find(w => w.id === wbId);
                        return sum + (wb?.numberOfBoxes || 0);
                    }, 0);
            })
        });


        // 4. Format the data for rendering.
        const stateData: StateData[] = Object.entries(boxesByState).map(([state, cities]) => {
            let totalBoxesForState = 0;
            const cityEntries = Object.entries(cities).map(([city, data]) => {
                const waybillsForCity = Array.from(data.waybillIds)
                    .map(id => allWaybills.find(wb => wb.id === id))
                    .filter((wb): wb is import('@/types/waybill').Waybill => !!wb);
                
                const totalActualWeight = waybillsForCity.reduce((sum, wb) => sum + (wb.packageWeight || 0), 0);
                const totalChargeableWeight = waybillsForCity.reduce((sum, wb) => sum + (wb.chargeableWeight || wb.packageWeight || 0), 0);
                
                totalBoxesForState += data.boxCount;

                return {
                    city,
                    boxCount: data.boxCount,
                    totalActualWeight,
                    totalChargeableWeight
                };
            });

            return {
                state,
                destinations: cityEntries.sort((a, b) => b.boxCount - a.boxCount),
                totalBoxes: totalBoxesForState,
            };
        });

        return stateData.filter(s => s.totalBoxes > 0).sort((a, b) => b.totalBoxes - a.totalBoxes);

    }, [allManifests, allWaybills, manifestsLoaded, waybillsLoaded]);


    if (!manifestsLoaded || !waybillsLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalPendingBoxes = pendingDispatchData.reduce((acc, state) => acc + state.totalBoxes, 0);

    return (
        <div className="space-y-8">
            <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/80 border border-orange-200 dark:border-orange-800 shadow-md">
                <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-100">Hub Outbound Planning</h1>
                <p className="text-orange-600 dark:text-orange-300 mt-1">A state-wise overview of all boxes pending for outbound dispatch from all hubs.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Boxes by Destination State</CardTitle>
                    <CardDescription>
                        There are a total of <span className="font-bold text-primary">{totalPendingBoxes}</span> boxes across {pendingDispatchData.length} state(s) waiting to be dispatched.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {pendingDispatchData.length > 0 ? (
                        pendingDispatchData.map(state => (
                            <div key={state.state} className="border p-4 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                       <Globe className="h-6 w-6 text-primary"/> State: <Badge variant="default" className="text-lg">{state.state}</Badge>
                                    </div>
                                </h3>
                                <div className="grid lg:grid-cols-5 gap-8">
                                    <div className="h-[400px] lg:col-span-3">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={state.destinations} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="city" type="category" width={80} tick={{fontSize: 12}} />
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
                                                    <TableHead>Receiver City</TableHead>
                                                    <TableHead className="text-right">Boxes</TableHead>
                                                    <TableHead className="text-right">Act. Wt.</TableHead>
                                                    <TableHead className="text-right">Chg. Wt.</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {state.destinations.map(data => (
                                                    <TableRow key={data.city}>
                                                        <TableCell className="font-medium">{data.city}</TableCell>
                                                        <TableCell className="text-right font-bold text-primary">{data.boxCount}</TableCell>
                                                        <TableCell className="text-right">{data.totalActualWeight.toFixed(2)} kg</TableCell>
                                                        <TableCell className="text-right">{data.totalChargeableWeight.toFixed(2)} kg</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="lg:col-span-5 text-center py-16 border-2 border-dashed rounded-lg">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Pending Dispatches</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                All verified boxes have been dispatched from all hubs.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
