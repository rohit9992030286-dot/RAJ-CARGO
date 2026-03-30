'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Menu, Settings, Cpu, LayoutDashboard, Truck, LogOut, Loader2, AlertTriangle, ScanLine, History, Car } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

function NavLinks({ onLinkClick, onLogout, pathname }: { onLinkClick?: () => void; onLogout: () => void; pathname: string }) {
    return (
        <nav className="p-4 flex flex-col h-full bg-slate-950 text-slate-300">
            <ul className="space-y-1 flex-grow">
                <li>
                    <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Main Dashboard</span>
                    </Link>
                </li>
                <li className="px-3 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hub Operations</li>
                <li>
                    <Link href="/hub" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/hub' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                        <ScanLine className="h-5 w-5" />
                        <span>Scan & Verify</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/shortages" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/hub/shortages' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                        <AlertTriangle className="h-5 w-5" />
                        <span>Shortage Report</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/dispatch" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/hub/dispatch' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                        <Truck className="h-5 w-5" />
                        <span>Outbound Dispatch</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/outbound-history" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/hub/outbound-history' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                        <History className="h-5 w-5" />
                        <span>Outbound History</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/vehicles" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/hub/vehicles' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                        <Car className="h-5 w-5" />
                        <span>Vehicle Management</span>
                    </Link>
                </li>
            </ul>
            <div className="space-y-2 border-t border-white/10 pt-4">
                <Link href="/booking/settings" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </Link>
                <Button variant="ghost" onClick={onLogout} className="w-full justify-start flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/20 hover:text-red-400 transition-colors text-base text-slate-400">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>
        </nav>
    );
}

function HubLayoutContent({ children }: { children: React.ReactNode }) {
    const [year, setYear] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace('/login');
            } else if (user.role !== 'admin' && !user.roles?.includes('hub')) {
                toast({ title: "Access Denied", description: "You don't have permission to access the hub module.", variant: "destructive" });
                router.replace('/dashboard');
            }
        }
    }, [user, isLoading, router, toast]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !user || (user.role !== 'admin' && !user.roles?.includes('hub'))) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

    const handleLinkClick = () => {
        setIsSheetOpen(false);
    };

    return (
        <DataProvider>
            <div className="flex min-h-screen bg-background">
                <aside className="w-64 bg-slate-950 border-r border-white/10 hidden lg:flex lg:flex-col">
                    <div className="flex items-center justify-center p-6 border-b border-white/10 bg-slate-950">
                        <Logo />
                    </div>
                    <NavLinks onLogout={handleLogout} pathname={pathname} />
                </aside>
                <div className="flex-1 flex flex-col">
                    <header className="flex h-16 items-center gap-4 border-b bg-slate-950 px-6 lg:hidden text-white">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col p-0 bg-slate-950 border-white/10">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex items-center justify-center p-4 border-b border-white/10">
                                    <Logo />
                                </div>
                                <NavLinks onLinkClick={handleLinkClick} onLogout={handleLogout} pathname={pathname} />
                            </SheetContent>
                        </Sheet>
                        <div className="flex-1">
                            <h1 className="font-semibold text-xl text-primary uppercase tracking-tighter">HUB Dashboard</h1>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-8 bg-background">
                        {children}
                    </main>
                    <footer className="text-center p-4 text-sm text-muted-foreground border-t bg-card">
                        {year && <p>&copy; {year} RAJ CARGO. All rights reserved.</p>}
                    </footer>
                </div>
            </div>
        </DataProvider>
    );
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
    return <HubLayoutContent>{children}</HubLayoutContent>
}