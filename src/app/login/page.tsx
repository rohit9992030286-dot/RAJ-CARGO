
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
      
      router.push('/dashboard');

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
        <div className="absolute inset-0 w-full h-full -z-10 opacity-5 dark:opacity-[0.02]">
            <svg className="absolute -top-40 -left-40" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_26_2)"><g filter="url(#filter0_f_26_2)"><path d="M575.649 200.525C628.971 215.176 675.293 241.674 711.662 277.6C748.031 313.526 772.484 357.398 782.355 404.882C792.227 452.366 787.058 501.761 767.585 546.666C748.112 591.571 715.176 630.147 672.435 656.841C629.694 683.535 579.098 697.168 527.781 695.839C476.463 694.51 426.331 678.291 383.61 649.336C340.889 620.381 307.288 579.825 286.993 532.558C266.699 485.291 260.67 433.393 269.854 383.056C279.037 332.719 303.044 286.096 338.749 249.497C374.453 212.898 420.203 187.893 470.193 177.348C520.182 166.804 572.327 171.222 618.324 189.37L575.649 200.525Z" fill="url(#paint0_linear_26_2)"/></g></g><defs><filter id="filter0_f_26_2" x="66.5195" y="-25.9854" width="919.169" height="925.158" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_26_2"/></filter><linearGradient id="paint0_linear_26_2" x1="527.781" y1="172.014" x2="527.781" y2="695.839" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.5"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></linearGradient><clipPath id="clip0_26_2"><rect width="800" height="800" fill="white"/></clipPath></defs></svg>
            <svg className="absolute -bottom-40 -right-40" width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_26_2)"><g filter="url(#filter0_f_26_2)"><path d="M575.649 200.525C628.971 215.176 675.293 241.674 711.662 277.6C748.031 313.526 772.484 357.398 782.355 404.882C792.227 452.366 787.058 501.761 767.585 546.666C748.112 591.571 715.176 630.147 672.435 656.841C629.694 683.535 579.098 697.168 527.781 695.839C476.463 694.51 426.331 678.291 383.61 649.336C340.889 620.381 307.288 579.825 286.993 532.558C266.699 485.291 260.67 433.393 269.854 383.056C279.037 332.719 303.044 286.096 338.749 249.497C374.453 212.898 420.203 187.893 470.193 177.348C520.182 166.804 572.327 171.222 618.324 189.37L575.649 200.525Z" fill="url(#paint0_linear_26_2)"/></g></g><defs><filter id="filter0_f_26_2" x="66.5195" y="-25.9854" width="919.169" height="925.158" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_26_2"/></filter><linearGradient id="paint0_linear_26_2" x1="527.781" y1="172.014" x2="527.781" y2="695.839" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(var(--primary))" stopOpacity="0.5"/><stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/></linearGradient><clipPath id="clip0_26_2"><rect width="800" height="800" fill="white"/></clipPath></defs></svg>
        </div>
        
        <div className="relative w-full max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center p-8">
            <div className="hidden lg:block text-center lg:text-left">
                <Logo className="justify-center lg:justify-start" />
                <h1 className="text-4xl font-bold mt-6">Welcome Back</h1>
                <p className="text-muted-foreground mt-2">Your central hub for managing shipments efficiently. Please log in to continue.</p>
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

    
