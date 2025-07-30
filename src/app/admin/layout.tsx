
'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Settings, Cpu, LayoutDashboard, Shield, Users, LogOut, Loader2, KeyRound, Activity, Link2, IndianRupee, Tags } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter } from 'next/navigation';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';

function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
        if (!user) {
            router.replace('/login');
        } else if (user.role !== 'admin') {
            router.replace('/dashboard');
        }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
      return (
           <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
      )
  }
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="p-4 flex flex-col h-full">
      <ul className="space-y-2 flex-grow">
        <li>
          <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span>Main Dashboard</span>
          </Link>
        </li>
        <li className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Admin</li>
        <li>
          <Link href="/admin" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <Shield className="h-5 w-5" />
            <span>Admin Dashboard</span>
          </Link>
        </li>
         <li>
          <Link href="/admin/users" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </Link>
        </li>
        <li>
            <Link href="/admin/partners" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                <Link2 className="h-5 w-5" />
                <span>Partner Management</span>
            </Link>
        </li>
        <li>
            <Link href="/admin/rates" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                <Tags className="h-5 w-5" />
                <span>Rate Management</span>
            </Link>
        </li>
        <li>
            <Link href="/admin/sales" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                <IndianRupee className="h-5 w-5" />
                <span>Sales Report</span>
            </Link>
        </li>
        <li>
          <Link href="/admin/system-overview" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <Activity className="h-5 w-5" />
            <span>System Overview</span>
          </Link>
        </li>
        <li>
          <Link href="/admin/account" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <KeyRound className="h-5 w-5" />
            <span>Account Settings</span>
          </Link>
        </li>
      </ul>
      <div className="space-y-2 border-t pt-4">
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

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-background">
          <aside className="w-64 bg-card border-r hidden lg:flex lg:flex-col">
          <div className="flex items-center justify-center p-6 border-b">
              <Logo />
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
                      <div className="flex items-center justify-center p-4 border-b">
                           <Logo />
                      </div>
                      <NavLinks onLinkClick={handleLinkClick} />
                  </SheetContent>
              </Sheet>
              <div className="flex-1">
                  <h1 className="font-semibold text-xl text-primary">RAJ CARGO - ADMIN</h1>
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

export default AdminLayout;
