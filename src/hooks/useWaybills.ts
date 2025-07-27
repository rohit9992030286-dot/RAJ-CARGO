
'use client';

import { useContext, useMemo } from 'react';
import { DataContext } from '@/components/DataContext';
import { useAuth } from './useAuth';
import { Waybill } from '@/types/waybill';

export function useWaybills() {
  const context = useContext(DataContext);
  const { user } = useAuth();

  if (!context) {
    throw new Error('useWaybills must be used within a DataProvider');
  }

  const filteredWaybills = useMemo(() => {
    // Public tracking page or not yet loaded
    if (!user) {
      return context.waybills; 
    }
    // Admin sees everything
    if (user.role === 'admin') {
      return context.waybills;
    }
    // Otherwise, filter waybills by the logged-in user's partner code
    return context.waybills.filter(w => w.partnerCode === user.partnerCode);
  }, [context.waybills, user]);

  return {
    waybills: filteredWaybills,
    allWaybills: context.waybills,
    addWaybill: (waybill: Waybill, silent?: boolean) => context.addWaybill(waybill, silent),
    updateWaybill: context.updateWaybill,
    deleteWaybill: context.deleteWaybill,
    getWaybillById: context.getWaybillById,
    isLoaded: context.isLoaded,
  };
}
