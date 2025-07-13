
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If auth state is determined and user is not authenticated, redirect to login
      if (isAuthenticated === false) {
        router.replace('/login');
      }
    }, [isAuthenticated, router]);

    // If auth state is not yet determined, show a loading spinner
    if (isAuthenticated === null) {
      return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // If authenticated, render the component
    return isAuthenticated ? <Component {...props} /> : null;
  };
}
