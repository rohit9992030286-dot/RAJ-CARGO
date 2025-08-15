
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Waybill, waybillFormSchema, WaybillFormData } from '@/types/waybill';
import { User, Phone, Package, Weight, Calendar, ListChecks, Save, XCircle, MapPin, Hash, Box, IndianRupee, Clock, Building, Globe, Loader2, FileText, Truck, CreditCard, Wallet } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useState, useEffect, useMemo } from 'react';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

const getInitialValues = (initialData?: Waybill): WaybillFormData => {
    const defaults = {
        waybillNumber: '',
        invoiceNumber: '',
        tripNo: '',
        eWayBillNo: '',
        eWayBillExpiryDate: '',
        senderName: '',
        senderAddress: '',
        senderCity: '',
        senderPincode: '',
        senderPhone: '',
        receiverName: '',
        receiverAddress: '',
        receiverCity: '',
        receiverPincode: '',
        receiverPhone: '',
        receiverState: '',
        packageDescription: '',
        packageWeight: 0,
        numberOfBoxes: 1,
        shipmentValue: 0,
        shippingDate: new Date().toISOString().split('T')[0],
        shippingTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'Pending' as 'Pending',
        partnerCode: '',
        companyCode: '',
        paymentType: 'Credit' as 'Credit',
    };
    
    if (initialData) {
        const { id, ...formData } = initialData;
        return { ...defaults, ...formData };
    }
    
    return defaults;
};

interface WaybillFormProps {
  initialData?: Waybill;
  onSave: (waybill: Waybill) => boolean;
  onCancel: () => void;
}


