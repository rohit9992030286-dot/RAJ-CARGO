
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
            // Show incoming manifests from associated booking partners
            if (manifest.origin === 'booking' && (manifest.status === 'Dispatched' || manifest.status === 'Received')) {
                // If hub has associations, filter by them. Otherwise, show all.
                if (Object.keys(associations).length > 0 && associatedBookingPartners.length === 0 && !Object.values(associations).flat().includes(user.partnerCode)) {
                    // This hub is not associated with any booking partner, so it shouldn't see any booking manifests unless it's a "catch-all" hub.
                    // For simplicity, we assume if a hub has no associations defined for it, it sees nothing from booking.
                    // A hub that IS an association target for another hub is not covered here, adjust if needed.
                    return false;
                }
                if (associatedBookingPartners.length > 0) {
                    return associatedBookingPartners.includes(manifest.creatorPartnerCode);
                }
                 // If no associations are defined AT ALL for this hub, show all booking manifests by default.
                return true;
            }
            
            // Show all manifests created by this hub
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
