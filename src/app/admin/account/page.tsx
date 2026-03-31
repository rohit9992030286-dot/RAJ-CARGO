
'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { KeyRound, Save, Upload, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, User } from '@/hooks/useAuth.tsx';
import { Label } from '@/components/ui/label';
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
import { saveAs } from 'file-saver';
import { Waybill } from '@/types/waybill';
import { Manifest } from '@/types/manifest';
import { InventoryItem } from '@/types/inventory';


function getBackupData() {
    const waybills = localStorage.getItem('yuwon-waybills') || '[]';
    const manifests = localStorage.getItem('yuwon-manifests') || '[]';
    const inventory = localStorage.getItem('yuwon-waybill-inventory') || '[]';
    const users = localStorage.getItem('yuwon-users') || '[]';
    const rates = localStorage.getItem('yuwon-state-rates') || '[]';
    const partnerAssoc = localStorage.getItem('yuwon-hub-partner-associations') || '{}';
    
    const allData = {
      waybills: JSON.parse(waybills),
      manifests: JSON.parse(manifests),
      waybillInventory: JSON.parse(inventory),
      users: JSON.parse(users),
      rates: JSON.parse(rates),
      partnerAssociations: JSON.parse(partnerAssoc),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(allData, null, 2);
}


const passwordFormSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function AccountSettingsPage() {
    const { user, users, updateUser } = useAuth();
    const { toast } = useToast();
    const importFileRef = useRef<HTMLInputElement>(null);

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onSubmit = (data: PasswordFormData) => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
            return;
        }

        const currentUserDetails = users.find(u => u.username === user.username);

        if (!currentUserDetails) {
            toast({ title: 'Error', description: 'Could not find current user details.', variant: 'destructive'});
            return;
        }

        const updatedUser = {
            ...currentUserDetails,
            password: data.newPassword
        };
        
        const success = updateUser(updatedUser);

        if (success) {
            toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
            form.reset();
        } else {
            toast({ title: 'Update Failed', description: 'Could not update your password.', variant: 'destructive' });
        }
    }
    
    const handleExportData = async () => {
        try {
          const allData = getBackupData();
          const filename = `yuwon_logistics_backup_${new Date().toISOString()}.json`;
          const dataBlob = new Blob([allData], { type: 'application/json' });
          
          // Upload to Vercel Blob
           const response = await fetch(`/api/upload?filename=${filename}`, {
                method: 'POST',
                body: dataBlob,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload backup to cloud.');
            }
          
          toast({
            title: 'Data Exported to Cloud',
            description: 'Backup has been uploaded successfully.',
          });
          
          // Also allow local download
          saveAs(dataBlob, filename);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Could not export your data.';
           toast({
            title: 'Error Exporting Data',
            description: errorMessage,
            variant: 'destructive',
          });
        }
    };
    
    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const data = JSON.parse(text);
            
            const requiredKeys = ['waybills', 'manifests', 'waybillInventory', 'users', 'rates', 'partnerAssociations'];
            const hasAllKeys = requiredKeys.every(key => key in data);

            if (hasAllKeys) {
              // Waybills
              const existingWaybills: Waybill[] = JSON.parse(localStorage.getItem('yuwon-waybills') || '[]');
              const newWaybills = data.waybills || [];
              const existingWaybillNumbers = new Set(existingWaybills.map(w => w.waybillNumber));
              newWaybills.forEach((wb: Waybill) => {
                  if (!existingWaybillNumbers.has(wb.waybillNumber)) {
                      existingWaybills.push(wb);
                  }
              });
              localStorage.setItem('yuwon-waybills', JSON.stringify(existingWaybills));

              // Manifests
              const existingManifests: Manifest[] = JSON.parse(localStorage.getItem('yuwon-manifests') || '[]');
              const newManifests = data.manifests || [];
              const existingManifestNos = new Set(existingManifests.map(m => m.manifestNo));
              newManifests.forEach((m: Manifest) => {
                  if (!existingManifestNos.has(m.manifestNo)) {
                      existingManifests.push(m);
                  }
              });
              localStorage.setItem('yuwon-manifests', JSON.stringify(existingManifests));
              
              // Inventory
              const existingInventory: InventoryItem[] = JSON.parse(localStorage.getItem('yuwon-waybill-inventory') || '[]');
              const newInventory = data.waybillInventory || [];
              const existingInventoryNos = new Set(existingInventory.map(i => i.waybillNumber));
              newInventory.forEach((item: InventoryItem) => {
                  if (!existingInventoryNos.has(item.waybillNumber)) {
                      existingInventory.push(item);
                  }
              });
              localStorage.setItem('yuwon-waybill-inventory', JSON.stringify(existingInventory));
              
              // Users
              const existingUsers: User[] = JSON.parse(localStorage.getItem('yuwon-users') || '[]');
              const newUsers = data.users || [];
              const existingUsernames = new Set(existingUsers.map(u => u.username));
              newUsers.forEach((user: User) => {
                  if (!existingUsernames.has(user.username)) {
                      existingUsers.push(user);
                  }
              });
              localStorage.setItem('yuwon-users', JSON.stringify(existingUsers));
              
              // Rates
              const existingRates: any[] = JSON.parse(localStorage.getItem('yuwon-state-rates') || '[]');
              const newRates = data.rates || [];
              const existingRateKeys = new Set(existingRates.map(r => `${r.fromState}-${r.toState}`));
              newRates.forEach((rate: any) => {
                  const key = `${rate.fromState}-${rate.toState}`;
                  if (!existingRateKeys.has(key)) {
                      existingRates.push(rate);
                  }
              });
              localStorage.setItem('yuwon-state-rates', JSON.stringify(existingRates));
              
              // Partner Associations
              const existingAssoc = JSON.parse(localStorage.getItem('yuwon-hub-partner-associations') || '{"bookingToHub": {}, "hubToHub": {}, "hubToDelivery": {}}');
              const newAssoc = data.partnerAssociations || { bookingToHub: {}, hubToHub: {}, hubToDelivery: {} };
              
              Object.keys(newAssoc.bookingToHub || {}).forEach(key => {
                  if (!existingAssoc.bookingToHub[key]) {
                      existingAssoc.bookingToHub[key] = newAssoc.bookingToHub[key];
                  }
              });
              Object.keys(newAssoc.hubToHub || {}).forEach(key => {
                  if (!existingAssoc.hubToHub[key]) {
                      existingAssoc.hubToHub[key] = newAssoc.hubToHub[key];
                  }
              });
              Object.keys(newAssoc.hubToDelivery || {}).forEach(key => {
                  if (!existingAssoc.hubToDelivery[key]) {
                      existingAssoc.hubToDelivery[key] = newAssoc.hubToDelivery[key];
                  }
              });
              localStorage.setItem('yuwon-hub-partner-associations', JSON.stringify(existingAssoc));

              toast({
                title: 'Import Successful',
                description: 'New data has been merged from the backup file.',
              });
              setTimeout(() => window.location.reload(), 1000);
            } else {
              throw new Error('Invalid backup file. The file is missing one or more required data keys.');
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            toast({
              title: 'Import Failed',
              description: `Could not import data. Error: ${errorMessage}`,
              variant: 'destructive',
            });
          } finally {
            if (importFileRef.current) {
              importFileRef.current.value = '';
            }
          }
        };
        reader.readAsText(file);
    };


    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Account & Data Management</h1>
                <p className="text-muted-foreground">Manage your account credentials and application data.</p>
            </div>

            <Card>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Enter a new password for your account: <strong>{user?.username}</strong></CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <div className="relative">
                                            <FormControl><Input type="password" {...field} className="pl-10" /></FormControl>
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <div className="relative">
                                            <FormControl><Input type="password" {...field} className="pl-10" /></FormControl>
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="ml-auto">
                                <Save className="mr-2 h-4 w-4" /> Save New Password
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle>System Data Management</CardTitle>
                  <CardDescription>Backup and restore all application data. This includes all users, waybills, manifests, and settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                        <div>
                            <Label className="font-medium">Export All Data</Label>
                            <p className="text-sm text-muted-foreground">Save a backup file to the cloud and your local machine.</p>
                        </div>
                        <Button variant="outline" onClick={handleExportData}>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                            <Label className="font-medium">Import Data from Backup</Label>
                            <p className="text-sm text-muted-foreground">Add new data from a backup file. Existing data will be preserved.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will add new data from the backup file. Existing data with the same identifiers (e.g., waybill number, username) will not be changed. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => importFileRef.current?.click()}>
                                        Yes, Import and Merge Data
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <input
                            type="file"
                            ref={importFileRef}
                            className="hidden"
                            accept="application/json"
                            onChange={handleImportFileChange}
                        />
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
