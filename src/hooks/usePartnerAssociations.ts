
'use client';

import { useContext } from 'react';
import { DataContext } from '@/components/DataContext';

export const usePartnerAssociations = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('usePartnerAssociations must be used within a DataProvider');
  }
  return {
      associations: context.associations,
      setAssociation: context.setAssociation,
      isLoaded: context.isLoaded,
  };
};
