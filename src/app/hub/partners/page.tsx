
'use client';

import { useState, useEffect } from 'react';
import { useAuth, User } from '@/hooks/useAuth.tsx';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Link2, Briefcase, Trash2, Save, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


const STORAGE_KEY = 'rajcargo-hub-partner-associations';

interface Associations {
    [hubPartnerCode: string]: string[];
}

export default function PartnerManagementPage() {
    const { user, users, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [associations, setAssociations] = useState<Associations>({});
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [selectedHub, setSelectedHub] = useState<string | null>(null);
    const [selectedBookingPartner, setSelectedBookingPartner] = useState<string | null>(null);

    useEffect(() => {
        // Protect this page for admins only
        if (!isLoading && user?.role !== 'admin') {
            toast({ title: 'Access Denied', description: 'You must be an admin to view this page.', variant: 'destructive' });
            router.push('/hub');
        }
    }, [user, isLoading, router, toast]);

    useEffect(() => {
        try {
            const storedAssociations = localStorage.getItem(STORAGE_KEY);
            if (storedAssociations) {
                setAssociations(JSON.parse(storedAssociations));
            }
        } catch (error) {
            console.error("Failed to load partner associations:", error);
            toast({ title: 'Error', description: 'Could not load partner associations.', variant: 'destructive' });
        } finally {
            setIsDataLoading(false);
        }
    }, [toast]);
    
    const saveAssociations = (newAssociations: Associations) => {
        setAssociations(newAssociations);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssociations));
    }
    
    const handleAddAssociation = () => {
        if (!selectedHub || !selectedBookingPartner) {
            toast({ title: 'Selection Missing', description: 'Please select both a hub and a booking partner.', variant: 'destructive'});
            return;
        }
        
        const newAssociations = {...associations};
        if (!newAssociations[selectedHub]) {
            newAssociations[selectedHub] = [];
        }
        
        if (newAssociations[selectedHub].includes(selectedBookingPartner)) {
            toast({ title: 'Already Linked', description: 'This booking partner is already linked to the selected hub.', variant: 'default'});
            return;
        }

        newAssociations[selectedHub].push(selectedBookingPartner);
        saveAssociations(newAssociations);
        toast({ title: 'Association Added', description: `${selectedBookingPartner} has been linked to ${selectedHub}.`});
        setSelectedBookingPartner(null);
    };
    
    const handleRemoveAssociation = (hubCode: string, partnerCode: string) => {
        const newAssociations = {...associations};
        newAssociations[hubCode] = newAssociations[hubCode].filter(p => p !== partnerCode);
        if(newAssociations[hubCode].length === 0) {
            delete newAssociations[hubCode];
        }
        saveAssociations(newAssociations);
        toast({ title: 'Association Removed', description: `${partnerCode} has been unlinked from ${hubCode}.`});
    }

    if (isLoading || isDataLoading || user?.role !== 'admin') {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const allPartnerCodes = users.map(u => u.partnerCode).filter((code): code is string => !!code);
    const hubPartners = Object.keys(associations);
    
    const availableBookingPartners = allPartnerCodes.filter(code => 
        selectedHub ? !associations[selectedHub]?.includes(code) : true
    );


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Partner Management</h1>
                <p className="text-muted-foreground">Link Hub Partners with their corresponding Booking Partners.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Create New Association</CardTitle>
                    <CardDescription>Select a Hub Partner and a Booking Partner to link them.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-4">
                     <Select value={selectedHub || ''} onValueChange={setSelectedHub}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Hub Partner" />
                        </SelectTrigger>
                        <SelectContent>
                             {allPartnerCodes.map(code => <SelectItem key={code} value={code}>{code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={selectedBookingPartner || ''} onValueChange={setSelectedBookingPartner} disabled={!selectedHub}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Booking Partner" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableBookingPartners.map(code => <SelectItem key={code} value={code}>{code}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Button onClick={handleAddAssociation} disabled={!selectedHub || !selectedBookingPartner}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                    </Button>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Existing Associations</CardTitle>
                    <CardDescription>Review and manage current partner links.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {hubPartners.length > 0 ? (
                        hubPartners.map(hubCode => (
                            <div key={hubCode} className="border p-4 rounded-lg">
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                    <Briefcase className="h-5 w-5 text-primary"/>
                                    Hub: <Badge>{hubCode}</Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">Is linked with the following booking partners:</p>
                                <div className="flex flex-wrap gap-2">
                                     {associations[hubCode].map(partnerCode => (
                                         <Badge key={partnerCode} variant="secondary" className="flex items-center gap-2">
                                            {partnerCode}
                                             <button onClick={() => handleRemoveAssociation(hubCode, partnerCode)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                                                 <Trash2 className="h-3 w-3 text-destructive"/>
                                             </button>
                                         </Badge>
                                     ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <Link2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Associations Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get started by linking a hub to a booking partner above.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

