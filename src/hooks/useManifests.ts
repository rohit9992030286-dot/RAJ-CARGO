
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

  const { manifests, isLoaded, associations } = context;

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

    // Hub users see manifests dispatched by booking offices or other hubs to them
    if (userRoles.includes('hub')) {
        return manifests.filter(manifest => {
            if (manifest.status !== 'Dispatched') return false;
            if (manifest.origin === 'booking') {
                const destinationHub = associations.bookingToHub[manifest.creatorPartnerCode];
                return destinationHub === userPartnerCode;
            }
            if (manifest.origin === 'hub') {
                 return manifest.destinationHubCode === userPartnerCode;
            }
            return false;
        });
    }

    // Delivery users see manifests assigned to them
    if (userRoles.includes('delivery')) {
        return manifests.filter(manifest => manifest.origin === 'hub' && manifest.deliveryPartnerCode === userPartnerCode);
    }
    
    return [];

  }, [manifests, user, isLoaded, associations]);


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