export function WaybillForm({ initialData, onSave, onCancel }: WaybillFormProps) {
  const { toast } = useToast();
  const { getAvailableInventoryForCompany, isInventoryLoaded } = useWaybillInventory();
  const { user } = useAuth();
  const { companies, getCompanyByCode, isLoaded: companiesLoaded } = useCompanies();

  const form = useForm<WaybillFormData>({
    resolver: zodResolver(waybillFormSchema),
    defaultValues: getInitialValues(initialData),
    mode: 'onChange'
  });
  
  const shipmentValue = useWatch({
      control: form.control,
      name: 'shipmentValue'
  });
  
  const selectedPaymentType = useWatch({
      control: form.control,
      name: 'paymentType'
  });

  const availableInventory = useMemo(() => {
    if (selectedPaymentType === 'Credit') {
        // For credit, only show inventory for the user's assigned company
        return getAvailableInventoryForCompany(user?.companyCode, false);
    }
    // For "To Pay", show only market inventory
    return getAvailableInventoryForCompany(undefined, true);
  }, [getAvailableInventoryForCompany, selectedPaymentType, user?.companyCode]);


  useEffect(() => {
    const values = getInitialValues(initialData);
    if (!initialData) {
      try {
        let senderDetails = null;
        if (user?.companyCode) {
            const company = getCompanyByCode(user.companyCode);
            if (company) {
                senderDetails = {
                    senderName: company.senderName,
                    senderAddress: company.senderAddress,
                    senderCity: company.senderCity,
                    senderPincode: company.senderPincode,
                    senderPhone: company.senderPhone,
                };
            }
        } else {
            const storedSender = localStorage.getItem('rajcargo-defaultSender');
            if (storedSender) {
              senderDetails = JSON.parse(storedSender);
            }
        }
        
        if (senderDetails) {
            Object.assign(values, senderDetails);
        }

      } catch (error) {
        console.error('Could not get default sender from local storage', error);
      }
    }
    form.reset(values);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, user, companiesLoaded]);
  
  useEffect(() => {
    // When the payment type changes, if the currently selected waybill number is no longer
    // in the available list, reset it.
    const currentWb = form.getValues('waybillNumber');
    if (currentWb && !availableInventory.some(inv => inv.waybillNumber === currentWb)) {
        form.setValue('waybillNumber', '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentType, availableInventory]);

  const onSubmit = (data: WaybillFormData) => {
    const waybillToSave: Waybill = {
        ...data,
        id: initialData?.id || crypto.randomUUID(),
        partnerCode: user?.partnerCode,
    };

    const success = onSave(waybillToSave);

    if (success) {
        toast({
            title: `Waybill ${initialData ? 'Updated' : 'Created'}`,
            description: `Waybill #${data.waybillNumber} has been saved successfully.`,
            variant: 'default',
        });
    }
  };

  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">
      {children}
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Sender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Payment Type</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                        >
                        <FormItem>
                            <FormControl>
                                <RadioGroupItem value="Credit" id="credit" className="sr-only" />
                            </FormControl>
                             <Label htmlFor="credit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                <CreditCard className="mb-3 h-6 w-6" />
                                Credit
                             </Label>
                        </FormItem>
                        <FormItem>
                           <FormControl>
                             <RadioGroupItem value="To Pay" id="topay" className="sr-only" />
                           </FormControl>
                            <Label htmlFor="topay" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                               <Wallet className="mb-3 h-6 w-6" />
                               To Pay
                            </Label>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><User /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                     <div className="relative">
                        <FormControl>
                            <Input placeholder="Enter address" {...field} className="pl-10" />
                        </FormControl>
                        <IconWrapper><MapPin /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="senderPincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., 10001" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><MapPin /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., New York" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Building /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senderPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                     <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., (555) 123-4567" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Phone /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Receiver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="receiverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., Jane Smith" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><User /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                     <div className="relative">
                        <FormControl>
                           <Input placeholder="Enter address" {...field} className="pl-10" />
                        </FormControl>
                         <IconWrapper><MapPin /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="receiverPincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., 90001" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><MapPin /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., Los Angeles" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Building /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., California" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Globe /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="receiverPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                     <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g., (555) 987-6543" {...field} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Phone /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                    control={form.control}
                    name="companyCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                <FormControl>
                                    <div className="relative">
                                    <SelectTrigger className="pl-10">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <IconWrapper><Building /></IconWrapper>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {companies.map(c => <SelectItem key={c.id} value={c.companyCode!}>{c.companyName} ({c.companyCode})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="waybillNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Waybill Number</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!initialData}>
                            <FormControl>
                                <div className="relative">
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder={!isInventoryLoaded ? "Loading..." : "Select from inventory"} />
                                </SelectTrigger>
                                <IconWrapper>{isInventoryLoaded ? <Hash /> : <Loader2 className="animate-spin" />}</IconWrapper>
                                </div>
                            </FormControl>
                            <SelectContent>
                                {initialData && <SelectItem value={initialData.waybillNumber}>{initialData.waybillNumber}</SelectItem>}
                                {availableInventory.map(item => (
                                    <SelectItem key={item.waybillNumber} value={item.waybillNumber}>
                                        {item.waybillNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <div className="relative">
                        <FormControl>
                            <Input placeholder="e.g., INV-2024-001" {...field} className="pl-10" />
                        </FormControl>
                        <IconWrapper><Hash /></IconWrapper>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="tripNo"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Trip No.</FormLabel>
                        <div className="relative">
                        <FormControl>
                            <Input placeholder="e.g., T-101" {...field} className="pl-10" />
                        </FormControl>
                        <IconWrapper><Truck /></IconWrapper>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <FormField
                control={form.control}
                name="packageDescription"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Package Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Contains books and electronics"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
               <FormField
                control={form.control}
                name="numberOfBoxes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Boxes</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1" {...field} onChange={e => field.onChange(+e.target.value)} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Box /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="packageWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Weight (kg)</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} onChange={e => field.onChange(+e.target.value)} className="pl-10" />
                      </FormControl>
                      <IconWrapper><Weight /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipmentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment Value (₹)</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 150.00" {...field} onChange={e => field.onChange(+e.target.value)} className="pl-10" />
                      </FormControl>
                      <IconWrapper><IndianRupee /></IconWrapper>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div />
            </div>
             {shipmentValue >= 50000 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="eWayBillNo"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                            E-Way Bill No
                            <span className="text-destructive">*</span>
                            </FormLabel>
                            <div className="relative">
                            <FormControl>
                                <Input placeholder="E-Way Bill Number" {...field} className="pl-10" />
                            </FormControl>
                            <IconWrapper><FileText /></IconWrapper>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="eWayBillExpiryDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                            E-Way Expiry
                            <span className="text-destructive">*</span>
                            </FormLabel>
                            <div className="relative">
                            <FormControl>
                                <Input type="date" {...field} className="pl-10" />
                            </FormControl>
                            <IconWrapper><Calendar /></IconWrapper>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
             )}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <FormField
                    control={form.control}
                    name="shippingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Date</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type="date" {...field} className="pl-10" disabled />
                          </FormControl>
                           <IconWrapper><Calendar /></IconWrapper>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Time</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type="time" {...field} className="pl-10" disabled />
                          </FormControl>
                           <IconWrapper><Clock /></IconWrapper>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                            <FormControl>
                            <div className="relative">
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <IconWrapper><ListChecks /></IconWrapper>
                            </div>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Waybill
          </Button>
        </div>
      </form>
    </Form>
  );
}
