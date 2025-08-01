
'use client';

import { useContext, useMemo } from 'react';
import { DataContext } from '@/components/DataContext';
import { useAuth } from './useAuth';
import { Manifest } from '@/types/manifest';

const HUB_PARTNER_ASSOC_KEY = 'rajcargo-hub-partner-associations';

// Helper to get associations from localStorage
const getAssociations = () => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(HUB_PARTNER_ASSOC_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Failed to parse hub associations", e);
        return {};
    }
};

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

    return context.manifests.filter(manifest => {
        // Booking users see manifests they created.
        if (userRoles.includes('booking') && manifest.origin === 'booking' && manifest.creatorPartnerCode === userPartnerCode) {
            return true;
        }

        // Hub users see manifests dispatched from their associated booking partners, or manifests they created.
        if (userRoles.includes('hub')) {
            if (manifest.origin === 'hub' && manifest.creatorPartnerCode === userPartnerCode) {
                return true; // It's an outbound manifest created by this hub.
            }
            if (manifest.origin === 'booking' && (manifest.status === 'Dispatched' || manifest.status === 'Received')) {
                const associations = getAssociations();
                // If this hub has specific partners, check if the manifest's creator is one of them.
                if (associations[userPartnerCode!]) {
                    return associations[userPartnerCode!].includes(manifest.creatorPartnerCode);
                }
                // Fallback for hubs without specific associations: they see all booking manifests.
                if (Object.keys(associations).length === 0) {
                    return true;
                }
            }
        }

        // Delivery users see manifests dispatched to their partner code.
        if (userRoles.includes('delivery')) {
            if (manifest.status === 'Dispatched' && manifest.deliveryPartnerCode === userPartnerCode) {
                return true;
            }
        }

        return false;
    });

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
