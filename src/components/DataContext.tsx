
'use client';

import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { InventoryItem } from '@/types/inventory';
import { Company, CompanyFormData } from '@/types/company';

const WAYBILL_STORAGE_KEY = 'rajcargo-waybills';
const MANIFEST_STORAGE_KEY = 'rajcargo-manifests';
const WAYBILL_INVENTORY_KEY = 'rajcargo-waybill-inventory';
const COMPANY_STORAGE_KEY = 'rajcargo-companies';
const PARTNER_ASSOCIATIONS_KEY = 'rajcargo-hub-partner-associations';

interface Associations {
    bookingToHub: Record<string, string>;
    hubToHub: Record<string, string>;
    hubToDelivery: Record<string, string>;
}

interface DataContextType {
  waybills: Waybill[];
  manifests: Manifest[];
  waybillInventory: InventoryItem[];
  companies: Company[];
  associations: Associations;
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
  addCompany: (companyData: CompanyFormData) => boolean;
  updateCompany: (updatedCompany: Company) => boolean;
  deleteCompany: (id: string) => void;
  getCompanyById: (id: string) => Company | undefined;
  getCompanyByCode: (code: string) => Company | undefined;
  setAssociation: (type: keyof Associations, fromPartner: string, toPartner: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [waybillsData, setWaybillsData] = useState<Waybill[]>([]);
  const [manifestsData, setManifestsData] = useState<Manifest[]>([]);
  const [waybillInventoryData, setWaybillInventoryData] = useState<InventoryItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [associations, setAssociations] = useState<Associations>({ bookingToHub: {}, hubToHub: {}, hubToDelivery: {} });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
      const waybillItems = window.localStorage.getItem(WAYBILL_STORAGE_KEY);
      if (waybillItems) setWaybillsData(JSON.parse(waybillItems));

      const manifestItems = window.localStorage.getItem(MANIFEST_STORAGE_KEY);
       if (manifestItems) {
        const parsedManifests = JSON.parse(manifestItems);
        if (Array.isArray(parsedManifests)) {
          const migratedManifests = parsedManifests.map((m, index) => ({
             ...m, 
             creatorPartnerCode: m.creatorPartnerCode || m.partnerCode || '',
             manifestNo: m.manifestNo || `M-RC-${1001 + index}`
            }));
          setManifestsData(migratedManifests);
        }
      }

      const inventoryItems = window.localStorage.getItem(WAYBILL_INVENTORY_KEY);
      if (inventoryItems) {
        const parsedInventory = JSON.parse(inventoryItems);
         if(Array.isArray(parsedInventory)) {
            const migratedInventory = parsedInventory.map(item => 
                (typeof item === 'string') ? { waybillNumber: item, partnerCode: 'UNASSIGNED', isUsed: false } : item
            );
            setWaybillInventoryData(migratedInventory);
        }
      }

      const companyItems = window.localStorage.getItem(COMPANY_STORAGE_KEY);
      if (companyItems) setCompanies(JSON.parse(companyItems));

      const associationItems = window.localStorage.getItem(PARTNER_ASSOCIATIONS_KEY);
      if(associationItems) {
          const parsedAssociations = JSON.parse(associationItems);
          // For backward compatibility: if old format (Record<string,string>), convert it.
          if (!parsedAssociations.bookingToHub && !parsedAssociations.hubToHub && !parsedAssociations.hubToDelivery) {
              setAssociations({ bookingToHub: parsedAssociations, hubToHub: {}, hubToDelivery: {} });
          } else {
              setAssociations({
                  bookingToHub: parsedAssociations.bookingToHub || {},
                  hubToHub: parsedAssociations.hubToHub || {},
                  hubToDelivery: parsedAssociations.hubToDelivery || {},
              });
          }
      }

    } catch (error) {
      console.error('Failed to load data from local storage', error);
      toast({ title: 'Error', description: 'Could not load data from local storage.', variant: 'destructive' });
    } finally {
      setIsDataLoaded(true);
    }
  }, [toast]);

  useEffect(() => { if (isDataLoaded) window.localStorage.setItem(WAYBILL_STORAGE_KEY, JSON.stringify(waybillsData)); }, [waybillsData, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) window.localStorage.setItem(MANIFEST_STORAGE_KEY, JSON.stringify(manifestsData)); }, [manifestsData, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) window.localStorage.setItem(WAYBILL_INVENTORY_KEY, JSON.stringify(waybillInventoryData)); }, [waybillInventoryData, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) window.localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(companies)); }, [companies, isDataLoaded]);
  useEffect(() => { if (isDataLoaded) window.localStorage.setItem(PARTNER_ASSOCIATIONS_KEY, JSON.stringify(associations)); }, [associations, isDataLoaded]);


  const sortedWaybills = useMemo(() => [...waybillsData].sort((a,b) => new Date(b.shippingDate).getTime() - new Date(a.shippingDate).getTime()), [waybillsData]);
  const sortedManifests = useMemo(() => [...manifestsData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [manifestsData]);
  const sortedInventory = useMemo(() => [...waybillInventoryData].sort((a, b) => a.waybillNumber.localeCompare(b.waybillNumber, undefined, { numeric: true })), [waybillInventoryData]);
  const sortedCompanies = useMemo(() => [...companies].sort((a, b) => a.companyName.localeCompare(b.companyName)), [companies]);
  
  const markWaybillAsUsed = useCallback((waybillNumber: string, isUsed: boolean) => {
    setWaybillInventoryData(prev => prev.map(item => item.waybillNumber === waybillNumber ? { ...item, isUsed } : item));
  }, []);

  const addWaybill = useCallback((waybill: Waybill, silent = false) => {
    if (waybillsData.some(w => w.waybillNumber === waybill.waybillNumber)) {
        if (!silent) toast({ title: 'Error: Duplicate Waybill Number ⚠️', description: `A waybill with the number #${waybill.waybillNumber} already exists.`, variant: 'destructive' });
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
      if (original) originalWaybillNumber = original.waybillNumber;
      return prev.map(w => (w.id === updatedWaybill.id ? updatedWaybill : w));
    });
    
    if (originalWaybillNumber && originalWaybillNumber !== updatedWaybill.waybillNumber) {
        markWaybillAsUsed(originalWaybillNumber, false);
        markWaybillAsUsed(updatedWaybill.waybillNumber, true);
    }
    toast({ title: 'Waybill Updated', description: `Waybill #${updatedWaybill.waybillNumber} has been updated.` });
  }, [toast, markWaybillAsUsed]);

  const deleteWaybill = useCallback((id: string) => {
    let waybillToDelete: Waybill | undefined;
    setWaybillsData(prev => {
        waybillToDelete = prev.find(w => w.id === id);
        return prev.filter(w => w.id !== id);
    });

    if (waybillToDelete) {
        markWaybillAsUsed(waybillToDelete.waybillNumber, false);
        toast({ title: 'Waybill Deleted', description: `Waybill #${waybillToDelete.waybillNumber} deleted.` });
    }
  }, [toast, markWaybillAsUsed]);

  const getWaybillById = useCallback((id: string) => waybillsData.find(w => w.id === id), [waybillsData]);

  const addManifest = useCallback((manifest: Omit<Manifest, 'creatorPartnerCode' | 'manifestNo'>) => {
    const bookingManifestsCount = manifestsData.filter(m => m.origin === 'booking').length;
    const hubManifestsCount = manifestsData.filter(m => m.origin === 'hub').length;
    const newManifestNumber = manifest.origin === 'hub' ? `M-D-RC-${1000001 + hubManifestsCount}` : `M-RC-${1001 + bookingManifestsCount}`;

    const manifestToSave: Manifest = { ...manifest, manifestNo: newManifestNumber, creatorPartnerCode: user?.partnerCode || '' };
    setManifestsData(prev => [manifestToSave, ...prev]);
    toast({ title: 'Manifest Created', description: `Manifest ${newManifestNumber} has been created.` });
    return manifest.id;
  }, [toast, user, manifestsData]);

  const updateManifest = useCallback((updatedManifest: Manifest) => {
    setManifestsData(prev => prev.map(m => (m.id === updatedManifest.id ? updatedManifest : m)));
    toast({ title: 'Manifest Updated', description: `Manifest ${updatedManifest.manifestNo} has been saved.` });
  }, [toast]);

  const deleteManifest = useCallback((id: string) => {
    let manifestToDelete: Manifest | undefined;
    setManifestsData(prev => {
        manifestToDelete = prev.find(m => m.id === id);
        return prev.filter(m => m.id !== id);
    });
     if (manifestToDelete) toast({ title: 'Manifest Deleted', description: 'The manifest has been deleted.' });
  }, [toast]);

  const getManifestById = useCallback((id: string) => manifestsData.find(m => m.id === id), [manifestsData]);
  const getManifestByNumber = useCallback((manifestNo: string) => manifestsData.find(m => m.manifestNo === manifestNo), [manifestsData]);

  const addWaybillToInventory = useCallback((item: InventoryItem) => {
    if (waybillInventoryData.some(i => i.waybillNumber === item.waybillNumber)) return false;
    setWaybillInventoryData(prev => [...prev, item]);
    return true;
  }, [waybillInventoryData]);

  const removeWaybillFromInventory = useCallback((waybillNumber: string) => {
    setWaybillInventoryData(prev => prev.filter(item => item.waybillNumber !== waybillNumber));
  }, []);
  
  const addCompany = useCallback((companyData: CompanyFormData): boolean => {
    if (companies.some(c => c.companyCode.toLowerCase() === companyData.companyCode.toLowerCase())) {
        toast({ title: 'Duplicate Company Code', description: 'A company with this code already exists.', variant: 'destructive' });
        return false;
    }
    const newCompany: Company = { ...companyData, id: crypto.randomUUID() };
    setCompanies(prev => [...prev, newCompany]);
    toast({ title: 'Company Added', description: `${companyData.companyName} has been added.` });
    return true;
  }, [companies, toast]);

  const updateCompany = useCallback((updatedCompany: Company): boolean => {
    if (companies.some(c => c.companyCode.toLowerCase() === updatedCompany.companyCode.toLowerCase() && c.id !== updatedCompany.id)) {
        toast({ title: 'Duplicate Company Code', description: 'Another company with this code already exists.', variant: 'destructive' });
        return false;
    }
    setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    toast({ title: 'Company Updated', description: `${updatedCompany.companyName} has been updated.` });
    return true;
  }, [companies, toast]);

  const deleteCompany = useCallback((id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Company Deleted' });
  }, [toast]);

  const getCompanyById = useCallback((id: string) => companies.find(c => c.id === id), [companies]);
  const getCompanyByCode = useCallback((code: string) => companies.find(c => c.companyCode === code), [companies]);

  const setAssociation = useCallback((type: keyof Associations, fromPartner: string, toPartner: string) => {
    setAssociations(prev => ({
        ...prev,
        [type]: {
            ...prev[type],
            [fromPartner]: toPartner
        }
    }));
  }, []);

  const value: DataContextType = {
    waybills: sortedWaybills,
    manifests: sortedManifests,
    waybillInventory: sortedInventory,
    companies: sortedCompanies,
    associations,
    isLoaded: isDataLoaded,
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
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    getCompanyByCode,
    setAssociation,
  };

  if (!isDataLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
