
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { KeyRound, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function AccountSettingsPage() {
    const { user, users, updateUser } = useAuth();
    const { toast } = useToast();

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onSubmit = (data: PasswordFormData) => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
            return;
        }

        const currentUserDetails = users.find(u => u.username === user.username);

        if (!currentUserDetails) {
            toast({ title: 'Error', description: 'Could not find current user details.', variant: 'destructive'});
            return;
        }

        const updatedUser = {
            ...currentUserDetails,
            password: data.newPassword
        };
        
        const success = updateUser(updatedUser);

        if (success) {
            toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
            form.reset();
        } else {
            toast({ title: 'Update Failed', description: 'Could not update your password.', variant: 'destructive' });
        }
    }


    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account credentials.</p>
            </div>

            <Card>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Enter a new password for your account: <strong>{user?.username}</strong></CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
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
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <div className="relative">
                                            <FormControl><Input type="password" {...field} className="pl-10" /></FormControl>
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="ml-auto">
                                <Save className="mr-2 h-4 w-4" /> Save New Password
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}
