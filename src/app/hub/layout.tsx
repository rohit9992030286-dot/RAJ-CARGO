
'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Menu, Settings, Cpu, LayoutDashboard, Truck, LogOut, Loader2, AlertTriangle, ScanLine, History } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';

function NavLinks({ onLinkClick, onLogout }: { onLinkClick?: () => void; onLogout: () => void; }) {
    return (
        <nav className="p-4 flex flex-col h-full">
            <ul className="space-y-2 flex-grow">
                <li>
                    <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Main Dashboard</span>
                    </Link>
                </li>
                <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Hub</li>
                <li>
                    <Link href="/hub" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <ScanLine className="h-5 w-5" />
                        <span>Scan & Verify</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/shortages" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Shortage Report</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/dispatch" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <Truck className="h-5 w-5" />
                        <span>Outbound Dispatch</span>
                    </Link>
                </li>
                 <li>
                    <Link href="/hub/outbound-history" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <History className="h-5 w-5" />
                        <span>Outbound History</span>
                    </Link>
                </li>
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

function HubLayoutContent({ children }: { children: React.ReactNode }) {
    const [year, setYear] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
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
                <aside className="w-64 bg-card border-r hidden lg:flex lg:flex-col">
                    <div className="flex items-center justify-center p-6 border-b">
                        <Logo />
                    </div>
                    <NavLinks onLogout={handleLogout} />
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
                                <NavLinks onLinkClick={handleLinkClick} onLogout={handleLogout} />
                            </SheetContent>
                        </Sheet>
                        <div className="flex-1">
                            <h1 className="font-semibold text-xl text-primary">RAJ CARGO - HUB</h1>
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
