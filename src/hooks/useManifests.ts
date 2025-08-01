
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

    const userIsBooking = user.roles.includes('booking');
    const userIsHub = user.roles.includes('hub');
    const userIsDelivery = user.roles.includes('delivery');

    if (userIsDelivery) {
        return context.manifests.filter(manifest => {
            // Manifest dispatched from hub to this delivery partner
            if (manifest.origin === 'hub' && manifest.status === 'Dispatched' && manifest.deliveryPartnerCode === user.partnerCode) {
                return true;
            }
            // Manifest dispatched from booking directly to this delivery partner
            if (manifest.origin === 'booking' && manifest.status === 'Dispatched' && manifest.deliveryPartnerCode === user.partnerCode) {
                return true;
            }
            return false;
        });
    }
    
    if (userIsHub) {
        const associations = getAssociations();
        const associatedBookingPartners = associations[user.partnerCode || ''] || [];

        return context.manifests.filter(manifest => {
            // Show incoming manifests from booking partners this hub is associated with.
            if (manifest.origin === 'booking' && (manifest.status === 'Dispatched' || manifest.status === 'Received')) {
                 // If no associations are defined at all, hub sees everything by default (catch-all)
                if (Object.keys(associations).length === 0) {
                    return true;
                }
                // If associations are defined, hub only sees manifests from its linked booking partners
                return associatedBookingPartners.includes(manifest.creatorPartnerCode);
            }
            
            // Show all manifests created by this hub for outbound dispatch.
            if (manifest.origin === 'hub' && manifest.creatorPartnerCode === user.partnerCode) {
                return true;
            }
            
            return false;
        });
    }


    if (userIsBooking) {
        return context.manifests.filter(m => m.origin === 'booking' && m.creatorPartnerCode === user.partnerCode);
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
