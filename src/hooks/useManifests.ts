
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
    
    // Booking users see manifests they created
    if (userRoles.includes('booking')) {
        return manifests.filter(manifest => manifest.origin === 'booking' && manifest.creatorPartnerCode === userPartnerCode);
    }

    // Hub users see manifests created by booking offices to verify
    if (userRoles.includes('hub')) {
        return manifests.filter(manifest => manifest.status === 'Dispatched' && manifest.origin === 'booking');
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
    getManifestByNumber: context.getManifestByNumber,
    isLoaded: context.isLoaded,
  };
}
