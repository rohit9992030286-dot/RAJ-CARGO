'use client';

import { useState, useEffect, useCallback } from 'react';
import { Waybill } from '@/types/waybill';
import { useToast } from './use-toast';

const STORAGE_KEY = 'swiftway-waybills';

export function useWaybills() {
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client after hydration
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
    }
    setIsLoaded(true);
  }, [toast]);

  useEffect(() => {
    // This effect syncs state changes back to local storage
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
    setWaybills((prev) => [waybill, ...prev]);
  }, []);

  const updateWaybill = useCallback((updatedWaybill: Waybill) => {
    setWaybills((prev) => prev.map((w) => (w.id === updatedWaybill.id ? updatedWaybill : w)));
  }, []);

  const deleteWaybill = useCallback((id: string) => {
    setWaybills((prev) => prev.filter((w) => w.id !== id));
    toast({
        title: 'Waybill Deleted',
        description: 'The waybill has been successfully deleted.',
    });
  }, [toast]);

  const getWaybillById = useCallback((id: string) => {
    return waybills.find((w) => w.id === id);
  }, [waybills]);

  return { waybills, isLoaded, addWaybill, updateWaybill, deleteWaybill, getWaybillById };
}
