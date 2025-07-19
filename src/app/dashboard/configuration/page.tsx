
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, PlusCircle, Hash, Trash2, Loader2, Building, Phone, MapPin, User } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WaybillInventorySettingsProps {
    waybillInventory: string[];
    addWaybillToInventory: (waybillNumber: string) => boolean;
    removeWaybillFromInventory: (waybillNumber: string) => void;
}

function WaybillInventorySettings({ waybillInventory, addWaybillToInventory, removeWaybillFromInventory }: WaybillInventorySettingsProps) {
  const [newWaybillNumber, setNewWaybillNumber] = useState('');
  const { toast } = useToast();

  const handleAddRange = () => {
    const input = newWaybillNumber.trim();
    if (!input) {
      toast({ title: "Input cannot be empty", variant: "destructive" });
      return;
    }

    const rangeMatch = input.match(/^(\d+)-(\d+)$/);
    const prefixMatch = input.match(/^([a-zA-Z-]+)(\d+)-(\d+)$/);
    
    let addedCount = 0;
    let skippedCount = 0;

    const addSingle = (num: string) => {
        if (addWaybillToInventory(num)) {
            addedCount++;
        } else {
            skippedCount++;
        }
    }

    if (rangeMatch || prefixMatch) {
      let prefix = '';
      let start, end;

      if(prefixMatch) {
        prefix = prefixMatch[1];
        start = parseInt(prefixMatch[2], 10);
        end = parseInt(prefixMatch[3], 10);
      } else if (rangeMatch) {
        start = parseInt(rangeMatch[1], 10);
        end = parseInt(rangeMatch[2], 10);
      } else {
          toast({ title: "Invalid format", description: "Please use '101-200' or 'SW-101-200'.", variant: "destructive" });
          return;
      }

      if (isNaN(start) || isNaN(end) || start > end) {
        toast({ title: "Invalid Range", description: "Start number must be less than or equal to the end number.", variant: "destructive" });
        return;
      }
      
      const rangeSize = end - start + 1;
      if (rangeSize > 500) {
        toast({ title: "Range Too Large", description: "Please add a maximum of 500 numbers at a time.", variant: "destructive"});
        return;
      }

      for (let i = start; i <= end; i++) {
        addSingle(`${prefix}${i}`);
      }
    } else if (/^[a-zA-Z-]*\d+$/.test(input)) {
        addSingle(input);
    } else {
      toast({ title: "Invalid Format", description: "Please enter a single number (e.g., SW-101) or a range (e.g., SW-101-200).", variant: "destructive" });
      return;
    }

    if (addedCount > 0) {
        toast({ title: "Inventory Updated", description: `${addedCount} number(s) added. ${skippedCount} skipped (duplicates).` });
    } else if (skippedCount > 0) {
        toast({ title: "No Numbers Added", description: `All ${skippedCount} number(s) were duplicates.`, variant: "default" });
    }
    
    setNewWaybillNumber('');
  };


  const handleDeleteWaybill = (waybillNumber: string) => {
    removeWaybillFromInventory(waybillNumber);
    toast({ title: "Waybill number removed from inventory" });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Waybill Inventory</CardTitle>
        <CardDescription>Manage your pre-allocated waybill numbers. Enter a single number (e.g., SW-101) or a range (e.g., SW-101-200).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter number or range (e.g., 101-200)"
            value={newWaybillNumber}
            onChange={(e) => setNewWaybillNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRange()}
          />
          <Button onClick={handleAddRange}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add to Inventory
          </Button>
        </div>
        <div className="border rounded-md max-h-60 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50">
              <TableRow>
                <TableHead>Available Waybill Numbers ({waybillInventory.length})</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waybillInventory.length > 0 ? (
                waybillInventory.map((wbNumber) => (
                  <TableRow key={wbNumber}>
                    <TableCell className="font-medium flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground" /> {wbNumber}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteWaybill(wbNumber)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    Inventory is empty.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function ConfigurationPageContent() {
    const { isInventoryLoaded, waybillInventory, addWaybillToInventory, removeWaybillFromInventory } = useWaybillInventory();
    const { toast } = useToast();

    const senderForm = useForm({
        defaultValues: {
        senderName: '',
        senderAddress: '',
        senderCity: '',
        senderPincode: '',
        senderPhone: '',
        },
    });

    useEffect(() => {
        try {
            const sender = JSON.parse(localStorage.getItem('swiftway-defaultSender') || '{}');
            senderForm.reset(sender);
        } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSenderSubmit = (data: any) => {
        try {
            localStorage.setItem('swiftway-defaultSender', JSON.stringify(data));
            toast({ title: 'Default Sender Saved', description: 'This information will be pre-filled in new waybills.'});
        } catch (error) {
            toast({ title: 'Save Failed', description: 'Could not save default sender information.', variant: 'destructive'});
        }
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
        <h1 className="text-3xl font-bold">Configuration</h1>
        <p className="text-muted-foreground">Manage waybill inventory and default sender information.</p>
      </div>

       <WaybillInventorySettings 
        waybillInventory={waybillInventory}
        addWaybillToInventory={addWaybillToInventory}
        removeWaybillFromInventory={removeWaybillFromInventory}
      />

      <Card>
        <Form {...senderForm}>
            <form onSubmit={senderForm.handleSubmit(onSenderSubmit)}>
                <CardHeader>
                    <CardTitle>Default Sender Information</CardTitle>
                    <CardDescription>This info will be pre-filled when creating new waybills.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                     <FormField
                        control={senderForm.control}
                        name="senderName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Name</FormLabel>
                                 <div className="relative">
                                    <FormControl><Input {...field} className="pl-10" /></FormControl>
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={senderForm.control}
                        name="senderPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Phone</FormLabel>
                                 <div className="relative">
                                    <FormControl><Input {...field} className="pl-10" /></FormControl>
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderAddress"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Sender Address</FormLabel>
                                <div className="relative">
                                <FormControl><Input placeholder="Enter address" {...field} className="pl-10" /></FormControl>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderPincode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Pincode</FormLabel>
                                <div className="relative">
                                <FormControl><Input {...field} className="pl-10" /></FormControl>
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderCity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender City</FormLabel>
                                 <div className="relative">
                                <FormControl><Input {...field} className="pl-10" /></FormControl>
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="ml-auto">
                        <Save className="mr-2 h-4 w-4" /> Save Default Sender
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>

    </div>
  );
}


export default function ConfigurationPage() {
    return <ConfigurationPageContent />;
}
