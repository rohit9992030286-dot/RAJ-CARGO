
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
import { Loader2, PlusCircle, Trash2, Tags, IndianRupee, Globe, Pencil, Weight, Upload, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useWaybills } from '@/hooks/useWaybills';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRef } from 'react';

const STORAGE_KEY = 'rajcargo-pincode-rates';

const rateSchema = z.object({
  baseCharge: z.coerce.number().min(0, 'Base charge must be a positive number.'),
  weightCharge: z.coerce.number().min(0, 'Weight charge must be a positive number.'),
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
  const { allWaybills, isLoaded: waybillsLoaded } = useWaybills();
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bookingPartners = useMemo(() => {
    return [...new Set(users.filter(u => u.roles.includes('booking') && u.partnerCode).map(u => u.partnerCode!))];
  }, [users]);
  
  const uniqueStates = useMemo(() => {
    if (!waybillsLoaded) return [];
    const states = allWaybills.map(wb => wb.receiverState).filter(Boolean);
    return [...new Set(states)].sort();
  }, [allWaybills, waybillsLoaded]);


  const form = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      baseCharge: 0,
      weightCharge: 0,
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
    form.reset({ baseCharge: 0, weightCharge: 0, partnerCode: '', state: '' });
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

  const handleExport = () => {
    const dataToExport = rates.map(r => ({
        partnerCode: r.partnerCode,
        state: r.state,
        baseCharge: r.baseCharge,
        weightCharge: r.weightCharge,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rates");
    XLSX.writeFile(wb, "rajcargo_rates.xlsx");
    toast({ title: "Rates Exported" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const newRates: Rate[] = json.map((row, index) => {
                const parsed = rateSchema.safeParse(row);
                if (!parsed.success) {
                    throw new Error(`Invalid data in row ${index + 2}: ${parsed.error.flatten().fieldErrors}`);
                }
                return { ...parsed.data, id: crypto.randomUUID() };
            });
            
            saveRates(newRates);
            toast({ title: "Import Successful", description: `${newRates.length} rates have been imported and replaced existing data.` });

        } catch (error: any) {
            toast({ title: "Import Failed", description: error.message, variant: "destructive" });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsArrayBuffer(file);
  };
  
  if (isLoading || !waybillsLoaded) {
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
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                     <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {uniqueStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Charge (₹)</FormLabel>
                     <div className="relative">
                        <FormControl><Input type="number" step="0.01" placeholder="e.g., 100.00" {...field} className="pl-10" /></FormControl>
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Charge (₹/kg)</FormLabel>
                     <div className="relative">
                        <FormControl><Input type="number" step="0.01" placeholder="e.g., 20.00" {...field} className="pl-10" /></FormControl>
                        <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                    <Button variant="ghost" onClick={() => { setEditingRateId(null); form.reset({ baseCharge: 0, weightCharge: 0, partnerCode: '', state: '' }); }}>
                        Cancel Edit
                    </Button>
                </CardFooter>
            )}
          </form>
        </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>Current Rates</CardTitle>
                <CardDescription>List of all defined shipping rates.</CardDescription>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Import Rates
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls" />
                <Button variant="outline" size="sm" onClick={handleExport} disabled={rates.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export Rates
                </Button>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Code</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Basic Charge (₹)</TableHead>
                <TableHead>Weight Charge (₹/kg)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length > 0 ? (
                rates.map(rate => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium"><Badge variant="outline">{rate.partnerCode}</Badge></TableCell>
                    <TableCell>{rate.state}</TableCell>
                    <TableCell>{rate.baseCharge.toFixed(2)}</TableCell>
                    <TableCell>{rate.weightCharge.toFixed(2)}</TableCell>
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
                  <TableCell colSpan={5} className="h-24 text-center">
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
