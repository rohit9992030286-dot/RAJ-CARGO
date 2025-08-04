
'use client';

import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { InventoryItem } from '@/types/inventory';

const WAYBILL_STORAGE_KEY = 'rajcargo-waybills';
const MANIFEST_STORAGE_KEY = 'rajcargo-manifests';
const WAYBILL_INVENTORY_KEY = 'rajcargo-waybill-inventory';

interface DataContextType {
  waybills: Waybill[];
  manifests: Manifest[];
  waybillInventory: InventoryItem[];
  isLoaded: boolean;
  addWaybill: (waybill: Waybill, silent?: boolean) => boolean;
  updateWaybill: (updatedWaybill: Waybill) => void;
  deleteWaybill: (id: string) => void;
  getWaybillById: (id: string) => Waybill | undefined;
  addManifest: (manifest: Omit<Manifest, 'creatorPartnerCode' | 'manifestNo'>) => string;
  updateManifest: (updatedManifest: Manifest) => void;
  deleteManifest: (id: string) => void;
  getManifestById: (id: string) => Manifest | undefined;
  getManifestByNumber: (manifestNo: string) => Manifest | undefined;
  addWaybillToInventory: (item: InventoryItem) => boolean;
  removeWaybillFromInventory: (waybillNumber: string) => void;
  markWaybillAsUsed: (waybillNumber: string, isUsed: boolean) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [waybillsData, setWaybillsData] = useState<Waybill[]>([]);
  const [manifestsData, setManifestsData] = useState<Manifest[]>([]));
  const [waybillInventoryData, setWaybillInventoryData] = useState<InventoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
          // migration for creatorPartnerCode and manifestNo
          const migratedManifests = parsedManifests.map((m, index) => ({
             ...m, 
             creatorPartnerCode: m.creatorPartnerCode || m.partnerCode || '',
             manifestNo: m.manifestNo || `M-RC-${1001 + index}` // Simple migration
            }));
          setManifestsData(migratedManifests);
        }
      }

      const inventoryItems = window.localStorage.getItem(WAYBILL_INVENTORY_KEY);
      if (inventoryItems) {
        const parsedInventory = JSON.parse(inventoryItems);
        if(Array.isArray(parsedInventory)) {
            // Migration from string[] to InventoryItem[]
            const migratedInventory = parsedInventory.map(item => {
                if (typeof item === 'string') {
                    return { waybillNumber: item, partnerCode: 'UNASSIGNED', isUsed: false };
                }
                return item;
            });
            setWaybillInventoryData(migratedInventory);
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
    return [...waybillInventoryData].sort((a, b) => a.waybillNumber.localeCompare(b.waybillNumber, undefined, { numeric: true }));
  }, [waybillInventoryData]);
  
  const markWaybillAsUsed = useCallback((waybillNumber: string, isUsed: boolean) => {
    setWaybillInventoryData(prev => {
        return prev.map(item => item.waybillNumber === waybillNumber ? { ...item, isUsed } : item);
    });
  }, []);

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
    markWaybillAsUsed(waybill.waybillNumber, true);
    return true;
  }, [waybillsData, toast, markWaybillAsUsed]);

  const updateWaybill = useCallback((updatedWaybill: Waybill) => {
    let originalWaybillNumber: string | undefined;
    setWaybillsData(prev => {
      const original = prev.find(w => w.id === updatedWaybill.id);
      if (original) {
        originalWaybillNumber = original.waybillNumber;
      }
      return prev.map(w => (w.id === updatedWaybill.id ? updatedWaybill : w));
    });
    
    if (originalWaybillNumber && originalWaybillNumber !== updatedWaybill.waybillNumber) {
        markWaybillAsUsed(originalWaybillNumber, false);
        markWaybillAsUsed(updatedWaybill.waybillNumber, true);
    }
    
    toast({
        title: 'Waybill Updated',
        description: `Waybill #${updatedWaybill.waybillNumber} has been updated.`,
    });
  }, [toast, markWaybillAsUsed]);

  const deleteWaybill = useCallback((id: string) => {
    let waybillToDelete: Waybill | undefined;
    setWaybillsData(prev => {
        waybillToDelete = prev.find(w => w.id === id);
        return prev.filter(w => w.id !== id);
    });

    if (waybillToDelete) {
        markWaybillAsUsed(waybillToDelete.waybillNumber, false);
        toast({
            title: 'Waybill Deleted',
            description: `Waybill #${waybillToDelete.waybillNumber} deleted.`,
        });
    }
  }, [toast, markWaybillAsUsed]);

  const getWaybillById = useCallback((id: string) => {
    return waybillsData.find(w => w.id === id);
  }, [waybillsData]);

  const addManifest = useCallback((manifest: Omit<Manifest, 'creatorPartnerCode' | 'manifestNo'>) => {
    const bookingManifestsCount = manifestsData.filter(m => m.origin === 'booking').length;
    const hubManifestsCount = manifestsData.filter(m => m.origin === 'hub').length;
    
    let newManifestNumber: string;

    if (manifest.origin === 'hub') {
        newManifestNumber = `M-D-RC-${1000001 + hubManifestsCount}`;
    } else {
        newManifestNumber = `M-RC-${1001 + bookingManifestsCount}`;
    }

    const manifestToSave: Manifest = {
        ...manifest,
        manifestNo: newManifestNumber,
        creatorPartnerCode: user?.partnerCode || '',
    };
    setManifestsData(prev => [manifestToSave, ...prev]);
    toast({
        title: 'Manifest Created',
        description: `Manifest ${newManifestNumber} has been created.`,
    });
    return manifest.id;
  }, [toast, user, manifestsData]);

  const updateManifest = useCallback((updatedManifest: Manifest) => {
    setManifestsData(prev => prev.map(m => (m.id === updatedManifest.id ? updatedManifest : m)));
    toast({
        title: 'Manifest Updated',
        description: `Manifest ${updatedManifest.manifestNo} has been saved.`,
    });
  }, [toast]);

  const deleteManifest = useCallback((id: string) => {
    let manifestToDelete: Manifest | undefined;
    setManifestsData(prev => {
        manifestToDelete = prev.find(m => m.id === id);
        return prev.filter(m => m.id !== id);
    });
     if (manifestToDelete) {
        toast({
            title: 'Manifest Deleted',
            description: `The manifest has been deleted.`,
        });
    }
  }, [toast]);

  const getManifestById = useCallback((id: string) => {
    return manifestsData.find(m => m.id === id);
  }, [manifestsData]);

  const getManifestByNumber = useCallback((manifestNo: string) => {
    return manifestsData.find(m => m.manifestNo === manifestNo);
  }, [manifestsData]);

  const addWaybillToInventory = useCallback((item: InventoryItem) => {
    if (waybillInventoryData.some(i => i.waybillNumber === item.waybillNumber)) {
        return false;
    }
    setWaybillInventoryData(prev => [...prev, item]);
    return true;
  }, [waybillInventoryData]);

  const removeWaybillFromInventory = useCallback((waybillNumber: string) => {
    setWaybillInventoryData(prev => prev.filter(item => item.waybillNumber !== waybillNumber));
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
    getManifestByNumber,
    addWaybillToInventory,
    removeWaybillFromInventory,
    markWaybillAsUsed,
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
