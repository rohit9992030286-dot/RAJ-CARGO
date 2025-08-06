
'use client';
import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, Users, IndianRupee, Pencil, User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const STORAGE_KEY = 'rajcargo-employees';

const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required.'),
  salary: z.coerce.number().min(0, 'Salary must be a positive number.'),
});
type Employee = z.infer<typeof employeeSchema>;

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', salary: 0 },
  });

  useState(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setEmployees(JSON.parse(storedData));
      }
    } catch (e) {
      console.error('Failed to load employees from storage', e);
    } finally {
      setIsLoading(false);
    }
  });

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees));
  };

  const handleAddOrUpdateEmployee = (data: Employee) => {
    let updatedEmployees;
    if (editingEmployeeId) {
      updatedEmployees = employees.map(emp => emp.id === editingEmployeeId ? { ...emp, ...data } : emp);
      toast({ title: 'Employee Updated', description: `${data.name}'s details have been updated.` });
    } else {
      updatedEmployees = [...employees, { ...data, id: crypto.randomUUID() }];
      toast({ title: 'Employee Added', description: `${data.name} has been added to the list.` });
    }
    saveEmployees(updatedEmployees);
    form.reset({ name: '', salary: 0 });
    setEditingEmployeeId(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployeeId(employee.id!);
    form.reset(employee);
  };

  const handleDelete = (id: string) => {
    const newEmployees = employees.filter(emp => emp.id !== id);
    saveEmployees(newEmployees);
    toast({ title: 'Employee Removed' });
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">Manage employee details and their salaries.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddOrUpdateEmployee)}>
              <CardHeader>
                <CardTitle>{editingEmployeeId ? 'Update Employee' : 'Add New Employee'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Name</FormLabel>
                      <div className="relative">
                        <FormControl><Input placeholder="e.g., John Doe" {...field} className="pl-10" /></FormControl>
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary (₹)</FormLabel>
                       <div className="relative">
                        <FormControl><Input type="number" placeholder="e.g., 25000" {...field} className="pl-10" /></FormControl>
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  {editingEmployeeId ? <Save className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  {editingEmployeeId ? 'Save Changes' : 'Add Employee'}
                </Button>
                {editingEmployeeId && (
                  <Button variant="ghost" onClick={() => { setEditingEmployeeId(null); form.reset({ name: '', salary: 0 }); }} className="w-full">
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>A list of all employees and their current salaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length > 0 ? employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>₹{emp.salary.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                          <Pencil className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No employees found.</TableCell>
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
