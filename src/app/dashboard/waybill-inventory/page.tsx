
'use client';

import { useState } from 'react';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Warehouse, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export default function WaybillInventoryPage() {
  const { waybillInventory, addWaybillToInventory, removeWaybillFromInventory, isInventoryLoaded } = useWaybillInventory();
  const [newWaybillNumber, setNewWaybillNumber] = useState('');
  const { toast } = useToast();

  const handleAddWaybill = () => {
    if (!newWaybillNumber.trim()) {
      toast({ title: "Waybill number cannot be empty", variant: "destructive" });
      return;
    }
    const success = addWaybillToInventory(newWaybillNumber);
    if (success) {
      toast({ title: "Waybill number added to inventory" });
      setNewWaybillNumber('');
    }
  };

  const handleDeleteWaybill = (waybillNumber: string) => {
    removeWaybillFromInventory(waybillNumber);
    toast({ title: "Waybill number removed from inventory" });
  };

  if (!isInventoryLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Waybill Inventory</h1>
        <p className="text-muted-foreground">Manage your pre-allocated waybill numbers.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Waybill Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter new waybill number"
              value={newWaybillNumber}
              onChange={(e) => setNewWaybillNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWaybill()}
            />
            <Button onClick={handleAddWaybill}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Waybill Numbers</CardTitle>
          <CardDescription>You have {waybillInventory.length} waybill number(s) available in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill Number</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waybillInventory.length > 0 ? (
                waybillInventory.map((wbNumber) => (
                  <TableRow key={wbNumber}>
                    <TableCell className="font-medium">{wbNumber}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Delete</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                  This will permanently delete the waybill number #{wbNumber} from your inventory.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteWaybill(wbNumber)}>
                                  Continue
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    <div className="text-center py-8">
                        <Warehouse className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Inventory is Empty</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Add waybill numbers to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
