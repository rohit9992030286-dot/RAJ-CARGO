
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
import { Loader2, PlusCircle, Trash2, Tags, IndianRupee, Globe, Pencil, Weight, Upload, Download, Percent } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRef } from 'react';

const STORAGE_KEY = 'rajcargo-state-rates';

const rateSchema = z.object({
  fromState: z.string().min(2, "Origin state is required."),
  toState: z.string().min(2, "Destination state is required."),
  docketCharge: z.coerce.number().min(0, 'Docket charge must be a positive number.'),
  fuelSurcharge: z.coerce.number().min(0, 'Fuel surcharge must be a positive number.'),
  greenTaxCharge: z.coerce.number().min(0, 'Green tax must be a positive number.'),
  cgst: z.coerce.number().min(0, 'CGST must be a positive number.'),
  sgst: z.coerce.number().min(0, 'SGST must be a positive number.'),
  volumeWeightCharge: z.coerce.number().min(0, 'Volume weight charge must be a positive number.'),
});
type RateFormData = z.infer<typeof rateSchema>;
interface Rate extends RateFormData {
  id: string;
}

export default function RateManagementPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      fromState: '',
      toState: '',
      docketCharge: 0,
      fuelSurcharge: 0,
      greenTaxCharge: 0,
      cgst: 0,
      sgst: 0,
      volumeWeightCharge: 0,
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
    const sortedRates = newRates.sort((a, b) => a.fromState.localeCompare(b.fromState) || a.toState.localeCompare(b.toState));
    setRates(sortedRates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedRates));
  };

  const onSubmit = (data: RateFormData) => {
    let newRates = [...rates];
    
    if (editingRateId) {
      const index = newRates.findIndex(r => r.id === editingRateId);
      if (index > -1) {
        newRates[index] = { ...data, id: editingRateId };
        toast({ title: 'Rate Updated', description: `The rate has been updated successfully.` });
      }
    } else {
      const existingRate = newRates.find(r => r.fromState.trim().toLowerCase() === data.fromState.trim().toLowerCase() && r.toState.trim().toLowerCase() === data.toState.trim().toLowerCase());
      if (existingRate) {
        toast({ title: 'Duplicate Rate', description: 'This exact state-to-state rate already exists.', variant: 'destructive'});
        return;
      }
      newRates.push({ ...data, id: crypto.randomUUID() });
      toast({ title: 'Rate Added', description: `A new rate has been added.` });
    }

    saveRates(newRates);
    form.reset({ fromState: '', toState: '', docketCharge: 0, fuelSurcharge: 0, greenTaxCharge: 0, cgst: 0, sgst: 0, volumeWeightCharge: 0 });
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
        fromState: r.fromState,
        toState: r.toState,
        docketCharge: r.docketCharge,
        fuelSurcharge: r.fuelSurcharge,
        greenTaxCharge: r.greenTaxCharge,
        cgst: r.cgst,
        sgst: r.sgst,
        volumeWeightCharge: r.volumeWeightCharge,
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">State-to-State Rate Management</h1>
        <p className="text-muted-foreground">Set and manage shipping rates based on origin and destination states.</p>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>{editingRateId ? 'Update Rate' : 'Add New Rate'}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
               <FormField control={form.control} name="fromState" render={({ field }) => (<FormItem><FormLabel>From State</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., Delhi" {...field} className="pl-10" /></FormControl><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="toState" render={({ field }) => (<FormItem><FormLabel>To State</FormLabel><div className="relative"><FormControl><Input placeholder="e.g., Maharashtra" {...field} className="pl-10" /></FormControl><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="docketCharge" render={({ field }) => (<FormItem><FormLabel>Docket Charge (₹)</FormLabel><div className="relative"><FormControl><Input type="number" step="0.01" {...field} className="pl-10" /></FormControl><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="fuelSurcharge" render={({ field }) => (<FormItem><FormLabel>Fuel Surcharge (%)</FormLabel><div className="relative"><FormControl><Input type="number" step="0.01" {...field} className="pl-10" /></FormControl><Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="greenTaxCharge" render={({ field }) => (<FormItem><FormLabel>Green Tax (₹)</FormLabel><div className="relative"><FormControl><Input type="number" step="0.01" {...field} className="pl-10" /></FormControl><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="cgst" render={({ field }) => (<FormItem><FormLabel>CGST (%)</FormLabel><div className="relative"><FormControl><Input type="number" step="0.01" {...field} className="pl-10" /></FormControl><Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="sgst" render={({ field }) => (<FormItem><FormLabel>SGST (%)</FormLabel><div className="relative"><FormControl><Input type="number" step="0.01" {...field} className="pl-10" /></FormControl><Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="volumeWeightCharge" render={({ field }) => (<FormItem><FormLabel>Volume Wt. Charge (₹/kg)</FormLabel><div className="relative"><FormControl><Input type="number" step="0.01" {...field} className="pl-10" /></FormControl><Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /></div><FormMessage /></FormItem>)} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 {editingRateId && (
                    <Button variant="ghost" onClick={() => { setEditingRateId(null); form.reset({ fromState: '', toState: '', docketCharge: 0, fuelSurcharge: 0, greenTaxCharge: 0, cgst: 0, sgst: 0, volumeWeightCharge: 0 }); }}>
                        Cancel Edit
                    </Button>
                )}
                <Button type="submit" className="w-fit">
                    <PlusCircle className="mr-2 h-4 w-4" /> {editingRateId ? 'Update Rate' : 'Save Rate'}
                </Button>
            </CardFooter>
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
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Docket (₹)</TableHead>
                <TableHead>Fuel (%)</TableHead>
                <TableHead>Green Tax (₹)</TableHead>
                <TableHead>CGST (%)</TableHead>
                <TableHead>SGST (%)</TableHead>
                <TableHead>Vol. Wt. (₹/kg)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.length > 0 ? (
                rates.map(rate => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.fromState}</TableCell>
                    <TableCell>{rate.toState}</TableCell>
                    <TableCell>{rate.docketCharge.toFixed(2)}</TableCell>
                    <TableCell>{rate.fuelSurcharge.toFixed(2)}</TableCell>
                    <TableCell>{rate.greenTaxCharge.toFixed(2)}</TableCell>
                    <TableCell>{rate.cgst.toFixed(2)}</TableCell>
                    <TableCell>{rate.sgst.toFixed(2)}</TableCell>
                    <TableCell>{rate.volumeWeightCharge.toFixed(2)}</TableCell>
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
                  <TableCell colSpan={9} className="h-24 text-center">
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
