
'use client';

import { useContext } from 'react';
import { DataContext } from '@/components/DataContext';

export function useManifests() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useManifests must be used within a DataProvider');
  }
  return {
    manifests: context.manifests,
    addManifest: context.addManifest,
    updateManifest: context.updateManifest,
    deleteManifest: context.deleteManifest,
    getManifestById: context.getManifestById,
    isLoaded: context.isLoaded,
  };
}
