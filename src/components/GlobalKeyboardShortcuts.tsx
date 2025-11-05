'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function GlobalKeyboardShortcuts() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.altKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      if (isAuthenticated) {
        logout();
        toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
        router.push('/login');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, logout, router, toast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return null; // This component does not render anything
}
