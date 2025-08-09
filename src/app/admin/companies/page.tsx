
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Pencil, Building, User, MapPin, Phone, Hash, Save, XCircle } from 'lucide-react';
import { Company, companySchema } from '@/types/company';
import { useCompanies } from '@/hooks/useCompanies';

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyManagementPage() {
  const { companies, addCompany, updateCompany, deleteCompany, isLoaded } = useCompanies();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  const formSchemaWithoutId = companySchema.omit({ id: true });
  type FormSchemaType = z.infer<typeof formSchemaWithoutId>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchemaWithoutId),
    defaultValues: {
      companyCode: '',
      companyName: '',
      senderName: '',
      senderAddress: '',
      senderCity: '',
      senderPincode: '',
      senderPhone: '',
    },
  });

  const onSubmit = (data: FormSchemaType) => {
    if (editingCompany) {
      const success = updateCompany({ ...data, id: editingCompany.id });
      if (success) {
        setEditingCompany(null);
        form.reset();
      }
    } else {
      const success = addCompany(data);
      if (success) {
        form.reset();
      }
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    form.reset(company);
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    form.reset();
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Company Management</h1>
        <p className="text-muted-foreground">Manage company profiles and their default sender details for waybills.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-1 sticky top-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>{editingCompany ? 'Update Company' : 'Add New Company'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="companyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Code (Unique)</FormLabel>
                      <FormControl><Input placeholder="e.g., COMPA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Company A Ltd." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <h4 className="text-sm font-medium pt-4 border-t">Default Sender Details</h4>
                 <FormField control={form.control} name="senderName" render={({ field }) => (<FormItem><FormLabel>Sender Name</FormLabel><FormControl><Input placeholder="Sender's full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="senderAddress" render={({ field }) => (<FormItem><FormLabel>Sender Address</FormLabel><FormControl><Input placeholder="Sender's address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="senderPincode" render={({ field }) => (<FormItem><FormLabel>Sender Pincode</FormLabel><FormControl><Input placeholder="Sender's pincode" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="senderCity" render={({ field }) => (<FormItem><FormLabel>Sender City</FormLabel><FormControl><Input placeholder="Sender's city" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="senderPhone" render={({ field }) => (<FormItem><FormLabel>Sender Phone</FormLabel><FormControl><Input placeholder="Sender's phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  {editingCompany ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {editingCompany ? 'Save Changes' : 'Add Company'}
                </Button>
                {editingCompany && (
                  <Button variant="ghost" onClick={handleCancelEdit} className="w-full">
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company List</CardTitle>
            <CardDescription>A list of all registered companies.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Sender City</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length > 0 ? companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.companyCode}</TableCell>
                    <TableCell className="font-medium">{c.companyName}</TableCell>
                    <TableCell>{c.senderCity}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                          <Pencil className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => deleteCompany(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                         <div className="text-center py-8">
                            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Companies Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Add a company using the form to get started.</p>
                        </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
