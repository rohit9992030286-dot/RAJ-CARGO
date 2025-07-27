
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
    if (!user) return [];
    if (user.role === 'admin' && user.partnerCode === 'ALL_ACCESS') {
      return context.waybills; // Admin with special code sees all
    }
    return context.waybills.filter(w => w.partnerCode === user.partnerCode);
  }, [context.waybills, user]);

  return {
    waybills: filteredWaybills,
    addWaybill: (waybill: Waybill, silent?: boolean) => context.addWaybill(waybill, silent),
    updateWaybill: context.updateWaybill,
    deleteWaybill: context.deleteWaybill,
    getWaybillById: context.getWaybillById,
    isLoaded: context.isLoaded,
  };
}
