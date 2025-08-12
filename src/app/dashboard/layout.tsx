
'use client';
import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

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
  
  return (
    <DataProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            <div className="flex-shrink-0">
                <Logo />
            </div>
            <div className="flex-1 text-center">
                 <h1 className="font-semibold text-xl text-primary">RAJ CARGO</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-base">
                <LogOut className="mr-2 h-5 w-5" />
                <span>Logout</span>
            </Button>
        </header>
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t bg-card">
          {year && <p>&copy; {year} RAJ CARGO. All rights reserved.</p>}
        </footer>
      </div>
    </DataProvider>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
    return <DashboardLayoutContent>{children}</DashboardLayoutContent>
}
