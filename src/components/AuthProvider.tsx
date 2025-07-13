
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/hooks/useAuth.tsx';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedAuth = sessionStorage.getItem('ss-cargo-auth');
            setIsAuthenticated(storedAuth === 'true');
        } catch (error) {
            console.error('Could not access session storage:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const login = (username?: string, password?: string) => {
        if (username === 'admin' && password === 'admin') {
            sessionStorage.setItem('ss-cargo-auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('ss-cargo-auth');
        setIsAuthenticated(false);
    };

    const value = { isAuthenticated, isLoaded, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
