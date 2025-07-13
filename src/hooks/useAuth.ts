
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const AUTH_KEY = 'ss-cargo-auth';

interface AuthContextType {
    isAuthenticated: boolean | null;
    isLoaded: boolean;
    login: (username?: string, password?: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedAuth = sessionStorage.getItem(AUTH_KEY);
            setIsAuthenticated(storedAuth === 'true');
        } catch (error) {
            console.error('Could not access session storage:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const login = (username?: string, password?: string) => {
        // Hardcoded credentials for simplicity
        if (username === 'admin' && password === 'admin') {
            sessionStorage.setItem(AUTH_KEY, 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
        // Let the component redirect
    };

    const value = { isAuthenticated, isLoaded, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
