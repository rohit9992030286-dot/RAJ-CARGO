'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Menu, Settings, LayoutDashboard, Shield, Users, LogOut, Loader2, KeyRound, Activity, Link2, IndianRupee, Tags, List, AlertTriangle, Building } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { DataProvider } from '@/components/DataContext';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isLoading, logout, isAdminPinVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
        if (!user) {
            router.replace('/login');
        } else if (user.role !== 'admin') {
            router.replace('/dashboard');
        } else if (!isAdminPinVerified && pathname !== '/admin/verify') {
            router.replace('/admin/verify');
        }
    }
  }, [user, isLoading, router, isAdminPinVerified, pathname]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading || !user || user.role !== 'admin' || (!isAdminPinVerified && pathname !== '/admin/verify')) {
      return (
           <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
      )
  }
  
  // Don't render the full layout for the verification page
  if (pathname === '/admin/verify') {
    return <main className="flex-1 p-4 md:p-8 bg-background">{children}</main>;
  }
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="p-4 flex flex-col h-full bg-slate-950 text-slate-300">
      <ul className="space-y-1 flex-grow">
        <li>
          <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span>Main Dashboard</span>
          </Link>
        </li>
        <li className="px-3 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Control</li>
        <li>
          <Link href="/admin" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
            <Shield className="h-5 w-5" />
            <span>Admin Dashboard</span>
          </Link>
        </li>
         <li>
          <Link href="/admin/users" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/users' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </Link>
        </li>
        <li>
          <Link href="/admin/companies" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/companies' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
            <Building className="h-5 w-5" />
            <span>Company Management</span>
          </Link>
        </li>
        <li>
            <Link href="/admin/inventory" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/inventory' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                <List className="h-5 w-5" />
                <span>Waybill Inventory</span>
            </Link>
        </li>
         <li>
            <Link href="/admin/partner-associations" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/partner-associations' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                <Link2 className="h-5 w-5" />
                <span>Partner Associations</span>
            </Link>
        </li>
        <li>
            <Link href="/admin/rates" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/rates' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                <Tags className="h-5 w-5" />
                <span>Rate Management</span>
            </Link>
        </li>
        <li>
            <Link href="/admin/sales-report" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/sales-report' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
                <IndianRupee className="h-5 w-5" />
                <span>Sales Report</span>
            </Link>
        </li>
        <li>
          <Link href="/admin/system-overview" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/system-overview' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
            <Activity className="h-5 w-5" />
            <span>System Overview</span>
          </Link>
        </li>
        <li>
          <Link href="/admin/ewaybill-alerts" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/ewaybill-alerts' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
            <AlertTriangle className="h-5 w-5" />
            <span>E-Way Bill Alerts</span>
          </Link>
        </li>
        <li>
          <Link href="/admin/account" onClick={onLinkClick} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", pathname === '/admin/account' ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-white/10 hover:text-white")}>
            <KeyRound className="h-5 w-5" />
            <span>Account Settings</span>
          </Link>
        </li>
      </ul>
      <div className="space-y-2 border-t border-white/10 pt-4">
        <Link href="/booking/settings" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/20 hover:text-red-400 transition-colors text-base text-slate-400">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
        </Button>
      </div>
    </nav>
  );

  return (
      <div className="flex min-h-screen bg-background">
          <aside className="w-64 bg-slate-950 border-r border-white/10 hidden lg:flex lg:flex-col">
          <div className="flex items-center justify-center p-6 border-b border-white/10 bg-slate-950">
              <Logo />
          </div>
          <NavLinks />
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
                      <NavLinks onLinkClick={handleLinkClick} />
                  </SheetContent>
              </Sheet>
              <div className="flex-1">
                  <h1 className="font-semibold text-xl text-primary uppercase tracking-tighter">Admin Panel</h1>
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
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode; }) {
    return (
        <DataProvider>
          <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </Suspense>
        </DataProvider>
    );
}
