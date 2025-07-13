
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Waybill } from '@/types/waybill';
import { useToast } from './use-toast';

const STORAGE_KEY = 'ss-cargo-waybills';

export function useWaybills() {
  const [waybillsData, setWaybillsData] = useState<Waybill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        const parsedItems = JSON.parse(items);
        if (Array.isArray(parsedItems)) {
          setWaybillsData(parsedItems);
        }
      }
    } catch (error) {
      console.error('Failed to load waybills from local storage', error);
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
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(waybillsData));
      } catch (error)
      {
        console.error('Failed to save waybills to local storage', error);
        toast({
          title: 'Error',
          description: 'Could not save data to local storage.',
          variant: 'destructive',
        });
      }
    }
  }, [waybillsData, isLoaded, toast]);
  
  const waybills = useMemo(() => {
    return [...waybillsData].sort((a,b) => new Date(b.shippingDate).getTime() - new Date(a.shippingDate).getTime())
  }, [waybillsData]);


  const addWaybill = useCallback((waybill: Waybill) => {
    if (waybillsData.some(w => w.waybillNumber === waybill.waybillNumber)) {
        toast({
            title: 'Error: Duplicate Waybill Number ⚠️',
            description: `A waybill with the number #${waybill.waybillNumber} already exists.`,
            variant: 'destructive',
        });
        return false;
    }

    setWaybillsData((prev) => [waybill, ...prev]);
    return true;
  }, [waybillsData, toast]);

  const updateWaybill = useCallback((updatedWaybill: Waybill) => {
    setWaybillsData((prev) => prev.map((w) => (w.id === updatedWaybill.id ? updatedWaybill : w)));
    toast({
        title: 'Waybill Updated',
        description: `The waybill #${updatedWaybill.waybillNumber} has been successfully updated.`,
    });
  }, [toast]);

  const deleteWaybill = useCallback((id: string) => {
    setWaybillsData((prev) => {
        const waybillToDelete = prev.find(w => w.id === id);
        if (waybillToDelete) {
             toast({
                title: 'Waybill Deleted',
                description: `The waybill #${waybillToDelete.waybillNumber} has been successfully deleted.`,
            });
        }
        return prev.filter((w) => w.id !== id);
    });
  }, [toast]);

  const getWaybillById = useCallback((id: string) => {
    return waybillsData.find((w) => w.id === id);
  }, [waybillsData]);

  return { waybills, isLoaded, addWaybill, updateWaybill, deleteWaybill, getWaybillById };
}
