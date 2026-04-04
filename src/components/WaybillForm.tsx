
'use client';

import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Waybill, waybillFormSchema, WaybillFormData } from '@/types/waybill';
import { User, Phone, Package, Weight, Calendar, ListChecks, Save, XCircle, MapPin, Hash, Box, IndianRupee, Clock, Building, Globe, Loader2, FileText, Truck, CreditCard, Wallet, Move3d, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { InventoryItem } from '@/types/inventory';

const getInitialValues = (initialData?: Waybill): WaybillFormData => {
    const defaults: WaybillFormData = {
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
        senderState: '',
        receiverName: '',
        receiverAddress: '',
        receiverCity: '',
        receiverPincode: '',
        receiverPhone: '',
        receiverState: '',
        packageDescription: '',
        packageWeight: 0,
        chargeableWeight: 0,
        numberOfBoxes: 1,
        dimensions: [{ length: 0, breadth: 0, height: 0 }],
        shipmentValue: 0,
        shippingDate: new Date().toISOString().split('T')[0],
        shippingTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: 'Pending' as 'Pending',
        partnerCode: '',
        companyCode: '',
        paymentType: 'To Pay' as 'Credit' | 'To Pay',
    };
    
    if (initialData) {
        const { id, ...formData } = initialData;
        return { 
            ...defaults, 
            ...formData,
            // Ensure dimensions is always an array of objects
            dimensions: Array.isArray(initialData.dimensions) && initialData.dimensions.length > 0
                ? initialData.dimensions
                : [{ length: 0, breadth: 0, height: 0 }]
        };
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
  const { user } = useAuth();
  const { companies, getCompanyByCode, isLoaded: companiesLoaded } = useCompanies();
  const { getAvailableInventoryForCompany } = useWaybillInventory();
  const [availableWaybills, setAvailableWaybills] = useState<InventoryItem[]>([]);

  const form = useForm<WaybillFormData>({
    resolver: zodResolver(waybillFormSchema),
    defaultValues: getInitialValues(initialData),
    mode: 'onChange'
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dimensions"
  });

  const watchedFields = useWatch({
      control: form.control,
      name: ['shipmentValue', 'companyCode', 'dimensions', 'numberOfBoxes']
  });
  const [shipmentValue, selectedCompanyCode, dimensions, numberOfBoxes] = watchedFields;

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyCode || selectedCompanyCode === 'none') return null;
    return getCompanyByCode(selectedCompanyCode);
  }, [selectedCompanyCode, getCompanyByCode]);
  
  useEffect(() => {
    const currentBoxCount = dimensions?.length || 0;
    const targetBoxCount = numberOfBoxes || 1;

    if (currentBoxCount < targetBoxCount) {
        for (let i = currentBoxCount; i < targetBoxCount; i++) {
            append({ length: 0, breadth: 0, height: 0 });
        }
    } else if (currentBoxCount > targetBoxCount) {
        for (let i = currentBoxCount; i > targetBoxCount; i--) {
            remove(i - 1);
        }
    }
  }, [numberOfBoxes, dimensions, append, remove]);

  useEffect(() => {
    if (!initialData) { // Only on create mode
        const marketOnly = !selectedCompanyCode || selectedCompanyCode === 'none';
        const inventory = getAvailableInventoryForCompany(marketOnly ? undefined : selectedCompanyCode, marketOnly);
        setAvailableWaybills(inventory);
        form.setValue('waybillNumber', ''); // Reset on company change
    }
  }, [selectedCompanyCode, getAvailableInventoryForCompany, initialData, form]);

  useEffect(() => {
    if (initialData) return; // Don't autofill on edit
    
    if (selectedCompany) {
        form.setValue('senderName', selectedCompany.senderName);
        form.setValue('senderAddress', selectedCompany.senderAddress);
        form.setValue('senderCity', selectedCompany.senderCity);
        form.setValue('senderPincode', selectedCompany.senderPincode);
        form.setValue('senderPhone', selectedCompany.senderPhone);
        form.setValue('senderState', selectedCompany.senderState);
        form.setValue('paymentType', selectedCompany.paymentType);
    } else {
        // Reset to default sender if company is unselected
         const storedSender = localStorage.getItem('yuwon-defaultSender') || '{}';
         const defaultSender = JSON.parse(storedSender);
         form.setValue('senderName', defaultSender.senderName || '');
         form.setValue('senderAddress', defaultSender.senderAddress || '');
         form.setValue('senderCity', defaultSender.senderCity || '');
         form.setValue('senderPincode', defaultSender.senderPincode || '');
         form.setValue('senderPhone', defaultSender.senderPhone || '');
         form.setValue('senderState', defaultSender.senderState || '');
         form.setValue('paymentType', 'To Pay');
    }
  }, [selectedCompany, form, initialData]);

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
                    senderState: company.senderState,
                };
            }
        } else {
            const storedSender = localStorage.getItem('yuwon-defaultSender');
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
  
  const calculateChargeableWeight = useCallback(() => {
    if (!dimensions || dimensions.length === 0) {
        form.setValue('chargeableWeight', 0);
        return;
    }
    const totalVolume = dimensions.reduce((acc, dim) => {
        const l = dim.length || 0;
        const b = dim.breadth || 0;
        const h = dim.height || 0;
        if (l > 0 && b > 0 && h > 0) {
            return acc + (l * b * h * 6);
        }
        return acc;
    }, 0);

    const chargeableWeight = Math.ceil(totalVolume / 27000);
    form.setValue('chargeableWeight', chargeableWeight);
  }, [dimensions, form]);
  
  useEffect(() => {
    calculateChargeableWeight();
  }, [calculateChargeableWeight]);
  

  const onSubmit = (data: WaybillFormData) => {
    const waybillToSave: Waybill = {
        ...data,
        id: initialData?.id || crypto.randomUUID(),
        partnerCode: user?.partnerCode,
        companyCode: data.companyCode === 'none' ? '' : data.companyCode
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
        
        {/* Step 1: Core Details */}
        <Card>
            <CardHeader>
                <CardTitle>Step 1: Core Details</CardTitle>
                <CardDescription>Start by selecting the company and waybill number.</CardDescription>
            </CardHeader>
            <CardContent className="grid lg:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="companyCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                            <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ''}
                            >
                                <FormControl>
                                    <div className="relative">
                                    <SelectTrigger className="pl-10">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <IconWrapper><Building /></IconWrapper>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None (Market Booking)</SelectItem>
                                    {companies.map(c => <SelectItem key={c.id} value={c.companyCode!}>{c.companyName} ({c.companyCode})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {initialData ? (
                    <FormField
                        control={form.control}
                        name="waybillNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waybill Number</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input {...field} className="pl-10" disabled />
                                </FormControl>
                                <IconWrapper><Hash /></IconWrapper>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                ) : (
                    <FormField
                        control={form.control}
                        name="waybillNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Waybill Number</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={availableWaybills.length === 0}>
                                    <FormControl>
                                        <div className="relative">
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Select an available waybill number" />
                                            </SelectTrigger>
                                            <IconWrapper><Hash /></IconWrapper>
                                        </div>
                                    </FormControl>
                                    <SelectContent>
                                        {availableWaybills.length > 0 ? (
                                            availableWaybills.map(item => (
                                                <SelectItem key={item.waybillNumber} value={item.waybillNumber}>
                                                    {item.waybillNumber}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-sm text-muted-foreground">No available waybills for this selection.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </CardContent>
        </Card>

        {/* Step 2: Addresses */}
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Addresses</CardTitle>
                <CardDescription>Enter the sender and receiver details.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 p-4 rounded-md border">
                    <h3 className="font-semibold text-lg">Sender Information</h3>
                    <FormField control={form.control} name="senderName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., John Doe" {...field} className="pl-10" /></FormControl><IconWrapper><User /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="senderAddress" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><div className="relative"><FormControl><Input placeholder="Enter address" {...field} className="pl-10" /></FormControl><IconWrapper><MapPin /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="senderPincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., 10001" {...field} className="pl-10" /></FormControl><IconWrapper><MapPin /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="senderCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., New York" {...field} className="pl-10" /></FormControl><IconWrapper><Building /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="senderState" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., New York" {...field} className="pl-10" /></FormControl><IconWrapper><Globe /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="senderPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., (555) 123-4567" {...field} className="pl-10" /></FormControl><IconWrapper><Phone /></IconWrapper></div><FormMessage /></FormItem>)} />
                </div>
                 <div className="space-y-4 p-4 rounded-md border">
                    <h3 className="font-semibold text-lg">Receiver Information</h3>
                    <FormField control={form.control} name="receiverName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., Jane Smith" {...field} className="pl-10" /></FormControl><IconWrapper><User /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="receiverAddress" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><div className="relative"><FormControl><Input placeholder="Enter address" {...field} className="pl-10" /></FormControl><IconWrapper><MapPin /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="receiverPincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., 90001" {...field} className="pl-10" /></FormControl><IconWrapper><MapPin /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="receiverCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., Los Angeles" {...field} className="pl-10" /></FormControl><IconWrapper><Building /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="receiverState" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., California" {...field} className="pl-10" /></FormControl><IconWrapper><Globe /></IconWrapper></div><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="receiverPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., (555) 987-6543" {...field} className="pl-10" /></FormControl><IconWrapper><Phone /></IconWrapper></div><FormMessage /></FormItem>)} />
                </div>
            </CardContent>
        </Card>

        {/* Step 3: Shipment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Shipment Details</CardTitle>
            <CardDescription>Provide information about the package being shipped.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid md:grid-cols-3 gap-4">
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
                        <FormLabel>Actual Weight (kg)</FormLabel>
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
                    name="chargeableWeight"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Chargeable Wt. (kg)</FormLabel>
                        <div className="relative">
                        <FormControl>
                            <Input type="number" step="0.1" placeholder="Auto-calculated" {...field} onChange={e => field.onChange(+e.target.value)} className="pl-10" />
                        </FormControl>
                        <IconWrapper><Weight /></IconWrapper>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             </div>
             
             <div className="p-4 border rounded-md space-y-4">
                <div className="flex items-center gap-2">
                    <Move3d className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Volumetric Weight Details</h4>
                </div>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                    {fields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1 font-medium text-muted-foreground text-sm">Box {index + 1}</div>
                            <div className="col-span-11 grid grid-cols-3 gap-2">
                                <FormField control={form.control} name={`dimensions.${index}.length`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="L (cm)" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`dimensions.${index}.breadth`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="B (cm)" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`dimensions.${index}.height`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="H (cm)" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                    ))}
                </div>
             </div>
            
            <FormField
                control={form.control}
                name="packageDescription"
                render={({ field }) => (
                    <FormItem>
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
