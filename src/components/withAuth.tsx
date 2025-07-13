
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const { isAuthenticated, isLoaded } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (isLoaded && !isAuthenticated) {
        router.replace('/login');
      }
    }, [isAuthenticated, isLoaded, router]);

    if (!isLoaded || !isAuthenticated) {
      return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}
