
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Manifest } from '@/types/manifest';
import { useToast } from './use-toast';

const STORAGE_KEY = 'ss-cargo-manifests';

export function useManifests() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        const parsedItems = JSON.parse(items);
        if (Array.isArray(parsedItems)) {
          setManifests(parsedItems);
        }
      }
    } catch (error) {
      console.error('Failed to load manifests from local storage', error);
      toast({
        title: 'Error',
        description: 'Could not load manifest data from local storage.',
        variant: 'destructive',
      });
    } finally {
      setIsLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(manifests));
      } catch (error) {
        console.error('Failed to save manifests to local storage', error);
        toast({
          title: 'Error',
          description: 'Could not save manifest data to local storage.',
          variant: 'destructive',
        });
      }
    }
  }, [manifests, isLoaded, toast]);

  const addManifest = useCallback((manifest: Manifest) => {
    setManifests((prev) => [manifest, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    toast({
        title: 'Manifest Created',
        description: `Manifest M-${manifest.id.substring(0,8)} has been created.`,
    });
    return manifest.id;
  }, [toast]);

  const updateManifest = useCallback((updatedManifest: Manifest) => {
    setManifests((prev) => prev.map((m) => (m.id === updatedManifest.id ? updatedManifest : m)));
    toast({
        title: 'Manifest Updated',
        description: `Manifest M-${updatedManifest.id.substring(0,8)} has been saved.`,
    });
  }, [toast]);

  const deleteManifest = useCallback((id: string) => {
    setManifests((prev) => {
        const manifestToDelete = prev.find(m => m.id === id);
        if (manifestToDelete) {
             toast({
                title: 'Manifest Deleted',
                description: `The manifest has been successfully deleted.`,
            });
        }
        return prev.filter((m) => m.id !== id);
    });
  }, [toast]);

  const getManifestById = useCallback((id: string) => {
    return manifests.find((m) => m.id === id);
  }, [manifests]);

  return { manifests, isLoaded, addManifest, updateManifest, deleteManifest, getManifestById };
}
