
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pencil, Trash2, Truck, PlusCircle, Printer, MoreHorizontal, Lock, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInHours, isBefore } from 'date-fns';


interface WaybillListProps {
  waybills: Waybill[];
  selectedWaybillIds: string[];
  onSelectionChange: (id: string, isSelected: boolean) => void;
  onSelectAllChange: (selectAll: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Waybill['status']) => void;
  onCreateNew: () => void;
}

const statusVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Delivered: 'default',
  'In Transit': 'secondary',
  'Out for Delivery': 'secondary',
  Returned: 'destructive',
  Pending: 'outline',
  Cancelled: 'destructive',
};

const statusOptions: Waybill['status'][] = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export function WaybillList({ 
    waybills, 
    selectedWaybillIds, 
    onSelectionChange, 
    onSelectAllChange,
    onEdit, 
    onDelete, 
    onUpdateStatus,
    onCreateNew 
}: WaybillListProps) {

  const handlePrint = (id: string) => {
    window.open(`/print/waybill/${id}`, '_blank');
  };

  const allOnPageSelected = waybills.length > 0 && waybills.every(w => selectedWaybillIds.includes(w.id));
  
  const checkEWayBillExpiry = (expiryDateString?: string) => {
    if (!expiryDateString) return null;
    const expiryDate = new Date(expiryDateString);
    const now = new Date();
    if (isBefore(expiryDate, now)) {
        return { message: "E-Way Bill Expired!", isCritical: true };
    }
    const hoursLeft = differenceInHours(expiryDate, now);
    if (hoursLeft <= 48) {
        return { message: `E-Way Bill expires in ${hoursLeft} hours.`, isCritical: false };
    }
    return null;
  }


  if (waybills.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Waybills Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">Your search returned no results, or you haven't created any waybills yet.</p>
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
    <div className="border rounded-md">
       <TooltipProvider>
       <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">
                       <Checkbox 
                         checked={allOnPageSelected}
                         onCheckedChange={(checked) => onSelectAllChange(!!checked)}
                         aria-label="Select all on this page"
                       />
                    </TableHead>
                    <TableHead>Waybill #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {waybills.map((waybill) => {
                    const isLocked = waybill.status === 'In Transit' || waybill.status === 'Delivered' || waybill.status === 'Out for Delivery';
                    const expiryInfo = checkEWayBillExpiry(waybill.eWayBillExpiryDate);
                    return (
                        <TableRow key={waybill.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedWaybillIds.includes(waybill.id)}
                                    onCheckedChange={(checked) => onSelectionChange(waybill.id, !!checked)}
                                    aria-label={`Select waybill ${waybill.waybillNumber}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                                {waybill.waybillNumber}
                                {expiryInfo && (
                                     <Tooltip>
                                        <TooltipTrigger>
                                            <AlertTriangle className={cn("h-4 w-4", expiryInfo.isCritical ? "text-destructive" : "text-amber-500")} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{expiryInfo.message}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TableCell>
                            <TableCell>{format(new Date(waybill.shippingDate), 'PP')}</TableCell>
                            <TableCell>{waybill.senderName}</TableCell>
                            <TableCell>{waybill.receiverName}</TableCell>
                            <TableCell>{waybill.receiverCity}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-[120px] justify-between" disabled>
                                            <Badge variant={statusVariantMap[waybill.status] || 'default'} className="p-1">
                                                {waybill.status}
                                            </Badge>
                                             <MoreHorizontal className="w-4 h-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(waybill.id)} disabled={isLocked}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePrint(waybill.id)}>
                                            <Printer className="mr-2 h-4 w-4" /> Print Waybill
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem 
                                                    onSelect={(e) => e.preventDefault()} 
                                                    className="text-destructive focus:bg-destructive/10" 
                                                    disabled={isLocked}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
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
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
       </Table>
       </TooltipProvider>
    </div>
  );
}
