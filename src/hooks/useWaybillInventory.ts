
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
  
  const getAvailableInventoryForCompany = (companyCode?: string): InventoryItem[] => {
    if (!user || !context.isLoaded) return [];
    
    // Filter for the partner's available inventory first
    const partnerInventory = context.waybillInventory.filter(item => 
        item.partnerCode === user.partnerCode && !item.isUsed
    );

    if (companyCode) {
        // If a company is selected, return inventory for that company AND market inventory
        return partnerInventory.filter(item => 
            item.companyCode === companyCode || !item.companyCode
        );
    } else {
        // If no company is selected (market booking), return only market inventory
        return partnerInventory.filter(item => !item.companyCode);
    }
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
