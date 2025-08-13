
'use client';

import { useContext, useMemo } from 'react';
import { DataContext } from '@/components/DataContext';
import { useAuth } from './useAuth';
import { InventoryItem } from '@/types/inventory';

export function useWaybillInventory() {
  const context = useContext(DataContext);
  const { user } = useAuth();

  if (!context) {
    throw new Error('useWaybillInventory must be used within a DataProvider');
  }

  const availablePartnerInventory = useMemo(() => {
    if (!user || !context.isLoaded) return [];
    return context.waybillInventory.filter(item => item.partnerCode === user.partnerCode && !item.isUsed);
  }, [context.waybillInventory, user, context.isLoaded]);
  
  const getAvailableInventoryForCompany = (companyCode?: string, marketOnly = false): InventoryItem[] => {
    if (!user || !context.isLoaded) return [];
    
    // Filter for the partner's available inventory first
    const partnerInventory = context.waybillInventory.filter(item => 
        item.partnerCode === user.partnerCode && !item.isUsed
    );

    if (marketOnly) {
        return partnerInventory.filter(item => !item.companyCode);
    }
    
    if (companyCode) {
        // If a company is selected, return inventory for that company
        return partnerInventory.filter(item => item.companyCode === companyCode);
    }

    // Default case (e.g. initial load) return all partner inventory
    return partnerInventory;
  };


  return {
    waybillInventory: context.waybillInventory,
    availablePartnerInventory,
    getAvailableInventoryForCompany,
    addWaybillToInventory: context.addWaybillToInventory,
    removeWaybillFromInventory: context.removeWaybillFromInventory,
    isInventoryLoaded: context.isLoaded,
  };
}
