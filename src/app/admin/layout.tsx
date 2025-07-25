
'use client';
import { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, Menu, Settings, Cpu, LayoutDashboard, Shield, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DataProvider } from '@/components/DataContext';
import { AuthContext, User, NewUser, AUTH_STORAGE_KEY, USERS_STORAGE_KEY, DEFAULT_ADMIN_USER } from '@/hooks/useAuth';

function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<NewUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN_USER]));
        setUsers([DEFAULT_ADMIN_USER]);
      } else {
        setUsers(JSON.parse(storedUsers));
      }

      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        setUser(JSON.parse(storedAuth));
      }
    } catch (error) {
      console.error("Failed to initialize auth from local storage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USERS_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const syncUsersToStorage = (updatedUsers: NewUser[]) => {
      setUsers(updatedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }

  const login = useCallback((username: string, password: string): boolean => {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userToLogin = storedUsers.find((u: NewUser) => u.username === username);

    if (userToLogin && userToLogin.password === password) {
      const loggedInUser: User = { username: userToLogin.username, role: userToLogin.role };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);
  
  const addUser = useCallback((newUser: NewUser): boolean => {
    const currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    if(currentUsers.some((u: NewUser) => u.username === newUser.username)) {
        return false;
    }
    const updatedUsers = [...currentUsers, newUser];
    syncUsersToStorage(updatedUsers);
    return true;
  }, []);
  
  const deleteUser = useCallback((username: string) => {
    if (username === DEFAULT_ADMIN_USER.username) return;
    const currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const updatedUsers = currentUsers.filter((u: NewUser) => u.username !== username);
    syncUsersToStorage(updatedUsers);
  }, []);

  return {
    user,
    users: users.map(({password, ...user}) => user),
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    addUser,
    deleteUser,
  };
}

function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useProvideAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [year, setYear] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
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
      </ul>
      <div className="space-y-2 border-t pt-4">
        <Link href="/booking/settings" onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
        </Link>
      </div>
    </nav>
  );

  return (
    <AuthProvider>
      <DataProvider>
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
    </AuthProvider>
  );
}

export default AdminLayout;
