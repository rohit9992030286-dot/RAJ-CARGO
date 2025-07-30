
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, Building, Phone, MapPin, User } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

function ConfigurationPageContent() {
    const { toast } = useToast();

    const senderForm = useForm({
        defaultValues: {
        senderName: '',
        senderAddress: '',
        senderCity: '',
        senderPincode: '',
        senderPhone: '',
        },
    });

    useEffect(() => {
        try {
            const sender = JSON.parse(localStorage.getItem('rajcargo-defaultSender') || '{}');
            senderForm.reset(sender);
        } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSenderSubmit = (data: any) => {
        try {
            localStorage.setItem('rajcargo-defaultSender', JSON.stringify(data));
            toast({ title: 'Default Sender Saved', description: 'This information will be pre-filled in new waybills.'});
        } catch (error) {
            toast({ title: 'Save Failed', description: 'Could not save default sender information.', variant: 'destructive'});
        }
    };
  
    return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Configuration</h1>
        <p className="text-muted-foreground">Manage default sender information.</p>
      </div>

      <Card>
        <Form {...senderForm}>
            <form onSubmit={senderForm.handleSubmit(onSenderSubmit)}>
                <CardHeader>
                    <CardTitle>Default Sender Information</CardTitle>
                    <CardDescription>This info will be pre-filled when creating new waybills.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                     <FormField
                        control={senderForm.control}
                        name="senderName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Name</FormLabel>
                                 <div className="relative">
                                    <FormControl><Input {...field} className="pl-10" /></FormControl>
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={senderForm.control}
                        name="senderPhone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Phone</FormLabel>
                                 <div className="relative">
                                    <FormControl><Input {...field} className="pl-10" /></FormControl>
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderAddress"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Sender Address</FormLabel>
                                <div className="relative">
                                <FormControl><Input placeholder="Enter address" {...field} className="pl-10" /></FormControl>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderPincode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender Pincode</FormLabel>
                                <div className="relative">
                                <FormControl><Input {...field} className="pl-10" /></FormControl>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={senderForm.control}
                        name="senderCity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sender City</FormLabel>
                                 <div className="relative">
                                <FormControl><Input {...field} className="pl-10" /></FormControl>
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="ml-auto">
                        <Save className="mr-2 h-4 w-4" /> Save Default Sender
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>

    </div>
  );
}


export default function ConfigurationPage() {
    return <ConfigurationPageContent />;
}
