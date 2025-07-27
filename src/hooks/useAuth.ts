
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const AUTH_STORAGE_KEY = 'rajcargo-auth';
export const USERS_STORAGE_KEY = 'rajcargo-users';

export interface User {
  username: string;
  role: 'admin' | 'staff';
  partnerCode?: string; // Admins might not have one, or a special one
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

export const DEFAULT_ADMIN_USER: NewUser = {
  username: 'admin',
  password: 'admin',
  role: 'admin' as 'admin',
  partnerCode: 'ALL_ACCESS', // Special code for admin to see all data
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
