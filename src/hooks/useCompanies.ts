
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Company, CompanyFormData } from '@/types/company';
import { useToast } from '@/hooks/use-toast';

const COMPANY_STORAGE_KEY = 'rajcargo-companies';

export interface CompanyContextType {
  companies: Company[];
  isLoaded: boolean;
  addCompany: (companyData: CompanyFormData) => boolean;
  updateCompany: (updatedCompany: Company) => boolean;
  deleteCompany: (id: string) => void;
  getCompanyById: (id: string) => Company | undefined;
  getCompanyByCode: (code: string) => Company | undefined;
}

export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function useProvideCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCompanies = localStorage.getItem(COMPANY_STORAGE_KEY);
      if (storedCompanies) {
        setCompanies(JSON.parse(storedCompanies));
      }
    } catch (error) {
      console.error("Failed to load companies from local storage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const syncCompaniesToStorage = (updatedCompanies: Company[]) => {
    const sorted = updatedCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName));
    setCompanies(sorted);
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(sorted));
  };

  const addCompany = useCallback((companyData: CompanyFormData): boolean => {
    if (companies.some(c => c.companyCode.toLowerCase() === companyData.companyCode.toLowerCase())) {
        toast({ title: 'Duplicate Company Code', description: 'A company with this code already exists.', variant: 'destructive' });
        return false;
    }
    const newCompany: Company = { ...companyData, id: crypto.randomUUID() };
    syncCompaniesToStorage([...companies, newCompany]);
    toast({ title: 'Company Added', description: `${companyData.companyName} has been added.` });
    return true;
  }, [companies, toast]);

  const updateCompany = useCallback((updatedCompany: Company): boolean => {
    if (companies.some(c => c.companyCode.toLowerCase() === updatedCompany.companyCode.toLowerCase() && c.id !== updatedCompany.id)) {
        toast({ title: 'Duplicate Company Code', description: 'Another company with this code already exists.', variant: 'destructive' });
        return false;
    }
    syncCompaniesToStorage(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    toast({ title: 'Company Updated', description: `${updatedCompany.companyName} has been updated.` });
    return true;
  }, [companies, toast]);

  const deleteCompany = useCallback((id: string) => {
    syncCompaniesToStorage(companies.filter(c => c.id !== id));
    toast({ title: 'Company Deleted' });
  }, [companies, toast]);

  const getCompanyById = useCallback((id: string) => {
    return companies.find(c => c.id === id);
  }, [companies]);

  const getCompanyByCode = useCallback((code: string) => {
    return companies.find(c => c.companyCode === code);
  }, [companies]);

  return {
    companies,
    isLoaded,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    getCompanyByCode,
  };
}

export const useCompanies = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a DataProvider');
  }
  return context;
};
