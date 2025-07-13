
'use client';

import { useWaybills } from '@/hooks/useWaybills';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IndianRupee, Loader2 } from 'lucide-react';
import { Waybill } from '@/types/waybill';
import { format } from 'date-fns';

export default function SalesReportPage() {
  const { waybills, isLoaded } = useWaybills();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const calculateCharge = (waybill: Waybill) => {
    const baseCharge = 150;
    const weightCharge = waybill.packageWeight * 10;
    return baseCharge + weightCharge;
  };

  const totalSales = waybills.reduce((total, waybill) => total + calculateCharge(waybill), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <p className="text-muted-foreground">A detailed breakdown of charges for each waybill.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            Showing {waybills.length} waybill(s).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Receiver Name</TableHead>
                <TableHead>Receiver Pincode</TableHead>
                <TableHead className="text-right">Charge (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waybills.length > 0 ? (
                waybills.map((waybill) => (
                  <TableRow key={waybill.id}>
                    <TableCell className="font-medium">{waybill.waybillNumber}</TableCell>
                    <TableCell>{format(new Date(waybill.shippingDate), 'PP')}</TableCell>
                    <TableCell>{waybill.receiverName}</TableCell>
                    <TableCell>{waybill.receiverPincode}</TableCell>
                    <TableCell className="text-right font-mono">{calculateCharge(waybill).toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No sales data available. Create a waybill to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow className="font-bold text-lg">
                    <TableCell colSpan={4}>Total Sales</TableCell>
                    <TableCell className="text-right font-mono flex items-center justify-end gap-2">
                        <IndianRupee className="h-5 w-5" />
                        {totalSales.toLocaleString('en-IN')}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
