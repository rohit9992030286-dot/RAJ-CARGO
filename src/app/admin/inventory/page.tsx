
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, List, Hash, Briefcase, CheckCircle, Circle, AlertCircle, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCompanies } from '@/hooks/useCompanies';

export default function InventoryManagementPage() {
  const { users, isLoading: usersLoading } = useAuth();
  const { waybillInventory, addWaybillToInventory, removeWaybillFromInventory, isInventoryLoaded } = useWaybillInventory();
  const { companies, isLoaded: companiesLoaded } = useCompanies();
  const { toast } = useToast();

  const [partnerCode, setPartnerCode] = useState<string | null>(null);
  const [companyCode, setCompanyCode] = useState<string>('market'); // Default to market
  const [waybillRange, setWaybillRange] = useState('');
  const [error, setError] = useState<string | null>(null);

  const bookingPartners = useMemo(() => {
    return [...new Set(users.filter(u => u.roles.includes('booking') && u.partnerCode).map(u => u.partnerCode!))];
  }, [users]);

  const inventoryByPartner = useMemo(() => {
    return waybillInventory.reduce((acc, item) => {
      const key = `${item.partnerCode}-${item.companyCode || 'market'}`;
      if (!acc[key]) {
        acc[key] = {
            partnerCode: item.partnerCode,
            companyCode: item.companyCode,
            companyName: item.companyCode ? companies.find(c => c.companyCode === item.companyCode)?.companyName : 'Market (All Users)',
            items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { partnerCode: string, companyCode?: string, companyName?: string, items: InventoryItem[] }>);
  }, [waybillInventory, companies]);

  const handleAddInventory = () => {
    setError(null);
    if (!partnerCode) {
      setError("Please select a partner code.");
      return;
    }
    if (!waybillRange.trim()) {
      setError("Please enter a waybill number or range.");
      return;
    }

    const input = waybillRange.trim();
    const rangeMatch = input.match(/^([a-zA-Z-]+)?(\d+)-(\d+)$/);
    
    let addedCount = 0;
    let skippedCount = 0;

    const addSingle = (num: string) => {
      const newItem: InventoryItem = { 
          waybillNumber: num, 
          partnerCode, 
          isUsed: false,
          companyCode: companyCode === 'market' ? undefined : companyCode
      };
      if (addWaybillToInventory(newItem)) {
        addedCount++;
      } else {
        skippedCount++;
      }
    };

    if (rangeMatch) {
      const prefix = rangeMatch[1] || '';
      const start = parseInt(rangeMatch[2], 10);
      const end = parseInt(rangeMatch[3], 10);

      if (isNaN(start) || isNaN(end) || start > end) {
        setError("Invalid Range: Start number must be less than or equal to the end number.");
        return;
      }

      const rangeSize = end - start + 1;
      if (rangeSize > 1000) {
        setError("Range Too Large: Please add a maximum of 1000 numbers at a time.");
        return;
      }

      for (let i = start; i <= end; i++) {
        addSingle(`${prefix}${i}`);
      }
    } else if (/^[a-zA-Z-]*\d+$/.test(input)) {
      addSingle(input);
    } else {
      setError("Invalid Format: Please use 'SW-101', '101', or 'SW-101-200'.");
      return;
    }
    
    if (addedCount > 0) {
      toast({ title: "Inventory Updated", description: `${addedCount} number(s) assigned to ${partnerCode}. ${skippedCount} skipped (duplicates).` });
    } else if (skippedCount > 0) {
      toast({ title: "No Numbers Added", description: `All ${skippedCount} number(s) were duplicates.`, variant: "default" });
    }

    setWaybillRange('');
  };

  const handleDeleteInventory = (waybillNumber: string) => {
    removeWaybillFromInventory(waybillNumber);
    toast({ title: 'Inventory Removed', description: `Waybill number ${waybillNumber} has been deleted.` });
  };

  if (usersLoading || !isInventoryLoaded || !companiesLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/50 dark:to-yellow-900/80 border border-amber-200 dark:border-amber-800 shadow-md">
        <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-100">Waybill Inventory Management</h1>
        <p className="text-amber-600 dark:text-amber-300 mt-1">Assign waybill numbers to specific booking partners and companies.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign New Inventory</CardTitle>
          <CardDescription>Enter a waybill number or range and assign it to a partner and optionally a company.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={partnerCode || ''} onValueChange={setPartnerCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select Partner Code" />
            </SelectTrigger>
            <SelectContent>
              {bookingPartners.map(code => <SelectItem key={code} value={code}>{code}</SelectItem>)}
            </SelectContent>
          </Select>
           <Select value={companyCode} onValueChange={setCompanyCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select Company (Optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market (All Users)</SelectItem>
              {companies.map(c => <SelectItem key={c.id} value={c.companyCode}>{c.companyName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input 
            placeholder="e.g., SW-101 or PNA-1001-1200"
            value={waybillRange}
            onChange={(e) => setWaybillRange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInventory()}
          />
          <Button onClick={handleAddInventory} disabled={!partnerCode || !waybillRange}>
            <PlusCircle className="mr-2 h-4 w-4" /> Assign to Partner
          </Button>
        </CardContent>
        {error && 
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </CardContent>
        }
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory by Partner</CardTitle>
          <CardDescription>List of all assigned waybill numbers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.keys(inventoryByPartner).length > 0 ? (
            Object.values(inventoryByPartner).map((group) => (
              <div key={`${group.partnerCode}-${group.companyCode}`} className="border p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary"/>
                        Partner: <Badge>{group.partnerCode}</Badge>
                    </h3>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building className="h-5 w-5 text-muted-foreground"/>
                        Company: <Badge variant="secondary">{group.companyName}</Badge>
                    </h3>
                </div>
                <div className="border rounded-md max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted/50">
                      <TableRow>
                        <TableHead>Waybill Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map(item => (
                        <TableRow key={item.waybillNumber}>
                          <TableCell className="font-mono"><Hash className="inline h-4 w-4 mr-2" />{item.waybillNumber}</TableCell>
                          <TableCell>
                            {item.isUsed ? (
                                <Badge variant="secondary"><CheckCircle className="inline h-3 w-3 mr-1" />Used</Badge>
                            ) : (
                                <Badge variant="outline"><Circle className="inline h-3 w-3 mr-1" />Available</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteInventory(item.waybillNumber)} disabled={item.isUsed}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <List className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Inventory Assigned</h3>
                <p className="mt-1 text-sm text-muted-foreground">Assign waybill numbers using the form above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
