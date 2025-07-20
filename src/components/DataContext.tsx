
'use client';

import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Waybill, waybillSchema } from '@/types/waybill';
import { Manifest, manifestSchema } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const WAYBILL_STORAGE_KEY = 'rajcargo-waybills';
const MANIFEST_STORAGE_KEY = 'rajcargo-manifests';
const WAYBILL_INVENTORY_KEY = 'rajcargo-waybill-inventory';

interface DataContextType {
  waybills: Waybill[];
  manifests: Manifest[];
  waybillInventory: string[];
  isLoaded: boolean;
  addWaybill: (waybill: Waybill, silent?: boolean) => boolean;
  updateWaybill: (updatedWaybill: Waybill) => void;
  deleteWaybill: (id: string) => void;
  getWaybillById: (id: string) => Waybill | undefined;
  addManifest: (manifest: Manifest) => string;
  updateManifest: (updatedManifest: Manifest) => void;
  deleteManifest: (id: string) => void;
  getManifestById: (id: string) => Manifest | undefined;
  addWaybillToInventory: (waybillNumber: string) => boolean;
  removeWaybillFromInventory: (waybillNumber: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [waybillsData, setWaybillsData] = useState<Waybill[]>([]);
  const [manifestsData, setManifestsData] = useState<Manifest[]>([]);
  const [waybillInventoryData, setWaybillInventoryData] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const waybillItems = window.localStorage.getItem(WAYBILL_STORAGE_KEY);
      if (waybillItems) {
        const parsedWaybills = JSON.parse(waybillItems);
        if (Array.isArray(parsedWaybills)) {
          setWaybillsData(parsedWaybills);
        }
      }

      const manifestItems = window.localStorage.getItem(MANIFEST_STORAGE_KEY);
      if (manifestItems) {
        const parsedManifests = JSON.parse(manifestItems);
        if (Array.isArray(parsedManifests)) {
          setManifestsData(parsedManifests);
        }
      }

      const inventoryItems = window.localStorage.getItem(WAYBILL_INVENTORY_KEY);
      if (inventoryItems) {
        const parsedInventory = JSON.parse(inventoryItems);
        if(Array.isArray(parsedInventory)) {
            setWaybillInventoryData(parsedInventory);
        }
      }

    } catch (error) {
      console.error('Failed to load data from local storage', error);
      toast({
        title: 'Error',
        description: 'Could not load data from local storage.',
        variant: 'destructive',
      });
    } finally {
      setIsLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(WAYBILL_STORAGE_KEY, JSON.stringify(waybillsData));
      } catch (error) {
        console.error('Failed to save waybills to local storage', error);
        toast({
          title: 'Error',
          description: 'Could not save waybill data.',
          variant: 'destructive',
        });
      }
    }
  }, [waybillsData, isLoaded, toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(MANIFEST_STORAGE_KEY, JSON.stringify(manifestsData));
      } catch (error) {
        console.error('Failed to save manifests to local storage', error);
        toast({
          title: 'Error',
          description: 'Could not save manifest data.',
          variant: 'destructive',
        });
      }
    }
  }, [manifestsData, isLoaded, toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(WAYBILL_INVENTORY_KEY, JSON.stringify(waybillInventoryData));
      } catch (error) {
        console.error('Failed to save waybill inventory to local storage', error);
        toast({
          title: 'Error',
          description: 'Could not save waybill inventory.',
          variant: 'destructive',
        });
      }
    }
  }, [waybillInventoryData, isLoaded, toast]);

  const sortedWaybills = useMemo(() => {
    return [...waybillsData].sort((a,b) => new Date(b.shippingDate).getTime() - new Date(a.shippingDate).getTime())
  }, [waybillsData]);

  const sortedManifests = useMemo(() => {
    return [...manifestsData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [manifestsData]);
  
  const sortedInventory = useMemo(() => {
    return [...waybillInventoryData].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [waybillInventoryData]);

  const addWaybill = useCallback((waybill: Waybill, silent = false) => {
    if (waybillsData.some(w => w.waybillNumber === waybill.waybillNumber)) {
        if (!silent) {
            toast({
                title: 'Error: Duplicate Waybill Number ⚠️',
                description: `A waybill with the number #${waybill.waybillNumber} already exists.`,
                variant: 'destructive',
            });
        }
        return false;
    }
    setWaybillsData(prev => [waybill, ...prev]);
    // Remove from inventory when used
    setWaybillInventoryData(prev => prev.filter(item => item !== waybill.waybillNumber));
    return true;
  }, [waybillsData, toast]);

  const updateWaybill = useCallback((updatedWaybill: Waybill) => {
    setWaybillsData(prev => prev.map(w => (w.id === updatedWaybill.id ? updatedWaybill : w)));
    toast({
        title: 'Waybill Updated',
        description: `Waybill #${updatedWaybill.waybillNumber} has been updated.`,
    });
  }, [toast]);

  const deleteWaybill = useCallback((id: string) => {
    setWaybillsData(prev => {
        const waybillToDelete = prev.find(w => w.id === id);
        if (waybillToDelete) {
             toast({
                title: 'Waybill Deleted',
                description: `Waybill #${waybillToDelete.waybillNumber} deleted.`,
            });
            // Add back to inventory if deleted
            setWaybillInventoryData(prevInv => {
                if (!prevInv.includes(waybillToDelete.waybillNumber)) {
                    return [...prevInv, waybillToDelete.waybillNumber].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                }
                return prevInv;
            });
        }
        return prev.filter(w => w.id !== id);
    });
  }, [toast]);

  const getWaybillById = useCallback((id: string) => {
    return waybillsData.find(w => w.id === id);
  }, [waybillsData]);

  const addManifest = useCallback((manifest: Manifest) => {
    setManifestsData(prev => [manifest, ...prev]);
    toast({
        title: 'Manifest Created',
        description: `Manifest M-${manifest.id.substring(0,8)} has been created.`,
    });
    return manifest.id;
  }, [toast]);

  const updateManifest = useCallback((updatedManifest: Manifest) => {
    setManifestsData(prev => prev.map(m => (m.id === updatedManifest.id ? updatedManifest : m)));
    toast({
        title: 'Manifest Updated',
        description: `Manifest M-${updatedManifest.id.substring(0,8)} has been saved.`,
    });
  }, [toast]);

  const deleteManifest = useCallback((id: string) => {
    setManifestsData(prev => {
        const manifestToDelete = prev.find(m => m.id === id);
        if (manifestToDelete) {
             toast({
                title: 'Manifest Deleted',
                description: `The manifest has been deleted.`,
            });
        }
        return prev.filter(m => m.id !== id);
    });
  }, [toast]);

  const getManifestById = useCallback((id: string) => {
    return manifestsData.find(m => m.id === id);
  }, [manifestsData]);

  const addWaybillToInventory = useCallback((waybillNumber: string) => {
    if (waybillInventoryData.includes(waybillNumber) || waybillsData.some(w => w.waybillNumber === waybillNumber)) {
        toast({
            title: "Waybill number already exists",
            description: `The waybill number ${waybillNumber} is already in the inventory or in use.`,
            variant: "destructive"
        });
        return false;
    }
    setWaybillInventoryData(prev => [...prev, waybillNumber]);
    return true;
  }, [waybillInventoryData, waybillsData, toast]);

  const removeWaybillFromInventory = useCallback((waybillNumber: string) => {
    setWaybillInventoryData(prev => prev.filter(item => item !== waybillNumber));
  }, []);

  const value = {
    waybills: sortedWaybills,
    manifests: sortedManifests,
    waybillInventory: sortedInventory,
    isLoaded,
    addWaybill,
    updateWaybill,
    deleteWaybill,
    getWaybillById,
    addManifest,
    updateManifest,
    deleteManifest,
    getManifestById,
    addWaybillToInventory,
    removeWaybillFromInventory,
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
