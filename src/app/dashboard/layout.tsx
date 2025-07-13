
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Home, BookCopy, PlusCircle, ScanLine, Menu, ClipboardList } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  const NavLinks = () => (
    <nav className="p-4">
      <ul>
        <li>
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/waybills" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <BookCopy className="h-5 w-5" />
            <span>Waybill Book</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/waybills/create" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <PlusCircle className="h-5 w-5" />
            <span>Create Waybill</span>
          </Link>
        </li>
        <li>
            <Link href="/dashboard/manifest" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                <ClipboardList className="h-5 w-5" />
                <span>Manifest</span>
            </Link>
        </li>
        <li>
          <Link href="/dashboard/print-sticker" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
            <ScanLine className="h-5 w-5" />
            <span>Print Sticker</span>
          </Link>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
       <aside className="w-64 bg-card border-r hidden lg:block">
        <div className="flex items-center gap-3 p-6 border-b">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">SS CARGO</h1>
        </div>
        <NavLinks />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center gap-3 p-4 border-b">
                        <Truck className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold">SS CARGO</h1>
                    </div>
                    <NavLinks />
                </SheetContent>
            </Sheet>
            <div className="flex-1">
                 <h1 className="font-semibold text-xl">SS CARGO</h1>
            </div>
        </header>
        <main className="flex-1 p-8 bg-background">
            {children}
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
          {year && <p>&copy; {year} SS CARGO. All rights reserved.</p>}
        </footer>
      </div>
    </div>
  );
}
