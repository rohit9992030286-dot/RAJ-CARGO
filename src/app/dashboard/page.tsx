'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, BookCopy, Cpu, Shield, Loader2, LogOut, CheckSquare, Truck, DollarSign, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
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
  const hasAccountRole = user.roles?.includes('account') || isAdmin;
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="bg-slate-900 border-b border-white/10 pt-12 pb-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Truck size={200} className="text-white" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
                        <UserCircle className="h-10 w-10 text-blue-950" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                            Welcome, <span className="text-primary">{user?.username}</span>
                        </h1>
                        <p className="text-blue-200/60 font-bold uppercase tracking-widest text-xs mt-1">Authorized Access Point</p>
                    </div>
                </div>
            </div>
        </header>

       <div className="flex-grow flex items-start justify-center -mt-12 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl w-full p-4">
                {hasBookingRole && (
                    <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-none shadow-lg group overflow-hidden">
                        <div className="h-1.5 bg-green-500 w-full"></div>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <BookCopy className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tighter italic">Booking</CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest">Invoicing & Waybills</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 leading-relaxed">
                            Create new shipments, manage waybill inventory, and handle manifest dispatch logs.
                        </CardContent>
                        <CardFooter>
                            <Link href="/booking" className="w-full">
                                <Button className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-green-600">
                                    Enter System <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                 {hasHubRole && (
                    <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-none shadow-lg group overflow-hidden">
                        <div className="h-1.5 bg-blue-600 w-full"></div>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Cpu className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tighter italic">Hub Control</CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest">Verification & Transit</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 leading-relaxed">
                            Verify incoming cargo, monitor shortages, and create outbound manifests for delivery.
                        </CardContent>
                        <CardFooter>
                            <Link href="/hub" className="w-full">
                                <Button className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-blue-600">
                                    Enter System <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                 {hasDeliveryRole && (
                    <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-none shadow-lg group overflow-hidden">
                        <div className="h-1.5 bg-primary w-full"></div>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 group-hover:bg-primary group-hover:text-black transition-colors">
                                    <Truck className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tighter italic">Delivery</CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest">Last-Mile Operations</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 leading-relaxed">
                            Real-time delivery sheet management and POD (Proof of Delivery) upload control.
                        </CardContent>
                        <CardFooter>
                            <Link href="/delivery" className="w-full">
                                <Button className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-primary hover:text-black">
                                    Enter System <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                 {hasAccountRole && (
                    <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-none shadow-lg group overflow-hidden">
                        <div className="h-1.5 bg-purple-600 w-full"></div>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <DollarSign className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tighter italic">Finance</CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest">Accounts & Payments</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 leading-relaxed">
                            Manage payroll, corporate billing, and commission tracking for all partners.
                        </CardContent>
                        <CardFooter>
                            <Link href="/account" className="w-full">
                                <Button className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-purple-600">
                                    Enter System <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                {isAdmin && (
                    <Card className="hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-primary/20 shadow-lg group overflow-hidden">
                        <div className="h-1.5 bg-slate-950 w-full"></div>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 rounded-xl text-slate-900 group-hover:bg-slate-950 group-hover:text-primary transition-colors">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold uppercase tracking-tighter italic">Administrator</CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest">Master System Control</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 leading-relaxed">
                            Full visibility of all data, user role management, rates, and global system health.
                        </CardContent>
                        <CardFooter>
                            <Link href="/admin" className="w-full">
                                <Button className="w-full h-12 text-base font-bold bg-slate-950 hover:bg-slate-900 hover:text-primary">
                                    Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
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