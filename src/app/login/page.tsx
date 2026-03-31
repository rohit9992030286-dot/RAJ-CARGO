
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
        if(user?.role === 'admin') {
            router.replace('/admin/verify');
        } else {
            router.replace('/dashboard');
        }
    }
  }, [isAuthenticated, router, user]);


  const onSubmit = (data: LoginFormValues) => {
    const loggedInUser = login(data.username, data.password);
    if (loggedInUser) {
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      
      if (loggedInUser.role === 'admin') {
        router.push('/admin/verify');
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
    <div className="flex items-center justify-center min-h-screen bg-slate-950 relative overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop"
            alt="Highway background"
            data-ai-hint="highway trucks"
            fill
            className="object-cover -z-10 opacity-40"
            quality={90}
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-transparent to-blue-950/90 -z-10"></div>
        
        <div className="relative w-full max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center p-8">
            <div className="hidden lg:block text-center lg:text-left text-white">
                <Logo className="justify-center lg:justify-start" />
                <h1 className="text-5xl font-black mt-8 tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">Staff Portal</h1>
                <p className="text-blue-100/80 mt-4 text-lg font-medium max-w-sm leading-relaxed">Secure access to YU-WON LOGISTICS and management systems.</p>
            </div>
            <Card className="w-full max-w-sm mx-auto bg-card/90 backdrop-blur-md shadow-2xl border-primary/20">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-3xl font-black tracking-tighter text-blue-900 uppercase italic">Log In</CardTitle>
                            <CardDescription className="text-blue-800/60 font-semibold">Enter your staff credentials</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-blue-900 font-bold uppercase tracking-widest text-[10px]">Username</FormLabel>
                                    <div className="relative">
                                        <FormControl><Input {...field} placeholder="Staff ID" className="pl-10 h-12 border-blue-100 focus:ring-primary focus:border-primary" /></FormControl>
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
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
                                    <FormLabel className="text-blue-900 font-bold uppercase tracking-widest text-[10px]">Password</FormLabel>
                                     <div className="relative">
                                        <FormControl><Input type="password" {...field} placeholder="••••••••" className="pl-10 h-12 border-blue-100 focus:ring-primary focus:border-primary" /></FormControl>
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
                                <LogIn className="mr-2 h-5 w-5" />
                                SIGN IN
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

    