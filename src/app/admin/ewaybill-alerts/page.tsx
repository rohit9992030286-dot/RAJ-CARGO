
'use client';

import { useMemo } from 'react';
import { useWaybills } from '@/hooks/useWaybills';
import { Waybill } from '@/types/waybill';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react';
import { format, isBefore, differenceInHours, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AlertWaybill extends Waybill {
    hoursLeft: number;
    isExpired: boolean;
}

export default function EWayBillAlertsPage() {
    const { allWaybills, isLoaded } = useWaybills();

    const alerts = useMemo(() => {
        if (!isLoaded) return [];

        const now = new Date();
        const relevantWaybills: AlertWaybill[] = allWaybills
            .filter(wb => wb.eWayBillNo && wb.eWayBillExpiryDate)
            .map(wb => {
                const expiryDate = new Date(wb.eWayBillExpiryDate!);
                return {
                    ...wb,
                    hoursLeft: differenceInHours(expiryDate, now),
                    isExpired: isBefore(expiryDate, now),
                };
            })
            .filter(wb => wb.isExpired || wb.hoursLeft <= 48); // Expired or expiring within 48 hours

        return alerts.sort((a,b) => a.hoursLeft - b.hoursLeft);

    }, [allWaybills, isLoaded]);
    
    const expiredBills = alerts.filter(a => a.isExpired);
    const expiringSoonBills = alerts.filter(a => !a.isExpired);


    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">E-Way Bill Expiry Alerts</h1>
                <p className="text-muted-foreground">Monitor and manage shipments with expiring E-Way Bills.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6"/>
                        Expired E-Way Bills ({expiredBills.length})
                    </CardTitle>
                    <CardDescription>These shipments have an expired E-Way Bill and require immediate attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waybill #</TableHead>
                                <TableHead>Partner</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Expired</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {expiredBills.length > 0 ? (
                                expiredBills.map(wb => (
                                    <TableRow key={wb.id} className="bg-destructive/10">
                                        <TableCell className="font-mono font-semibold">{wb.waybillNumber}</TableCell>
                                        <TableCell><Badge variant="outline">{wb.partnerCode}</Badge></TableCell>
                                        <TableCell>{format(new Date(wb.eWayBillExpiryDate!), 'PPp')}</TableCell>
                                        <TableCell className="font-medium text-destructive">
                                            {formatDistanceToNow(new Date(wb.eWayBillExpiryDate!), { addSuffix: true })}
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                               <TableRow>
                                   <TableCell colSpan={4} className="text-center py-10">
                                       <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                           <CheckCircle className="h-10 w-10 text-green-500" />
                                           <p className="font-semibold">No Expired E-Way Bills</p>
                                           <p className="text-sm">All active E-Way Bills are valid.</p>
                                       </div>
                                   </TableCell>
                               </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                        <Clock className="h-6 w-6"/>
                        E-Way Bills Expiring Soon ({expiringSoonBills.length})
                    </CardTitle>
                    <CardDescription>These shipments have an E-Way Bill expiring within the next 48 hours.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waybill #</TableHead>
                                <TableHead>Partner</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead>Time Left</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {expiringSoonBills.length > 0 ? (
                                expiringSoonBills.map(wb => (
                                    <TableRow key={wb.id} className="bg-amber-500/10">
                                        <TableCell className="font-mono font-semibold">{wb.waybillNumber}</TableCell>
                                        <TableCell><Badge variant="outline">{wb.partnerCode}</Badge></TableCell>
                                        <TableCell>{format(new Date(wb.eWayBillExpiryDate!), 'PPp')}</TableCell>
                                        <TableCell className="font-medium text-amber-700">
                                            {formatDistanceToNow(new Date(wb.eWayBillExpiryDate!), { addSuffix: true })}
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                               <TableRow>
                                   <TableCell colSpan={4} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                           <CheckCircle className="h-10 w-10 text-green-500" />
                                           <p className="font-semibold">No E-Way Bills Expiring Soon</p>
                                           <p className="text-sm">No shipments require immediate attention.</p>
                                       </div>
                                   </TableCell>
                               </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
