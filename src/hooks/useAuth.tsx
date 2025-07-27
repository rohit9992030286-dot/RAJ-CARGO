
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const AUTH_STORAGE_KEY = 'rajcargo-auth';
export const USERS_STORAGE_KEY = 'rajcargo-users';

export interface User {
  username: string;
  role: 'admin' | 'staff';
  roles: ('booking' | 'hub' | 'delivery')[];
  partnerCode?: string;
}

export interface NewUser extends User {
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  users: NewUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (newUser: NewUser) => boolean;
  deleteUser: (username: string) => void;
  updateUser: (updatedUser: NewUser) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_ADMIN_USER: NewUser = {
  username: 'admin',
  password: 'admin',
  role: 'admin' as 'admin',
  roles: ['booking', 'hub', 'delivery'],
  partnerCode: 'ALL_ACCESS',
};

export function useProvideAuth() {
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
        const parsedUsers = JSON.parse(storedUsers);
        // Ensure all users have a roles array for backward compatibility
        const migratedUsers = parsedUsers.map((u: NewUser) => ({
          ...u,
          roles: u.roles || (u.role === 'admin' ? ['booking', 'hub', 'delivery'] : [])
        }));
        setUsers(migratedUsers);
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
      const loggedInUser: User = { 
        username: userToLogin.username, 
        role: userToLogin.role,
        roles: userToLogin.roles || [],
        partnerCode: userToLogin.partnerCode
      };
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

  const updateUser = useCallback((updatedUser: NewUser): boolean => {
    const currentUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    if (!currentUsers.some((u: NewUser) => u.username === updatedUser.username)) {
        return false; // User not found
    }
    const updatedUsers = currentUsers.map((u: NewUser) => u.username === updatedUser.username ? updatedUser : u);
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
    users: users,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    addUser,
    deleteUser,
    updateUser,
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useProvideAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}
