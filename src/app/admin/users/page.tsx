
'use client';
import { useAuth, User } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, Trash2, User as UserIcon, KeyRound, Shield, Briefcase, BookCopy, Cpu, Truck } from 'lucide-react';
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
  partnerCode: z.string().min(1, 'Partner code is required.'),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one role.',
  }),
});

type UserFormData = z.infer<typeof userFormSchema>;
const roles = [
    { id: 'booking', label: 'Booking', icon: BookCopy },
    { id: 'hub', label: 'Hub', icon: Cpu },
    { id: 'delivery', label: 'Delivery', icon: Truck },
];

export default function UserManagementPage() {
  const { user, users, addUser, deleteUser, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      password: '',
      partnerCode: '',
      roles: [],
    },
  });

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast({ title: "Access Denied", description: "You must be an admin to view this page.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [user, isLoading, router, toast]);

  const onSubmit = (data: UserFormData) => {
    const newUser = {
        ...data,
        role: 'staff' as 'staff',
        roles: data.roles as ('booking' | 'hub' | 'delivery')[],
    };

    const success = addUser(newUser);
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
                    <CardTitle>Create New Staff User</CardTitle>
                    <CardDescription>Add a new user and assign roles and a partner code.</CardDescription>
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
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                        name="roles"
                        render={() => (
                            <FormItem>
                                <FormLabel>Module Access</FormLabel>
                                <div className="space-y-2">
                                {roles.map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="roles"
                                        render={({ field }) => {
                                            const Icon = item.icon;
                                            return (
                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), item.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== item.id
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {item.label}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                                </div>
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
                            <TableHead>Roles</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.username}>
                                <TableCell>{u.username}</TableCell>
                                <TableCell><Badge variant="outline">{u.partnerCode}</Badge></TableCell>
                                <TableCell>
                                    {u.role === 'admin' 
                                        ? <Badge variant="default">Admin</Badge>
                                        : <div className="flex flex-wrap gap-1">
                                            {u.roles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)}
                                           </div>
                                    }
                                </TableCell>
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
