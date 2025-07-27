
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
    if (!user || !context.isLoaded) return context.manifests;

    // Admin with ALL_ACCESS sees everything
    if (user.role === 'admin' && user.partnerCode === 'ALL_ACCESS') {
      return context.manifests;
    }

    const userIsBooking = user.roles.includes('booking');
    const userIsHub = user.roles.includes('hub');

    if (userIsBooking && !userIsHub) {
        // Booking users only see manifests they created
        return context.manifests.filter(m => m.origin === 'booking' && m.creatorPartnerCode === user.partnerCode);
    }
    
    if (userIsHub) {
        const associations = getAssociations();
        const associatedBookingPartners = associations[user.partnerCode || ''] || [];
        
        return context.manifests.filter(manifest => {
            // Hub users see manifests they created (outbound)
            if (manifest.origin === 'hub' && manifest.creatorPartnerCode === user.partnerCode) {
                return true;
            }
            // Hub users see incoming manifests from their associated booking partners
            if (manifest.origin === 'booking' && (manifest.status === 'Dispatched' || manifest.status === 'Received') && associatedBookingPartners.includes(manifest.creatorPartnerCode)) {
                return true;
            }
            return false;
        });
    }

    return context.manifests;

  }, [context.manifests, user, context.isLoaded]);


  return {
    manifests: filteredManifests,
    allManifests: context.manifests, // provide access to all for specific cases if needed
    addManifest: context.addManifest,
    updateManifest: context.updateManifest,
    deleteManifest: context.deleteManifest,
    getManifestById: context.getManifestById,
    isLoaded: context.isLoaded,
  };
}
