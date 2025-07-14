
'use client';

import { useContext } from 'react';
import { DataContext } from '@/components/DataContext';

export function useWaybillInventory() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useWaybillInventory must be used within a DataProvider');
  }
  return {
    waybillInventory: context.waybillInventory,
    addWaybillToInventory: context.addWaybillToInventory,
    removeWaybillFromInventory: context.removeWaybillFromInventory,
    isInventoryLoaded: context.isLoaded,
  };
}
