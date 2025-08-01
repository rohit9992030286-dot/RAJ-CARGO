
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

  const filteredManifests = useMemo(() => {
    if (!user || !context.isLoaded) return [];

    if (user.role === 'admin') {
      return context.manifests;
    }
    
    const userPartnerCode = user.partnerCode;
    const userRoles = user.roles || [];
    
    // Return all manifests for booking role of the user's partner code.
    if (userRoles.includes('booking')) {
        return context.manifests.filter(manifest => manifest.creatorPartnerCode === userPartnerCode);
    }
    
    // For hub users, show all booking manifests that are in-progress and all hub-originated manifests.
    if (userRoles.includes('hub')) {
        return context.manifests.filter(manifest => {
            const isDispatchedBookingManifest = manifest.origin === 'booking' && (manifest.status === 'Dispatched' || manifest.status === 'Received');
            const isHubManifest = manifest.origin === 'hub';
            return isDispatchedBookingManifest || isHubManifest;
        });
    }

    // For delivery users, show manifests assigned to their partner code.
    if (userRoles.includes('delivery')) {
        return context.manifests.filter(manifest => manifest.deliveryPartnerCode === userPartnerCode && manifest.status === 'Dispatched');
    }

    return [];

  }, [context.manifests, user, context.isLoaded]);


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
