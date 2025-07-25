
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, AuthContext, User, NewUser, AUTH_STORAGE_KEY, USERS_STORAGE_KEY, DEFAULT_ADMIN_USER } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, User as UserIcon, KeyRound, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { useEffect, useState, useCallback, ReactNode } from 'react';

const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<NewUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN_USER]));
        setUsers([DEFAULT_ADMIN_USER]);
      } else {
        setUsers(JSON.parse(storedUsers));
      }

      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        setUser(JSON.parse(storedAuth));
      }
    } catch (error) {
      console.error("Failed to initialize auth from local storage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USERS_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const syncUsersToStorage = (updatedUsers: NewUser[]) => {
      setUsers(updatedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }

  const login = useCallback((username: string, password: string): boolean => {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userToLogin = storedUsers.find((u: NewUser) => u.username === username);

    if (userToLogin && userToLogin.password === password) {
      const loggedInUser: User = { username: userToLogin.username, role: userToLogin.role };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);
  
  const addUser = useCallback((newUser: NewUser): boolean => {
    const currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    if(currentUsers.some((u: NewUser) => u.username === newUser.username)) {
        return false;
    }
    const updatedUsers = [...currentUsers, newUser];
    syncUsersToStorage(updatedUsers);
    return true;
  }, []);
  
  const deleteUser = useCallback((username: string) => {
    if (username === DEFAULT_ADMIN_USER.username) return;
    const currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const updatedUsers = currentUsers.filter((u: NewUser) => u.username !== username);
    syncUsersToStorage(updatedUsers);
  }, []);

  return {
    user,
    users: users.map(({password, ...user}) => user),
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    addUser,
    deleteUser,
  };
}

function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useProvideAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}


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
