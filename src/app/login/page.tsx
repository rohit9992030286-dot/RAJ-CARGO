
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, User as UserIcon, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { useEffect } from 'react';
import { Logo } from '@/components/Logo';
import Image from 'next/image';

const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;


function LoginPageContent() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuth();
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
    const loggedInUser = login(data.username, data.password);
    if (loggedInUser) {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      
      if (loggedInUser.role === 'admin') {
        router.push('/dashboard');
      } else if (loggedInUser.roles?.includes('booking')) {
        router.push('/booking');
      } else if (loggedInUser.roles?.includes('hub')) {
        router.push('/hub');
      } else if (loggedInUser.roles?.includes('delivery')) {
        router.push('/delivery');
      } else if (loggedInUser.roles?.includes('account')) {
        router.push('/account');
      } else {
        router.push('/dashboard');
      }

    } else {
      toast({ title: 'Login Failed', description: 'Invalid username or password.', variant: 'destructive' });
    }
  };
  
  if (isLoading || isAuthenticated) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop"
            alt="Highway background"
            data-ai-hint="highway trucks"
            fill
            className="object-cover -z-10"
            quality={90}
            priority
        />
        <div className="absolute inset-0 bg-black/50 -z-10"></div>
        
        <div className="relative w-full max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center p-8">
            <div className="hidden lg:block text-center lg:text-left text-white">
                <Logo className="justify-center lg:justify-start" />
                <h1 className="text-4xl font-bold mt-6 drop-shadow-md">Welcome Back</h1>
                <p className="text-white/80 mt-2 drop-shadow-md">Your central hub for managing shipments efficiently. Please log in to continue.</p>
            </div>
            <Card className="w-full max-w-sm mx-auto bg-card/80 backdrop-blur-sm">
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
    </div>
  );
}


export default function LoginPage() {
    return (
        <DataProvider>
            <LoginPageContent />
        </DataProvider>
    )
}
