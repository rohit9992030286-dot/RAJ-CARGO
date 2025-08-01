
'use client';

import { useContext, useMemo } from 'react';
import { DataContext } from '@/components/DataContext';
import { useAuth } from './useAuth';
import { Manifest } from '@/types/manifest';

export function useManifests() {
  const context = useContext(DataContext);
  const { user } = useAuth();
  
  if (!context) {
    throw new Error('useManifests must be used within a DataProvider');
  }

  const { manifests, isLoaded } = context;

  const filteredManifests = useMemo(() => {
    if (!user || !isLoaded) return [];

    if (user.role === 'admin') {
      return manifests;
    }
    
    const userPartnerCode = user.partnerCode;
    const userRoles = user.roles || [];
    
    if (userRoles.includes('booking')) {
        return manifests.filter(manifest => manifest.creatorPartnerCode === userPartnerCode);
    }
    
    if (userRoles.includes('hub')) {
        // Hub users see all dispatched manifests from booking and all hub-originated manifests.
        return manifests.filter(m => 
            (m.origin === 'booking') || 
            (m.origin === 'hub')
        );
    }

    if (userRoles.includes('delivery')) {
        return manifests.filter(manifest => manifest.deliveryPartnerCode === userPartnerCode);
    }

    return [];

  }, [manifests, user, isLoaded]);


  return {
    manifests: filteredManifests,
    allManifests: context.manifests,
    addManifest: context.addManifest,
    updateManifest: context.updateManifest,
    deleteManifest: context.deleteManifest,
    getManifestById: context.getManifestById,
    isLoaded: context.isLoaded,
  };
}
