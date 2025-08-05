
'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Menu, Settings, Cpu, LayoutDashboard, Truck, LogOut, Loader2, List, History } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

function NavLinks({ onLinkClick, onLogout, pathname }: { onLinkClick?: () => void; onLogout: () => void; pathname: string; }) {
    
    const navItems = [
        { href: '/delivery', label: 'Delivery Sheet', icon: List },
        { href: '/delivery/history', label: 'Delivery History', icon: History },
    ];
    
    return (
        <nav className="p-4 flex flex-col h-full">
            <ul className="space-y-2 flex-grow">
                <li>
                    <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Main Dashboard</span>
                    </Link>
                </li>
                <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Delivery</li>
                {navItems.map((item) => (
                     <li key={item.href}>
                        <Link 
                            href={item.href} 
                            onClick={onLinkClick} 
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                pathname === item.href ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/10 hover:text-primary"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="space-y-2 border-t pt-4">
                <Link href="/booking/settings" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </Link>
                <Button variant="ghost" onClick={onLogout} className="w-full justify-start flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-base">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>
        </nav>
    );
}

function DeliveryLayoutContent({ children }: { children: React.ReactNode }) {
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
            } else if (user.role !== 'admin' && !user.roles?.includes('delivery')) {
                toast({ title: "Access Denied", description: "You don't have permission to access the delivery module.", variant: "destructive" });
                router.replace('/dashboard');
            }
        }
    }, [user, isLoading, router, toast]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !user || (user.role !== 'admin' && !user.roles?.includes('delivery'))) {
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
                <aside className="w-64 bg-card border-r hidden lg:flex lg:flex-col">
                    <div className="flex items-center justify-center p-6 border-b">
                        <Logo />
                    </div>
                    <NavLinks onLogout={handleLogout} pathname={pathname} />
                </aside>
                <div className="flex-1 flex flex-col">
                    <header className="flex h-16 items-center gap-4 border-b bg-card px-6 lg:hidden">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col p-0 bg-card">
                                <SheetHeader>
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex items-center justify-center p-4 border-b">
                                    <Logo />
                                </div>
                                <NavLinks onLinkClick={handleLinkClick} onLogout={handleLogout} pathname={pathname} />
                            </SheetContent>
                        </Sheet>
                        <div className="flex-1">
                            <h1 className="font-semibold text-xl text-primary">RAJ CARGO - DELIVERY</h1>
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

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
    return <DeliveryLayoutContent>{children}</DeliveryLayoutContent>
}
