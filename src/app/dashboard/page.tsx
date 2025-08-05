
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, BookCopy, Cpu, Shield, Loader2, LogOut, CheckSquare, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '@/components/Logo';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [isLoading, user, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

  const isAdmin = user.role === 'admin';
  const hasBookingRole = user.roles?.includes('booking') || isAdmin;
  const hasHubRole = user.roles?.includes('hub') || isAdmin;
  const hasDeliveryRole = user.roles?.includes('delivery') || isAdmin;
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
        <header className="bg-card border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div>
                     <Logo />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-primary">Welcome, {user?.username}!</h1>
                    <p className="text-muted-foreground text-md">Please select which system you want to access.</p>
                </div>
                 <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </header>

       <div className="flex-grow flex items-center justify-center">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl w-full p-8">
                {hasBookingRole && (
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <BookCopy className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle className="text-2xl">Booking System</CardTitle>
                                    <CardDescription>Manage waybills, manifests, and customers.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>Create new shipments, track existing ones, manage dispatch manifests, and view sales reports. This is your main operational dashboard.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/booking" className="w-full">
                                <Button className="w-full">
                                    Go to Booking <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                 {hasHubRole && (
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Cpu className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle className="text-2xl">Hub System</CardTitle>
                                    <CardDescription>Verify incoming and manage outbound shipments.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>Scan and verify incoming manifests, manage shortages, and create outbound manifests for final delivery. Fulfills a central role in logistics.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/hub" className="w-full">
                                <Button className="w-full">
                                    Go to Hub <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                 {hasDeliveryRole && (
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Truck className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle className="text-2xl">Delivery System</CardTitle>
                                    <CardDescription>Manage last-mile delivery operations.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>View assigned waybills, update delivery statuses in real-time, and track delivered or returned packages for your assigned area.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/delivery" className="w-full">
                                <Button className="w-full">
                                    Go to Delivery <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                {isAdmin && (
                    <Card className="hover:shadow-lg transition-shadow border-primary/50">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Shield className="h-10 w-10 text-primary" />
                                <div>
                                    <CardTitle className="text-2xl">Admin Panel</CardTitle>
                                    <CardDescription>Manage users and system settings.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>This is a restricted area for administrators to manage user accounts and application configurations.</p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/admin" className="w-full">
                                <Button className="w-full" variant="secondary">
                                    Go to Admin <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
        </div>
       </div>
    </div>
  )
}
