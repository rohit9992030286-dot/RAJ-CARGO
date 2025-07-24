
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'rajcargo-auth';
const CREDENTIALS_KEY = 'rajcargo-credentials';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<true | false>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const authStatus = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'false');
      setIsAuthenticated(authStatus);
    } catch {
      setIsAuthenticated(false);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback((username, password) => {
    try {
        let storedCreds = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '{}');
        
        // If no credentials are set, default to admin/admin
        if (!storedCreds.username) {
            storedCreds = { username: 'admin', password: 'admin'};
            localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(storedCreds));
        }

        if (username === storedCreds.username && password === storedCreds.password) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    } catch {
        return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    router.replace('/login');
  }, [router]);

  const updateCredentials = useCallback((newUsername, newPassword) => {
    if (!newUsername || !newPassword) return false;
    try {
        const newCreds = { username: newUsername, password: newPassword };
        localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(newCreds));
        return true;
    } catch {
        return false;
    }
  }, []);


  return { isAuthenticated, isLoading, login, logout, updateCredentials };
}
