'use client';

import { useState, useEffect, useCallback } from 'react';
import { Waybill } from '@/types/waybill';
import { useToast } from './use-toast';

const STORAGE_KEY = 'ss-cargo-waybills';

export function useWaybills() {
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const items = window.localStorage.getItem(STORAGE_KEY);
      if (items) {
        const parsedItems = JSON.parse(items);
        if (Array.isArray(parsedItems)) {
          setWaybills(parsedItems);
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
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(waybills));
      } catch (error) {
        console.error('Failed to save waybills to local storage', error);
        toast({
          title: 'Error',
          description: 'Could not save data to local storage.',
          variant: 'destructive',
        });
      }
    }
  }, [waybills, isLoaded, toast]);

  const addWaybill = useCallback((waybill: Waybill) => {
    // Check for uniqueness of waybillNumber
    if (waybills.some(w => w.waybillNumber === waybill.waybillNumber)) {
        toast({
            title: 'Error: Duplicate Waybill Number',
            description: `A waybill with the number #${waybill.waybillNumber} already exists.`,
            variant: 'destructive',
        });
        return false;
    }

    setWaybills((prev) => [waybill, ...prev]);
    return true;
  }, [waybills, toast]);

  const updateWaybill = useCallback((updatedWaybill: Waybill) => {
    setWaybills((prev) => prev.map((w) => (w.id === updatedWaybill.id ? updatedWaybill : w)));
    toast({
        title: 'Waybill Updated',
        description: `The waybill #${updatedWaybill.waybillNumber} has been successfully updated.`,
    });
  }, [toast]);

  const deleteWaybill = useCallback((id: string) => {
    setWaybills((prev) => {
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
    return waybills.find((w) => w.id === id);
  }, [waybills]);

  return { waybills, isLoaded, addWaybill, updateWaybill, deleteWaybill, getWaybillById };
}
