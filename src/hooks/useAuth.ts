
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const AUTH_STORAGE_KEY = 'rajcargo-auth';
export const USERS_STORAGE_KEY = 'rajcargo-users';

export interface User {
  username: string;
  role: 'admin' | 'staff';
}

export interface NewUser extends User {
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (newUser: NewUser) => boolean;
  deleteUser: (username: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_ADMIN_USER = {
  username: 'admin',
  password: 'admin',
  role: 'admin' as 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const value = {
    user,
    users: users.map(({password, ...user}) => user),
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    addUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
