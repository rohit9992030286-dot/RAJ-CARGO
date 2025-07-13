
'use client';

import { useState } from 'react';
import { Waybill } from '@/types/waybill';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, User, MapPin, Truck, Package, PlusCircle, Box, DollarSign, Printer, ScanLine, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';


interface WaybillListProps {
  waybills: Waybill[];
  selectedWaybillIds: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Delivered: 'default',
  'In Transit': 'secondary',
  Pending: 'outline',
  Cancelled: 'destructive',
};

export function WaybillList({ waybills, selectedWaybillIds, onSelectionChange, onEdit, onDelete, onCreateNew }: WaybillListProps) {
  const [selectedWaybillIdForSticker, setSelectedWaybillIdForSticker] = useState<string | null>(null);
  const [storeCode, setStoreCode] = useState('');
  const [isStoreCodeDialogOpen, setIsStoreCodeDialogOpen] = useState(false);

  const handlePrint = (id: string) => {
    window.open(`/print/waybill/${id}`, '_blank');
  };

  const openStoreCodeDialog = (id: string) => {
    setSelectedWaybillIdForSticker(id);
    setStoreCode(''); // Reset for next use
    setIsStoreCodeDialogOpen(true);
  };
  
  const handlePrintSticker = () => {
    if (selectedWaybillIdForSticker) {
      const waybill = waybills.find(w => w.id === selectedWaybillIdForSticker);
      if (!waybill) return;

      const totalBoxes = waybill.numberOfBoxes || 1;
      for (let i = 1; i <= totalBoxes; i++) {
        const url = `/print/sticker/${selectedWaybillIdForSticker}?storeCode=${encodeURIComponent(storeCode)}&boxNumber=${i}&totalBoxes=${totalBoxes}`;
        window.open(url, '_blank');
      }
      
      setIsStoreCodeDialogOpen(false);
    }
  };


  if (waybills.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Waybills Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first waybill.</p>
        <div className="mt-6">
          <Button onClick={onCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create First Waybill
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {waybills.map((waybill) => {
          const isLocked = waybill.status === 'In Transit' || waybill.status === 'Delivered' || waybill.status === 'Cancelled';
          return (
          <Card key={waybill.id} className={cn("flex flex-col transition-all", selectedWaybillIds.includes(waybill.id) && "ring-2 ring-primary")}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={`select-${waybill.id}`}
                    checked={selectedWaybillIds.includes(waybill.id)}
                    onCheckedChange={(checked) => onSelectionChange(waybill.id, !!checked)}
                    aria-label={`Select waybill ${waybill.waybillNumber}`}
                  />
                  <div>
                    <CardTitle className="text-lg">Waybill #{waybill.waybillNumber}</CardTitle>
                    <CardDescription>
                      Invoice #{waybill.invoiceNumber}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={statusVariantMap[waybill.status] || 'default'}>
                  {isLocked && <Lock className="mr-1 h-3 w-3" />}
                  {waybill.status}
                </Badge>
              </div>
               <CardDescription className="pt-2">
                    Shipped on: {new Date(waybill.shippingDate).toLocaleDateString()} at {waybill.shippingTime}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">From:</h4>
                <p className="flex items-start gap-2"><User className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> {waybill.senderName}</p>
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> {waybill.senderAddress}, {waybill.senderCity}, {waybill.senderPincode}</p>
              </div>
               <div className="space-y-2">
                <h4 className="font-semibold text-primary">To:</h4>
                <p className="flex items-start gap-2"><User className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> {waybill.receiverName}</p>
                <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" /> {waybill.receiverAddress}, {waybill.receiverCity}, {waybill.receiverPincode}</p>
              </div>
               <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Package Details:</h4>
                   <p className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    {waybill.packageDescription}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6">
                      <p className="flex items-center gap-2"><Box className="h-4 w-4 shrink-0 text-muted-foreground" /> {waybill.numberOfBoxes} {waybill.numberOfBoxes > 1 ? 'boxes' : 'box'}</p>
                      <p className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0 text-muted-foreground" /> {waybill.packageWeight} kg</p>
                      <p className="flex items-center gap-2"><DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" /> ${waybill.shipmentValue.toFixed(2)}</p>
                  </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 flex-wrap">
               <Button variant="ghost" size="sm" onClick={() => handlePrint(waybill.id)}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openStoreCodeDialog(waybill.id)}>
                <ScanLine className="mr-2 h-4 w-4" />
                Sticker
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(waybill.id)} disabled={isLocked}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isLocked}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the waybill #{waybill.waybillNumber}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(waybill.id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        )})}
      </div>
      
      <Dialog open={isStoreCodeDialogOpen} onOpenChange={setIsStoreCodeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Store Code</DialogTitle>
            <DialogDescription>
              Please enter the store code to include it on the sticker printout. This is optional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="store-code" className="text-right">
                Store Code
              </Label>
              <Input
                id="store-code"
                value={storeCode}
                onChange={(e) => setStoreCode(e.target.value)}
                className="col-span-3"
                placeholder="Optional store code"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePrintSticker}>Print Sticker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
