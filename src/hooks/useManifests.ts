
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

    // Admin with ALL_ACCESS sees everything
    if (user.role === 'admin' && user.partnerCode === 'ALL_ACCESS') {
      return context.manifests;
    }

    const userIsBooking = user.roles.includes('booking');
    const userIsHub = user.roles.includes('hub');

    // Scenario 1: User is ONLY a booking agent
    if (userIsBooking && !userIsHub) {
        return context.manifests.filter(m => m.origin === 'booking' && m.creatorPartnerCode === user.partnerCode);
    }
    
    // Scenario 2: User has Hub access (could also have booking access)
    if (userIsHub) {
        const associations = getAssociations();
        const hubPartnerCode = user.partnerCode || '';
        const associatedBookingPartners = associations[hubPartnerCode] || [];
        const hasSpecificAssociations = associatedBookingPartners.length > 0;

        return context.manifests.filter(manifest => {
            // Rule 1: Hub users always see outbound manifests they created themselves.
            if (manifest.origin === 'hub' && manifest.creatorPartnerCode === hubPartnerCode) {
                return true;
            }

            // Rule 2: Filter incoming booking manifests.
            if (manifest.origin === 'booking') {
                 // Ignore drafts from booking
                if (manifest.status === 'Draft') return false;

                // If associations exist, only show manifests from linked partners.
                if (hasSpecificAssociations) {
                    return associatedBookingPartners.includes(manifest.creatorPartnerCode);
                } else {
                    // If NO associations exist, show all booking manifests.
                    return true;
                }
            }

            return false;
        });
    }

    // Default: if user has no specific roles that grant visibility, show nothing.
    return [];

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
