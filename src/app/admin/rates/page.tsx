
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Tags, MapPin, IndianRupee } from 'lucide-react';

const STORAGE_KEY = 'rajcargo-pincode-rates';

const rateSchema = z.object({
  pincode: z.string().min(6, 'Pincode must be 6 digits.').max(6, 'Pincode must be 6 digits.'),
  rate: z.coerce.number().min(0, 'Rate must be a positive number.'),
});
type RateFormData = z.infer<typeof rateSchema>;
type Rate = RateFormData;

export default function RateManagementPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      pincode: '',
      rate: 0,
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
    const sortedRates = newRates.sort((a, b) => a.pincode.localeCompare(b.pincode));
    setRates(sortedRates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedRates));
  };

  const onSubmit = (data: RateFormData) => {
    let newRates = [...rates];
    const existingRateIndex = newRates.findIndex(r => r.pincode === data.pincode);

    if (existingRateIndex > -1) {
      newRates[existingRateIndex] = data;
      toast({ title: 'Rate Updated', description: `The rate for pincode ${data.pincode} has been updated.` });
    } else {
      newRates.push(data);
      toast({ title: 'Rate Added', description: `A new rate for pincode ${data.pincode} has been added.` });
    }

    saveRates(newRates);
    form.reset();
  };

  const handleDeleteRate = (pincode: string) => {
    const newRates = rates.filter(r => r.pincode !== pincode);
    saveRates(newRates);
    toast({ title: 'Rate Deleted', description: `The rate for pincode ${pincode} has been removed.` });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Rate Management</h1>
        <p className="text-muted-foreground">Set and manage shipping rates for different destination pincodes.</p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Add or Update Rate</CardTitle>
              <CardDescription>Enter a pincode and its corresponding shipping rate.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Pincode</FormLabel>
                    <div className="relative">
                      <FormControl><Input placeholder="e.g., 411041" {...field} className="pl-10" /></FormControl>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                    <FormLabel>Shipping Rate (₹)</FormLabel>
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
                  <PlusCircle className="mr-2 h-4 w-4" /> Save Rate
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Pincode Rates</CardTitle>
          <CardDescription>List of all defined shipping rates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination Pincode</TableHead>
                <TableHead>Rate (₹)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length > 0 ? (
                rates.map(rate => (
                  <TableRow key={rate.pincode}>
                    <TableCell className="font-medium">{rate.pincode}</TableCell>
                    <TableCell>{rate.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteRate(rate.pincode)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
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
