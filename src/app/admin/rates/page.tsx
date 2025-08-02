
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Tags, IndianRupee, Globe, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'rajcargo-pincode-rates';

const rateSchema = z.object({
  rate: z.coerce.number().min(0, 'Rate must be a positive number.'),
  partnerCode: z.string().min(1, "Please select a partner."),
  state: z.string().min(2, "State is required."),
});
type RateFormData = z.infer<typeof rateSchema>;
interface Rate extends RateFormData {
  id: string;
}

export default function RateManagementPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { users } = useAuth();
  const [editingRateId, setEditingRateId] = useState<string | null>(null);

  const bookingPartners = useMemo(() => {
    return [...new Set(users.filter(u => u.roles.includes('booking') && u.partnerCode).map(u => u.partnerCode!))];
  }, [users]);


  const form = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      rate: 0,
      partnerCode: '',
      state: '',
    },
  });

  useEffect(() => {
    try {
      const storedRates = localStorage.getItem(STORAGE_KEY);
      if (storedRates) {
        setRates(JSON.parse(storedRates));
      }
    } catch (error) {
      console.error("Failed to load rates:", error);
      toast({ title: 'Error', description: 'Could not load rates.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const saveRates = (newRates: Rate[]) => {
    const sortedRates = newRates.sort((a, b) => a.state.localeCompare(b.state) || a.partnerCode.localeCompare(b.partnerCode));
    setRates(sortedRates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedRates));
  };

  const onSubmit = (data: RateFormData) => {
    let newRates = [...rates];
    
    if (editingRateId) {
      // Update existing rate
      const index = newRates.findIndex(r => r.id === editingRateId);
      if (index > -1) {
        newRates[index] = { ...data, id: editingRateId };
        toast({ title: 'Rate Updated', description: `The rate has been updated successfully.` });
      }
    } else {
      // Add new rate
      const existingRate = newRates.find(r => r.partnerCode === data.partnerCode && r.state.toLowerCase() === data.state.toLowerCase());
      if (existingRate) {
        toast({ title: 'Duplicate Rate', description: 'This exact rate combination already exists.', variant: 'destructive'});
        return;
      }
      newRates.push({ ...data, id: crypto.randomUUID() });
      toast({ title: 'Rate Added', description: `A new rate has been added.` });
    }

    saveRates(newRates);
    form.reset({ rate: 0, partnerCode: '', state: '' });
    setEditingRateId(null);
  };

  const handleEditRate = (rate: Rate) => {
    setEditingRateId(rate.id);
    form.reset(rate);
  }

  const handleDeleteRate = (id: string) => {
    const newRates = rates.filter(r => r.id !== id);
    saveRates(newRates);
    toast({ title: 'Rate Deleted', description: `The rate has been removed.` });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Rate Management</h1>
        <p className="text-muted-foreground">Set and manage shipping rates for different partners and states.</p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{editingRateId ? 'Update Rate' : 'Add New Rate'}</CardTitle>
              <CardDescription>Enter a partner, state, and its corresponding shipping rate.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="partnerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Partner" /></SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {bookingPartners.map(code => <SelectItem key={code} value={code}>{code}</SelectItem>)}
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                     <div className="relative">
                        <FormControl><Input placeholder="e.g., Maharashtra" {...field} className="pl-10" /></FormControl>
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹)</FormLabel>
                     <div className="relative">
                        <FormControl><Input type="number" step="0.01" placeholder="e.g., 150.00" {...field} className="pl-10" /></FormControl>
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> {editingRateId ? 'Update Rate' : 'Save Rate'}
                </Button>
              </div>
            </CardContent>
            {editingRateId && (
                <CardFooter>
                    <Button variant="ghost" onClick={() => { setEditingRateId(null); form.reset({ rate: 0, partnerCode: '', state: '' }); }}>
                        Cancel Edit
                    </Button>
                </CardFooter>
            )}
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Rates</CardTitle>
          <CardDescription>List of all defined shipping rates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Code</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Rate (₹)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length > 0 ? (
                rates.map(rate => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium"><Badge variant="outline">{rate.partnerCode}</Badge></TableCell>
                    <TableCell>{rate.state}</TableCell>
                    <TableCell>{rate.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEditRate(rate)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteRate(rate.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="text-center py-8">
                        <Tags className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Rates Defined</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Add a rate using the form above to get started.</p>
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
