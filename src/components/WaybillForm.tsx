'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Waybill, waybillSchema } from '@/types/waybill';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { User, Phone, Package, Weight, Calendar, ListChecks, Save, XCircle, MapPin, Hash, Box, DollarSign, Clock } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface WaybillFormProps {
  initialData?: Waybill;
  onSave: (data: Waybill) => void;
  onCancel: () => void;
}

const getInitialValues = (initialData?: Waybill): Waybill => {
    if (initialData) {
        return initialData;
    }
    // This is a workaround to satisfy Zod's strict parsing when no initial data is present.
    // We pass an empty object and let Zod populate the default values.
    // We then override any fields that don't have defaults in the schema.
    const defaults = waybillSchema.parse({});
    return {
        ...defaults,
        invoiceNumber: '',
        senderName: '',
        senderAddress: '',
        senderPincode: '',
        senderPhone: '',
        receiverName: '',
        receiverAddress: '',
        receiverPincode: '',
        receiverPhone: '',
        packageDescription: '',
        packageWeight: 0,
        numberOfBoxes: 1,
        shipmentValue: 0,
    };
};

export function WaybillForm({ initialData, onSave, onCancel }: WaybillFormProps) {
  const { toast } = useToast();
  const form = useForm<Waybill>({
    resolver: zodResolver(waybillSchema),
    defaultValues: getInitialValues(initialData),
  });

  const onSubmit = (data: Waybill) => {
    onSave(data);
    toast({
      title: `Waybill ${initialData ? 'Updated' : 'Created'}`,
      description: `Waybill #${data.waybillNumber} has been saved successfully.`,
      variant: 'default',
    });
  };

  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">{children}</div>
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
                            <AddressAutocompleteInput {...field} onValueChange={field.onChange} placeholder="Start typing an address..."/>
                        </FormControl>
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
                            <AddressAutocompleteInput {...field} onValueChange={field.onChange} placeholder="Start typing an address..."/>
                        </FormControl>
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
                name="packageDescription"
                render={({ field }) => (
                  <FormItem className="lg:col-span-3">
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
                    <FormLabel>Shipment Value ($)</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 150.00" {...field} onChange={e => field.onChange(+e.target.value)} className="pl-10" />
                      </FormControl>
                      <IconWrapper><DollarSign /></IconWrapper>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <SelectItem value="In Transit">In Transit</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <FormField
                    control={form.control}
                    name="shippingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Date</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="shippingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Time</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type="time" {...field} className="pl-10" />
                          </FormControl>
                           <IconWrapper><Clock /></IconWrapper>
                        </div>
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
            {initialData ? 'Update Waybill' : 'Create Waybill'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
