
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/hooks/useAuth.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    const getCredentials = () => {
        try {
            const storedCreds = localStorage.getItem('ss-cargo-credentials');
            if (storedCreds) {
                return JSON.parse(storedCreds);
            }
        } catch (error) {
            console.error('Could not access credentials from local storage:', error);
        }
        return { username: 'admin', password: 'admin' };
    };

    useEffect(() => {
        try {
            const storedAuth = localStorage.getItem('ss-cargo-auth');
            setIsAuthenticated(storedAuth === 'true');
        } catch (error) {
            console.error('Could not access local storage:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const login = (username?: string, password?: string) => {
        const creds = getCredentials();
        if (username === creds.username && password === creds.password) {
            localStorage.setItem('ss-cargo-auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('ss-cargo-auth');
        setIsAuthenticated(false);
    };

    const updateCredentials = (newUsername?: string, newPassword?: string) => {
        if (newUsername && newPassword) {
            const creds = { username: newUsername, password: newPassword };
            localStorage.setItem('ss-cargo-credentials', JSON.stringify(creds));
            return true;
        }
        return false;
    };

    const value = { isAuthenticated, isLoaded, login, logout, updateCredentials };

    if (clientId) {
      return (
        <AuthContext.Provider value={value}>
            <GoogleOAuthProvider clientId={clientId}>
                {children}
            </GoogleOAuthProvider>
        </AuthContext.Provider>
      );
    }
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
