
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, User, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { useEffect } from 'react';

const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

function LoginPageContent() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
        router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);


  const onSubmit = (data: LoginFormValues) => {
    const success = login(data.username, data.password);
    if (success) {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Login Failed', description: 'Invalid username or password.', variant: 'destructive' });
    }
  };
  
  if (isLoading || isAuthenticated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Staff Login</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <div className="relative">
                                <FormControl><Input {...field} placeholder="Your username" className="pl-10" /></FormControl>
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
                                <FormControl><Input type="password" {...field} placeholder="Your password" className="pl-10" /></FormControl>
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}


export default function LoginPage() {
    return (
        <AuthProvider>
            <DataProvider>
                <LoginPageContent />
            </DataProvider>
        </AuthProvider>
    )
}
