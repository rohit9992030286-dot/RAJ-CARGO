
'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { KeyRound, Save, Download, Upload, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth.tsx';
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
import { put } from "@vercel/blob";


function getBackupData() {
    const waybills = localStorage.getItem('rajcargo-waybills') || '[]';
    const manifests = localStorage.getItem('rajcargo-manifests') || '[]';
    const inventory = localStorage.getItem('rajcargo-waybill-inventory') || '[]';
    const users = localStorage.getItem('rajcargo-users') || '[]';
    const rates = localStorage.getItem('rajcargo-pincode-rates') || '[]';
    const partnerAssoc = localStorage.getItem('rajcargo-hub-partner-associations') || '{}';
    
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
          const filename = `rajcargo_backup_${new Date().toISOString()}.json`;
          
          // Upload to Vercel Blob
          const { url } = await put(filename, allData, { access: 'public' });
          
          toast({
            title: 'Data Exported to Cloud',
            description: 'Backup has been uploaded successfully.',
          });
          
          // Also allow local download
          const blob = new Blob([allData], { type: 'application/json' });
          saveAs(blob, filename);

        } catch (error) {
           toast({
            title: 'Error Exporting Data',
            description: 'Could not export your data.',
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
              localStorage.setItem('rajcargo-waybills', JSON.stringify(data.waybills || []));
              localStorage.setItem('rajcargo-manifests', JSON.stringify(data.manifests || []));
              localStorage.setItem('rajcargo-waybill-inventory', JSON.stringify(data.waybillInventory || []));
              localStorage.setItem('rajcargo-users', JSON.stringify(data.users || []));
              localStorage.setItem('rajcargo-pincode-rates', JSON.stringify(data.rates || []));
              localStorage.setItem('rajcargo-hub-partner-associations', JSON.stringify(data.partnerAssociations || {}));
              
              toast({
                title: 'Import Successful',
                description: 'All system data has been restored from the backup file.',
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
                            <p className="text-sm text-muted-foreground">Restore data from a backup file. This will overwrite ALL existing data.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import & Overwrite Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will overwrite all current system data with the contents of the backup file. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => importFileRef.current?.click()}>
                                        Yes, Overwrite and Import
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
