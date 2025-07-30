
'use client';

import { useContext, useMemo } from 'react';
import { DataContext } from '@/components/DataContext';
import { useAuth } from './useAuth';

export function useWaybillInventory() {
  const context = useContext(DataContext);
  const { user } = useAuth();

  if (!context) {
    throw new Error('useWaybillInventory must be used within a DataProvider');
  }

  const partnerInventory = useMemo(() => {
    if (!user || !context.isLoaded) return [];
    return context.waybillInventory.filter(item => item.partnerCode === user.partnerCode && !item.isUsed);
  }, [context.waybillInventory, user, context.isLoaded]);

  return {
    waybillInventory: context.waybillInventory,
    availablePartnerInventory: partnerInventory,
    addWaybillToInventory: context.addWaybillToInventory,
    removeWaybillFromInventory: context.removeWaybillFromInventory,
    isInventoryLoaded: context.isLoaded,
  };
}
