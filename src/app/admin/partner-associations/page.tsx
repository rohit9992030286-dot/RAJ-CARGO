
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerAssociations } from '@/hooks/usePartnerAssociations';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Link2, BookCopy, Cpu, Save, Truck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type AssociationType = 'bookingToHub' | 'hubToHub' | 'hubToDelivery';

interface AssociationCardProps {
    title: string;
    description: string;
    fromPartners: { partnerCode: string; username: string; }[];
    toPartners: { partnerCode: string; username: string; }[];
    fromIcon: React.ElementType;
    toIcon: React.ElementType;
    associationType: AssociationType;
}

function AssociationCard({ title, description, fromPartners, toPartners, fromIcon: FromIcon, toIcon: ToIcon, associationType }: AssociationCardProps) {
    const { associations, setAssociation, isLoaded } = usePartnerAssociations();
    const [localAssociations, setLocalAssociations] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const handleSelectChange = (fromCode: string, toCode: string) => {
        setLocalAssociations(prev => ({ ...prev, [fromCode]: toCode }));
    };

    const handleSaveChanges = () => {
        Object.entries(localAssociations).forEach(([fromCode, toCode]) => {
            setAssociation(associationType, fromCode, toCode);
        });
        toast({ title: `${title} Associations Saved`, description: "Your changes have been saved successfully." });
        setLocalAssociations({});
    };

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (fromPartners.length === 0 || toPartners.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Not enough partners with the required roles to configure this association. 
                        Please ensure you have at least one '{associationType.split('To')[0].replace('booking', 'booking partner')}' and one '{associationType.split('To')[1].toLowerCase()}' user.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>From Partner</TableHead>
                            <TableHead>Route to Partner</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fromPartners.map(fromPartner => {
                            const currentToPartner = localAssociations[fromPartner.partnerCode] ?? associations[associationType]?.[fromPartner.partnerCode];
                            return (
                                <TableRow key={fromPartner.partnerCode}>
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2">
                                            <FromIcon className="h-5 w-5 text-primary" />
                                            {fromPartner.username} <Badge variant="outline">{fromPartner.partnerCode}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={currentToPartner}
                                            onValueChange={(toCode) => handleSelectChange(fromPartner.partnerCode, toCode)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {toPartners.map(toPartner => (
                                                    <SelectItem key={toPartner.partnerCode} value={toPartner.partnerCode}>
                                                        <div className="flex items-center gap-2">
                                                            <ToIcon className="h-4 w-4" />
                                                            {toPartner.username} ({toPartner.partnerCode})
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
    );
}

export default function PartnerAssociationPage() {
    const { users, isLoading: usersLoading } = useAuth();
    const { isLoaded: associationsLoaded } = usePartnerAssociations();

    const { bookingPartners, hubPartners, deliveryPartners } = useMemo(() => {
        const bookingPartners = users
            .filter(u => u.roles.includes('booking') && u.partnerCode)
            .map(u => ({ partnerCode: u.partnerCode!, username: u.username }));
        const hubPartners = users
            .filter(u => u.roles.includes('hub') && u.partnerCode)
            .map(u => ({ partnerCode: u.partnerCode!, username: u.username }));
        const deliveryPartners = users
            .filter(u => u.roles.includes('delivery') && u.partnerCode)
            .map(u => ({ partnerCode: u.partnerCode!, username: u.username }));

        return { bookingPartners, hubPartners, deliveryPartners };
    }, [users]);
    
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
                <p className="text-muted-foreground">Define the default routing logic between all partners in your network.</p>
            </div>

            <Tabs defaultValue="bookingToHub">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bookingToHub"><BookCopy className="mr-2 h-4 w-4" /> Booking → Hub</TabsTrigger>
                    <TabsTrigger value="hubToHub"><Cpu className="mr-2 h-4 w-4" /> Hub → Hub</TabsTrigger>
                    <TabsTrigger value="hubToDelivery"><Truck className="mr-2 h-4 w-4" /> Hub → Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="bookingToHub">
                    <AssociationCard
                        title="Booking Partner to Hub Routing"
                        description="When a booking partner creates a manifest, it will be routed to the selected hub."
                        fromPartners={bookingPartners}
                        toPartners={hubPartners}
                        fromIcon={BookCopy}
                        toIcon={Cpu}
                        associationType="bookingToHub"
                    />
                </TabsContent>
                <TabsContent value="hubToHub">
                    <AssociationCard
                        title="Hub to Hub Routing"
                        description="For multi-stage journeys, define the next hub in the transit chain."
                        fromPartners={hubPartners}
                        toPartners={hubPartners}
                        fromIcon={Cpu}
                        toIcon={Cpu}
                        associationType="hubToHub"
                    />
                </TabsContent>
                <TabsContent value="hubToDelivery">
                     <AssociationCard
                        title="Hub to Delivery Partner Routing"
                        description="Assign a final delivery partner to a hub for last-mile delivery."
                        fromPartners={hubPartners}
                        toPartners={deliveryPartners}
                        fromIcon={Cpu}
                        toIcon={Truck}
                        associationType="hubToDelivery"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
