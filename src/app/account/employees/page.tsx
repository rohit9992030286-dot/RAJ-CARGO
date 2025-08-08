
'use client';
import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, Users, IndianRupee, Pencil, User, Save, Briefcase, Calendar, Phone, Hash, Image as ImageIcon, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'rajcargo-employees';

const employeeSchema = z.object({
  id: z.string().optional(),
  employeeCode: z.string().min(2, 'Employee code is required.'),
  name: z.string().min(2, 'Name is required.'),
  post: z.string().min(2, 'Post is required.'),
  dateOfJoining: z.string().min(1, 'Date of joining is required.'),
  mobileNo: z.string().min(10, 'Mobile number must be at least 10 digits.'),
  salary: z.coerce.number().min(0, 'Salary must be a positive number.'),
  photoUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type Employee = z.infer<typeof employeeSchema>;

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
        employeeCode: '',
        name: '', 
        post: '', 
        dateOfJoining: '',
        mobileNo: '',
        salary: 0,
        photoUrl: '',
    },
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
    const sortedEmployees = newEmployees.sort((a,b) => a.name.localeCompare(b.name));
    setEmployees(sortedEmployees);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedEmployees));
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
    form.reset({ employeeCode: '', name: '', post: '', dateOfJoining: '', mobileNo: '', salary: 0, photoUrl: '' });
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

  const handlePrintId = (employeeId: string) => {
    window.open(`/print/employee-id/${employeeId}`, '_blank');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">Manage employee details, posts, and their salaries.</p>
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
                  name="employeeCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Code</FormLabel>
                      <div className="relative">
                        <FormControl><Input placeholder="e.g., RJ-M-10010" {...field} className="pl-10" /></FormControl>
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="post"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post / Designation</FormLabel>
                       <div className="relative">
                        <FormControl><Input placeholder="e.g., Manager" {...field} className="pl-10" /></FormControl>
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dateOfJoining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Joining</FormLabel>
                      <div className="relative">
                        <FormControl><Input type="date" {...field} className="pl-10" /></FormControl>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="mobileNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile No.</FormLabel>
                       <div className="relative">
                        <FormControl><Input placeholder="e.g., 9876543210" {...field} className="pl-10" /></FormControl>
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL</FormLabel>
                       <div className="relative">
                        <FormControl><Input placeholder="https://..." {...field} className="pl-10" /></FormControl>
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                  <Button variant="ghost" onClick={() => { setEditingEmployeeId(null); form.reset({ employeeCode: '', name: '', post: '', dateOfJoining: '', mobileNo: '', salary: 0, photoUrl: '' }); }} className="w-full">
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
                  <TableHead>Emp. Code</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Mobile No.</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length > 0 ? employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-mono">{emp.employeeCode}</TableCell>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.post}</TableCell>
                    <TableCell>{emp.mobileNo}</TableCell>
                    <TableCell>{emp.dateOfJoining ? format(new Date(emp.dateOfJoining), 'PP') : ''}</TableCell>
                    <TableCell>₹{emp.salary.toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handlePrintId(emp.id!)}>
                          <Printer className="h-4 w-4" />
                       </Button>
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
                    <TableCell colSpan={7} className="h-24 text-center">No employees found.</TableCell>
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
