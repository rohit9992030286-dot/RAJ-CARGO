'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Menu, Settings, Truck, LayoutDashboard, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';

function BookingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);
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
        } else if (user.role !== 'admin' && !user.roles?.includes('booking') && !user.roles?.includes('delivery')) {
            toast({ title: "Access Denied", description: "You don't have permission to access the booking module.", variant: "destructive" });
            router.replace('/dashboard');
        }
    }
  }, [user, isLoading, router, toast]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user || (user.role !== 'admin' && !user.roles?.includes('booking') && !user.roles?.includes('delivery'))) {
      return (
           <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
      )
  }
  
  return (
    <DataProvider>
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-slate-900 px-6 shadow-md shadow-primary/10">
              <div className="flex-shrink-0">
                  <Link href="/dashboard"><Logo /></Link>
              </div>
              <div className="flex-1 text-center hidden sm:block">
                   <h1 className="font-extrabold text-xl text-primary tracking-tighter uppercase italic">Booking Center</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/booking">
                    <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                        Dashboard
                    </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="text-white border-white/20 hover:bg-destructive hover:border-destructive hover:text-white transition-all">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </Button>
              </div>
          </header>
          <main className="flex-1 p-4 md:p-8 bg-background">
              {children}
          </main>
          <footer className="text-center p-4 text-sm text-muted-foreground border-t bg-card">
            {year && <p>&copy; {year} YU-WON LOGISTICS. All rights reserved.</p>}
          </footer>
        </div>
      </div>
    </DataProvider>
  );
}


export default function BookingLayout({ children }: { children: React.ReactNode; }) {
    return <BookingLayoutContent>{children}</BookingLayoutContent>
}
