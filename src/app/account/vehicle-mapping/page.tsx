
'use client';

import { useMemo } from 'react';
import { useManifests } from '@/hooks/useManifests';
import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Map as MapIcon, Package, Weight, Cpu, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { Badge } from '@/components/ui/badge';
import { Manifest } from '@/types/manifest';

interface StateData {
    state: string;
    boxCount: number;
    totalActualWeight: number;
    totalChargeableWeight: number;
}

interface HubData {
    hubName: string;
    hubCity: string;
    states: StateData[];
    totalBoxes: number;
}


export default function VehicleMappingPage() {
    const { allManifests, isLoaded: manifestsLoaded } = useManifests();
    const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();
    const { users, isLoading: usersLoaded } = useAuth();
    const { associations, isLoaded: associationsLoaded } = usePartnerAssociations();

    const pendingDispatchData = useMemo((): HubData[] => {
        if (!manifestsLoaded || !waybillsLoaded || !usersLoaded || !associationsLoaded) return [];

        // 1. Get all boxes that have been dispatched from a hub.
        const dispatchedFromHubBoxIds = new Set<string>();
        allManifests.forEach(m => {
            if (m.origin === 'hub') {
                (m.verifiedBoxIds || []).forEach(boxId => dispatchedFromHubBoxIds.add(boxId));
            }
        });

        // 2. Group all verified boxes by the hub that received them.
        const boxesByReceivingHub: Record<string, Set<string>> = {};
        allManifests.forEach(m => {
            let destinationHubCode: string | undefined = undefined;

            if (m.origin === 'booking' && m.creatorPartnerCode) {
                destinationHubCode = associations.bookingToHub[m.creatorPartnerCode];
            } else if (m.origin === 'hub' && m.destinationHubCode) {
                destinationHubCode = m.destinationHubCode;
            }

            if (destinationHubCode && m.verifiedBoxIds) {
                if (!boxesByReceivingHub[destinationHubCode]) {
                    boxesByReceivingHub[destinationHubCode] = new Set<string>();
                }
                m.verifiedBoxIds.forEach(boxId => {
                    // Only add the box if it hasn't been dispatched onward from another hub
                    if (!dispatchedFromHubBoxIds.has(boxId)) {
                        boxesByReceivingHub[destinationHubCode].add(boxId);
                    }
                });
            }
        });

        // 3. Process the grouped boxes to get state-wise data.
        const hubData: HubData[] = Object.entries(boxesByReceivingHub).map(([hubCode, pendingBoxIds]) => {
            const hubUser = users.find(u => u.partnerCode === hubCode);
            const statesData: Record<string, { boxCount: number; waybillIds: Set<string> }> = {};

            pendingBoxIds.forEach(boxId => {
                const waybillNumber = boxId.substring(0, boxId.lastIndexOf('-'));
                const waybill = allWaybills.find(wb => wb.waybillNumber === waybillNumber);

                if (waybill) {
                    const state = waybill.receiverState.toUpperCase();
                    if (!statesData[state]) {
                        statesData[state] = { boxCount: 0, waybillIds: new Set() };
                    }
                    statesData[state].boxCount++;
                    statesData[state].waybillIds.add(waybill.id);
                }
            });

            const stateEntries = Object.entries(statesData).map(([state, data]) => {
                const waybillsForState = Array.from(data.waybillIds)
                    .map(id => allWaybills.find(wb => wb.id === id))
                    .filter(wb => wb);
                
                const totalActualWeight = waybillsForState.reduce((sum, wb) => sum + (wb?.packageWeight || 0), 0);
                const totalChargeableWeight = waybillsForState.reduce((sum, wb) => sum + (wb?.chargeableWeight || 0), 0);

                return {
                    state,
                    boxCount: data.boxCount,
                    totalActualWeight,
                    totalChargeableWeight
                };
            });

            return {
                hubName: hubUser?.partnerName || hubCode,
                hubCity: hubUser?.city || 'N/A',
                states: stateEntries.sort((a, b) => b.boxCount - a.boxCount),
                totalBoxes: pendingBoxIds.size,
            };
        });

        return hubData.filter(h => h.totalBoxes > 0).sort((a, b) => b.totalBoxes - a.totalBoxes);

    }, [allManifests, allWaybills, users, associations, manifestsLoaded, waybillsLoaded, usersLoaded, associationsLoaded]);


    if (!manifestsLoaded || !waybillsLoaded || !usersLoaded || !associationsLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const totalPendingBoxes = pendingDispatchData.reduce((acc, hub) => acc + hub.totalBoxes, 0);

    return (
        <div className="space-y-8">
            <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/80 border border-orange-200 dark:border-orange-800 shadow-md">
                <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-100">Hub Outbound Planning</h1>
                <p className="text-orange-600 dark:text-orange-300 mt-1">A hub and state-wise overview of boxes and weight pending for outbound dispatch.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Pending Boxes by Hub and State</CardTitle>
                    <CardDescription>
                        There are a total of <span className="font-bold text-primary">{totalPendingBoxes}</span> boxes across {pendingDispatchData.length} hub(s) waiting to be dispatched.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {pendingDispatchData.length > 0 ? (
                        pendingDispatchData.map(hub => (
                            <div key={hub.hubName} className="border p-4 rounded-lg">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                       <Cpu className="h-6 w-6 text-primary"/> Hub: <Badge variant="default" className="text-lg">{hub.hubName}</Badge>
                                    </div>
                                     <div className="flex items-center gap-2">
                                       <Building className="h-5 w-5 text-muted-foreground"/> City: <Badge variant="secondary" className="text-md">{hub.hubCity}</Badge>
                                    </div>
                                </h3>
                                <div className="grid lg:grid-cols-5 gap-8">
                                    <div className="h-[400px] lg:col-span-3">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={hub.states} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                                {hub.states.map(data => (
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

    