
'use client';

import { useContext } from 'react';
import { DataContext } from '@/components/DataContext';

export const useCompanies = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a DataProvider');
  }
  return context;
};
