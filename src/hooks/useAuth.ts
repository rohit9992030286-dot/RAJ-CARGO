
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'ss-cargo-auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check session storage on initial load
    const storedAuth = sessionStorage.getItem(AUTH_KEY);
    setIsAuthenticated(storedAuth === 'true');
  }, []);

  const login = (username, password) => {
    // Hardcoded credentials for simplicity
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return { isAuthenticated, login, logout };
}
