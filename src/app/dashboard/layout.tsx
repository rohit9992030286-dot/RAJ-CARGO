
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Home, BookCopy, PlusCircle, ScanLine, Menu, ClipboardList, IndianRupee, LogOut, Settings, Warehouse } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/components/withAuth';
import { useAuth } from '@/hooks/useAuth';
import { DataProvider } from '@/components/DataContext';

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const handleLogoutClick = () => {
    handleLinkClick();
    logout();
  }

  const NavLinks = ({ onLinkClick, onLogoutClick }: { onLinkClick?: () => void, onLogoutClick?: () => void }) => (
    <nav className="p-4 flex flex-col h-full">
      <ul className="space-y-2 flex-grow">
        <li>
          <Link href="/dashboard" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/waybills" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <BookCopy className="h-5 w-5" />
            <span>Waybill Book</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/waybills/create" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <PlusCircle className="h-5 w-5" />
            <span>Create Waybill</span>
          </Link>
        </li>
         <li>
          <Link href="/dashboard/waybill-inventory" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <Warehouse className="h-5 w-5" />
            <span>Waybill Inventory</span>
          </Link>
        </li>
        <li>
            <Link href="/dashboard/manifest" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                <ClipboardList className="h-5 w-5" />
                <span>Manifests</span>
            </Link>
        </li>
        <li>
            <Link href="/dashboard/sales" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                <IndianRupee className="h-5 w-5" />
                <span>Sales</span>
            </Link>
        </li>
        <li>
          <Link href="/dashboard/print-sticker" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <ScanLine className="h-5 w-5" />
            <span>Print Sticker</span>
          </Link>
        </li>
      </ul>
      <div className="space-y-2">
        <Link href="/dashboard/settings" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
        </Link>
        <Button variant="outline" onClick={onLogoutClick} className="w-full justify-start">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
        </Button>
      </div>
    </nav>
  );

  return (
    <DataProvider>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-card border-r hidden lg:flex lg:flex-col">
          <div className="flex items-center gap-3 p-6 border-b">
            <Truck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">SS CARGO</h1>
          </div>
          <NavLinks onLogoutClick={logout} />
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6 lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                          <Menu className="h-6 w-6" />
                          <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col p-0">
                      <SheetHeader>
                          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                      </SheetHeader>
                      <div className="flex items-center gap-3 p-4 border-b">
                          <Truck className="h-8 w-8 text-primary" />
                          <h1 className="text-2xl font-bold">SS CARGO</h1>
                      </div>
                      <NavLinks onLinkClick={handleLinkClick} onLogoutClick={handleLogoutClick} />
                  </SheetContent>
              </Sheet>
              <div className="flex-1">
                   <h1 className="font-semibold text-xl">SS CARGO</h1>
              </div>
               <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
              </Button>
          </header>
          <main className="flex-1 p-8 bg-background">
              {children}
          </main>
          <footer className="text-center p-4 text-sm text-muted-foreground border-t">
            {year && <p>&copy; {year} SS CARGO. All rights reserved.</p>}
          </footer>
        </div>
      </div>
    </DataProvider>
  );
}

export default withAuth(DashboardLayout);
