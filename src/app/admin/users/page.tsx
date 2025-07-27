
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, Trash2, User, KeyRound, Shield, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['admin', 'staff']),
  partnerCode: z.string().min(1, 'Partner code is required.'),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function UserManagementPage() {
  const { user, users, addUser, deleteUser, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'staff',
      partnerCode: '',
    },
  });

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast({ title: "Access Denied", description: "You must be an admin to view this page.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [user, isLoading, router, toast]);

  const onSubmit = (data: UserFormData) => {
    const success = addUser(data);
    if (success) {
      toast({ title: 'User Created', description: `User "${data.username}" has been added.` });
      form.reset();
    } else {
      toast({ title: 'Creation Failed', description: `User "${data.username}" already exists.`, variant: 'destructive' });
    }
  };
  
  const handleDeleteUser = (username: string) => {
    deleteUser(username);
    toast({ title: 'User Deleted', description: `User "${username}" has been removed.` });
  };


  if (isLoading || user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Create and manage user accounts for the application.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Create New User</CardTitle>
                    <CardDescription>Add a new user and assign a role and partner code.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <div className="relative">
                                    <FormControl><Input {...field} placeholder="e.g., john.doe" className="pl-10" /></FormControl>
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                    <FormControl><Input type="password" {...field} className="pl-10" /></FormControl>
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="partnerCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Partner Code</FormLabel>
                                <div className="relative">
                                    <FormControl><Input {...field} placeholder="e.g., PUNE01" className="pl-10" /></FormControl>
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <div className="relative">
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Create User
                    </Button>
                </CardFooter>
            </form>
           </Form>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Existing Users</CardTitle>
                <CardDescription>List of all users currently in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Partner Code</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.username}>
                                <TableCell>{u.username}</TableCell>
                                <TableCell><Badge variant="outline">{u.partnerCode}</Badge></TableCell>
                                <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={u.username === user.username}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the user "{u.username}". This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteUser(u.username)}>
                                                    Yes, delete user
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
