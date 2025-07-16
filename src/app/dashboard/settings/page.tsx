
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, Trash2, Save, User, KeyRound, Download, Upload, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWaybillInventory } from '@/hooks/useWaybillInventory';
import { saveAs } from 'file-saver';


type Theme = 'light' | 'dark' | 'system';
type StickerSize = '4x6' | '3x2' | '75mm' | '100x75mm';

function getBackupData() {
    const waybills = localStorage.getItem('ss-cargo-waybills') || '[]';
    const manifests = localStorage.getItem('ss-cargo-manifests') || '[]';
    const inventory = localStorage.getItem('ss-cargo-waybill-inventory') || '[]';
    const allData = {
      waybills: JSON.parse(waybills),
      manifests: JSON.parse(manifests),
      waybillInventory: JSON.parse(inventory),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(allData, null, 2);
}


function SettingsPageContent() {
  const { toast } = useToast();
  const { updateCredentials } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [stickerSize, setStickerSize] = useState<StickerSize>('75mm');
  const importFileRef = useRef<HTMLInputElement>(null);

  const accountForm = useForm({
    defaultValues: { username: '', password: '' },
  });


  useEffect(() => {
    const storedTheme = localStorage.getItem('ss-cargo-theme') as Theme | null;
    if (storedTheme) setTheme(storedTheme);

    const storedStickerSize = localStorage.getItem('ss-cargo-stickerSize') as StickerSize | null;
    if (storedStickerSize) setStickerSize(storedStickerSize);

    try {
        const creds = JSON.parse(localStorage.getItem('ss-cargo-credentials') || '{}');
        accountForm.reset({ username: creds.username || 'admin', password: '' });
    } catch { /* ignore */ }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('ss-cargo-theme', newTheme);
    if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    toast({
      title: 'Theme Updated',
      description: `Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme.`,
    });
  };

  const handleStickerSizeChange = (newSize: StickerSize) => {
    setStickerSize(newSize);
    localStorage.setItem('ss-cargo-stickerSize', newSize);
    toast({
      title: 'Sticker Size Updated',
      description: `Default print size set to ${newSize}.`,
    });
  };

  const onAccountSubmit = (data: any) => {
    if (updateCredentials(data.username, data.password)) {
        toast({ title: 'Credentials Updated', description: 'Your login details have been changed.'});
        accountForm.reset({ ...data, password: ''});
    } else {
        toast({ title: 'Update Failed', description: 'Please provide both a username and password.', variant: 'destructive' });
    }
  };

  const handleClearData = () => {
    try {
      localStorage.removeItem('ss-cargo-waybills');
      localStorage.removeItem('ss-cargo-manifests');
      localStorage.removeItem('ss-cargo-waybill-inventory');
      toast({
        title: 'Application Data Cleared',
        description: 'All waybills, manifests, and inventory have been deleted.',
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: 'Error Clearing Data',
        description: 'Could not clear application data from local storage.',
        variant: 'destructive',
      });
    }
  };

  const handleExportData = () => {
    try {
      const allData = getBackupData();
      const blob = new Blob([allData], { type: 'application/json' });
      saveAs(blob, 'ss_cargo_backup.json');
      toast({
        title: 'Data Exported',
        description: 'Your data has been saved to ss_cargo_backup.json.',
      });

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

        if (Array.isArray(data.waybills) && Array.isArray(data.manifests) && Array.isArray(data.waybillInventory)) {
          localStorage.setItem('ss-cargo-waybills', JSON.stringify(data.waybills));
          localStorage.setItem('ss-cargo-manifests', JSON.stringify(data.manifests));
          localStorage.setItem('ss-cargo-waybill-inventory', JSON.stringify(data.waybillInventory));
          toast({
            title: 'Import Successful',
            description: 'Your data has been restored from the backup file.',
          });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error('Invalid JSON structure. The file must contain waybills, manifests, and waybillInventory arrays.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast({
          title: 'Import Failed',
          description: `Could not import data. Please check the file format. Error: ${errorMessage}`,
          variant: 'destructive',
        });
      } finally {
        // Reset file input to allow re-selection of the same file
        if (importFileRef.current) {
          importFileRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and data.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Theme</Label>
                  <RadioGroup value={theme} onValueChange={(value: Theme) => handleThemeChange(value)} className="grid grid-cols-3 gap-4 mt-2">
                      <Label htmlFor="theme-light" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                          <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                          <Sun className="h-6 w-6 mb-2" />
                          <span>Light</span>
                      </Label>
                      <Label htmlFor="theme-dark" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                          <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                          <Moon className="h-6 w-6 mb-2" />
                          <span>Dark</span>
                      </Label>
                      <Label htmlFor="theme-system" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                          <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mb-2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                          <span>System</span>
                      </Label>
                  </RadioGroup>
                </div>
                <div>
                   <Label className="font-medium">Sticker Print Size</Label>
                   <RadioGroup value={stickerSize} onValueChange={(value: StickerSize) => handleStickerSizeChange(value)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                        <Label htmlFor="size-4x6" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="4x6" id="size-4x6" className="sr-only" />
                           <span className="font-bold text-lg">4" x 6"</span>
                           <span className="text-xs text-muted-foreground">Large</span>
                       </Label>
                       <Label htmlFor="size-3x2" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="3x2" id="size-3x2" className="sr-only" />
                           <span className="font-bold text-lg">3" x 2"</span>
                            <span className="text-xs text-muted-foreground">Medium</span>
                       </Label>
                       <Label htmlFor="size-75mm" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="75mm" id="size-75mm" className="sr-only" />
                           <span className="font-bold text-lg">75mm</span>
                           <span className="text-xs text-muted-foreground">Square</span>
                       </Label>
                       <Label htmlFor="size-100x75mm" className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                           <RadioGroupItem value="100x75mm" id="size-100x75mm" className="sr-only" />
                           <span className="font-bold text-lg">100x75mm</span>
                           <span className="text-xs text-muted-foreground">Rectangle</span>
                       </Label>
                   </RadioGroup>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>Update your login credentials.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={accountForm.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input {...field} className="pl-10" />
                                        </FormControl>
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={accountForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type="password" {...field} className="pl-10" placeholder="Enter new password" />
                                        </FormControl>
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Credentials
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage application data stored in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
                <div>
                    <Label className="font-medium">Export All Data</Label>
                    <p className="text-sm text-muted-foreground">Save a JSON backup file to your local machine.</p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
                <div>
                    <Label className="font-medium">Import Data from JSON</Label>
                    <p className="text-sm text-muted-foreground">Restore data from a backup file. This will overwrite existing data.</p>
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
                            <AlertDialogTitle>Are you sure you want to import data?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will overwrite all current waybills, manifests, and inventory with the data from the selected file. This action cannot be undone.
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
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
                <Label className="font-medium">Clear All Local Data</Label>
                <p className="text-sm text-muted-foreground">This will permanently delete all waybills, manifests, and inventory.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your waybill, manifest, and inventory data from this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function SettingsPage() {
  const { isInventoryLoaded } = useWaybillInventory();

  if (!isInventoryLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <SettingsPageContent />;
}
