
'use client';

import { useContext } from 'react';
import { DataContext } from '@/components/DataContext';

export const useVehicles = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a DataProvider');
  }
  
  // Expose only vehicle-related properties and methods
  return {
    vehicles: context.vehicles,
    addVehicle: context.addVehicle,
    updateVehicle: context.updateVehicle,
    deleteVehicle: context.deleteVehicle,
    isLoaded: context.isLoaded
  };
};
