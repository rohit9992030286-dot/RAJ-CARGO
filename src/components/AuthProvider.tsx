
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/hooks/useAuth.tsx';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    const getCredentials = () => {
        try {
            const storedCreds = localStorage.getItem('swiftway-credentials');
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
            const storedAuth = localStorage.getItem('swiftway-auth');
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
            localStorage.setItem('swiftway-auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('swiftway-auth');
        setIsAuthenticated(false);
    };

    const updateCredentials = (newUsername?: string, newPassword?: string) => {
        if (newUsername && newPassword) {
            const creds = { username: newUsername, password: newPassword };
            localStorage.setItem('swiftway-credentials', JSON.stringify(creds));
            return true;
        }
        return false;
    };

    const value = { isAuthenticated, isLoaded, login, logout, updateCredentials };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
