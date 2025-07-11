import Link from 'next/link';
import { Truck, Home, BookCopy, PlusCircle } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-card border-r">
        <div className="flex items-center gap-3 p-6 border-b">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">SwiftWay</h1>
        </div>
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
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 bg-background">
            {children}
        </main>
        <footer className="text-center p-4 text-sm text-muted-foreground border-t">
          <p>&copy; {new Date().getFullYear()} SwiftWay. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
