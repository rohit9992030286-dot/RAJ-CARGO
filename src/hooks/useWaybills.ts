
'use client';

import { useContext } from 'react';
import { DataContext } from '@/components/DataContext';

export function useWaybills() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useWaybills must be used within a DataProvider');
  }
  return {
    waybills: context.waybills,
    addWaybill: context.addWaybill,
    updateWaybill: context.updateWaybill,
    deleteWaybill: context.deleteWaybill,
    getWaybillById: context.getWaybillById,
    isLoaded: context.isLoaded,
  };
}
