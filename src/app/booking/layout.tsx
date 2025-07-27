
'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Send, Home, BookCopy, PlusCircle, ScanLine, Menu, Settings, Settings2, Truck, Cpu, LayoutDashboard, IndianRupee, CheckCircle, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
    const { logout } = useAuth();
    return (
        <nav className="p-4 flex flex-col h-full">
            <ul className="space-y-2 flex-grow">
                <li>
                    <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Main Dashboard</span>
                    </Link>
                </li>
                <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Booking</li>
                <li>
                    <Link href="/booking" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <Home className="h-5 w-5" />
                        <span>Booking Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link href="/booking/waybills/create" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <PlusCircle className="h-5 w-5" />
                        <span>Create Waybill</span>
                    </Link>
                </li>
                <li>
                    <Link href="/booking/waybills" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <BookCopy className="h-5 w-5" />
                        <span>Waybill Book</span>
                    </Link>
                </li>
                <li>
                    <Link href="/booking/manifest" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <Truck className="h-5 w-5" />
                        <span>Dispatch Manifests</span>
                    </Link>
                </li>
                <li>
                    <Link href="/booking/delivered" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <CheckCircle className="h-5 w-5" />
                        <span>Delivered Waybills</span>
                    </Link>
                </li>
                <li>
                    <Link href="/booking/print-sticker" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <ScanLine className="h-5 w-5" />
                        <span>Print Sticker</span>
                    </Link>
                </li>
                <li>
                    <Link href="/booking/sales" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                        <IndianRupee className="h-5 w-5" />
                        <span>Sales Report</span>
                    </Link>
                </li>
            </ul>
            <div className="space-y-2 border-t pt-4">
                <Link href="/booking/configuration" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                    <Settings2 className="h-5 w-5" />
                    <span>Configuration</span>
                </Link>
                <Link href="/booking/settings" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </Link>
                 <Button variant="ghost" onClick={() => logout()} className="w-full justify-start flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-base">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>
        </nav>
    );
}

function BookingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!isLoading) {
        if (!user) {
            router.replace('/login');
        } else if (user.role !== 'admin' && !user.roles?.includes('booking')) {
            toast({ title: "Access Denied", description: "You don't have permission to access the booking module.", variant: "destructive" });
            router.replace('/dashboard');
        }
    }
  }, [user, isLoading, router, toast]);

  if (isLoading || !user || (user.role !== 'admin' && !user.roles?.includes('booking'))) {
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
      <div className="flex min-h-screen bg-background">
        <aside className="w-64 bg-card border-r hidden lg:flex lg:flex-col">
          <div className="flex items-center gap-3 p-6 border-b">
            <Send className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">RAJ CARGO</h1>
          </div>
          <NavLinks />
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
                      <div className="flex items-center gap-3 p-4 border-b">
                          <Send className="h-8 w-8 text-primary" />
                          <h1 className="text-2xl font-bold text-primary">RAJ CARGO</h1>
                      </div>
                      <NavLinks onLinkClick={handleLinkClick} />
                  </SheetContent>
              </Sheet>
              <div className="flex-1">
                   <h1 className="font-semibold text-xl text-primary">RAJ CARGO - BOOKING</h1>
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
  );
}


export default function BookingLayout({ children }: { children: React.ReactNode; }) {
    return <BookingLayoutContent>{children}</BookingLayoutContent>
}
