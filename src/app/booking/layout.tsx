
'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Settings, Settings2, Truck, Cpu, LayoutDashboard, CheckCircle, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';


function BookingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
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
        } else if (!user.roles?.includes('booking') && user.role !== 'admin') {
            toast({ title: "Access Denied", description: "You don't have permission to access the booking module.", variant: "destructive" });
            router.replace('/dashboard');
        }
    }
  }, [user, isLoading, router, toast]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user || (!user.roles?.includes('booking') && user.role !== 'admin')) {
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
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
              <div className="flex-shrink-0">
                  <Link href="/dashboard"><Logo /></Link>
              </div>
              <div className="flex-1 text-center">
                   <h1 className="font-semibold text-xl text-primary">RAJ CARGO - BOOKING</h1>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-base">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Logout</span>
              </Button>
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


export default function BookingLayout({ children }: { children: React.ReactNode; }) {
    return <BookingLayoutContent>{children}</BookingLayoutContent>
}
