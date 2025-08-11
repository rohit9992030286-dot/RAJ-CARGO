
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Link2, BookCopy, Cpu, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function PartnerAssociationPage() {
  const { users, isLoading: usersLoading } = useAuth();
  const { associations, setAssociation, isLoaded: associationsLoaded } = usePartnerAssociations();
  const { toast } = useToast();
  
  const [localAssociations, setLocalAssociations] = useState<Record<string, string>>({});

  const { bookingPartners, hubPartners } = useMemo(() => {
    const bookingPartners = users.filter(u => u.roles.includes('booking') && u.partnerCode);
    const hubPartners = users.filter(u => u.roles.includes('hub') && u.partnerCode);
    return { bookingPartners, hubPartners };
  }, [users]);
  
  const hubPartnerCodes = useMemo(() => {
      return [...new Set(hubPartners.map(h => h.partnerCode!))];
  }, [hubPartners]);

  const handleSelectChange = (bookingPartnerCode: string, hubCode: string) => {
    setLocalAssociations(prev => ({
        ...prev,
        [bookingPartnerCode]: hubCode
    }));
  };

  const handleSaveChanges = () => {
    Object.entries(localAssociations).forEach(([bookingPartnerCode, hubCode]) => {
      setAssociation(bookingPartnerCode, hubCode);
    });
    toast({ title: "Associations Saved", description: "Your changes have been saved successfully." });
    setLocalAssociations({});
  };

  if (usersLoading || !associationsLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Partner Hub Associations</h1>
        <p className="text-muted-foreground">Define the default destination hub for each booking partner.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Partner to Hub Routing</CardTitle>
          <CardDescription>When a booking partner creates a manifest, it will be routed to the selected hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Partner</TableHead>
                <TableHead>Route to Hub</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingPartners.map(partner => {
                const currentHub = localAssociations[partner.partnerCode!] ?? associations[partner.partnerCode!];
                return (
                    <TableRow key={partner.partnerCode}>
                        <TableCell>
                            <div className="font-medium flex items-center gap-2">
                                <BookCopy className="h-5 w-5 text-primary" />
                                {partner.username} <Badge variant="outline">{partner.partnerCode}</Badge>
                            </div>
                        </TableCell>
                        <TableCell>
                           <Select 
                             value={currentHub} 
                             onValueChange={(hubCode) => handleSelectChange(partner.partnerCode!, hubCode)}
                           >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select destination hub" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hubPartnerCodes.map(code => (
                                        <SelectItem key={code} value={code}>
                                            <div className="flex items-center gap-2">
                                                <Cpu className="h-4 w-4" />
                                                {code}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <Button 
                onClick={handleSaveChanges} 
                disabled={Object.keys(localAssociations).length === 0}
                className="ml-auto"
            >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
