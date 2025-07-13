
'use client';

import { createContext, useContext } from 'react';

interface AuthContextType {
    isAuthenticated: boolean | null;
    isLoaded: boolean;
    login: (username?: string, password?: string) => boolean;
    logout: () => void;
    updateCredentials: (username?: string, password?: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
