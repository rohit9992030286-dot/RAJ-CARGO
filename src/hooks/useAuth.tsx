
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export const AUTH_STORAGE_KEY = 'yuwon-auth';
export const USERS_STORAGE_KEY = 'yuwon-users';
const ADMIN_PIN_VERIFIED_KEY = 'yuwon-admin-pin-verified';
const ADMIN_PIN = '1234'; // The secret PIN for admin access

export interface User {
  username: string;
  partnerName?: string;
  role: 'admin' | 'staff';
  roles: ('booking' | 'hub' | 'delivery' | 'account')[];
  partnerCode?: string;
  companyCode?: string;
  state?: string;
  city?: string;
}

export interface NewUser extends User {
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  users: NewUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminPinVerified: boolean;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  addUser: (newUser: NewUser) => boolean;
  deleteUser: (username: string) => void;
  updateUser: (updatedUser: NewUser) => boolean;
  verifyAdminPin: (pin: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_ADMIN_USER: NewUser = {
  username: 'admin',
  partnerName: 'Main Administrator',
  password: 'admin',
  role: 'admin' as 'admin',
  roles: ['booking', 'hub', 'delivery', 'account'],
  partnerCode: 'ALL_ACCESS',
};

export function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<NewUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminPinVerified, setIsAdminPinVerified] = useState(false);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN_USER]));
        setUsers([DEFAULT_ADMIN_USER]);
      } else {
        const parsedUsers = JSON.parse(storedUsers);
        const migratedUsers = parsedUsers.map((u: NewUser) => ({
          ...u,
          partnerName: u.partnerName || u.username,
          roles: u.roles?.filter(r => ['booking', 'hub', 'delivery', 'account'].includes(r)) || (u.role === 'admin' ? ['booking', 'hub', 'delivery', 'account'] : [])
        }));
        setUsers(migratedUsers);
      }

      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedUser = JSON.parse(storedAuth);
        parsedUser.roles = parsedUser.roles?.filter((r: string) => ['booking', 'hub', 'delivery', 'account'].includes(r));
        setUser(parsedUser);
      }
      
      const pinVerified = sessionStorage.getItem(ADMIN_PIN_VERIFIED_KEY);
      if (pinVerified === 'true') {
        setIsAdminPinVerified(true);
      }

    } catch (error) {
      console.error("Failed to initialize auth from local storage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USERS_STORAGE_KEY);
      sessionStorage.removeItem(ADMIN_PIN_VERIFIED_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const syncUsersToStorage = (updatedUsers: NewUser[]) => {
      setUsers(updatedUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  }

  const login = useCallback((username: string, password: string): User | null => {
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userToLogin = storedUsers.find((u: NewUser) => u.username === username);

    if (userToLogin && userToLogin.password === password) {
      const loggedInUser: User = { 
        username: userToLogin.username, 
        partnerName: userToLogin.partnerName || userToLogin.username,
        role: userToLogin.role,
        roles: userToLogin.roles?.filter((r:string) => ['booking', 'hub', 'delivery', 'account'].includes(r)) || [],
        partnerCode: userToLogin.partnerCode,
        companyCode: userToLogin.companyCode,
        state: userToLogin.state,
        city: userToLogin.city,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_PIN_VERIFIED_KEY);
    setUser(null);
    setIsAdminPinVerified(false);
  }, []);
  
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

  const verifyAdminPin = useCallback((pin: string): boolean => {
    if (user?.role === 'admin' && pin === ADMIN_PIN) {
        sessionStorage.setItem(ADMIN_PIN_VERIFIED_KEY, 'true');
        setIsAdminPinVerified(true);
        return true;
    }
    return false;
  }, [user]);

  return {
    user,
    users: users,
    isAuthenticated: !!user,
    isLoading,
    isAdminPinVerified,
    login,
    logout,
    addUser,
    deleteUser,
    updateUser,
    verifyAdminPin,
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
